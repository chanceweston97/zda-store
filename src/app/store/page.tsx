import { Metadata } from "next"
import { listProducts } from "@lib/data/products"
import { listRegions } from "@lib/data/regions"
import { listCategories } from "@lib/data/categories"
import ShopWithSidebar from "@components/Store/ShopWithSidebar"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"

export const metadata: Metadata = {
  title: "Store | ZDAComm",
  description: "Explore all of our products.",
}

type Params = {
  searchParams: Promise<{
    sortBy?: SortOptions
    page?: string
    category?: string
  }>
}

export default async function StorePage(props: Params) {
  const searchParams = await props.searchParams
  const { sortBy, page, category } = searchParams

  const sort = sortBy || "created_at"
  
  // Try to get a region for display purposes, but don't require it
  let region = null
  try {
    const regions = await listRegions()
    if (regions && regions.length > 0) {
      region = regions[0] // Use first available region
    } else {
      console.warn("⚠️ [SERVER] No regions found in backend")
    }
  } catch (error: any) {
    console.error("⚠️ [SERVER] Error fetching regions in StorePage:", {
      message: error?.message,
      status: error?.response?.status,
    })
    // Proceed without region - listProducts will try to fetch regions itself
  }

  // Fetch all categories with subcategories (like sanity does)
  let categories: any[] = []
  let allProducts: any[] = []
  let allProductsCount = 0

  try {
    categories = await listCategories()
    // Organize categories with parent/child relationships
    const categoryMap = new Map()
    categories.forEach((cat) => {
      categoryMap.set(cat.id, { ...cat, subcategories: [] })
    })
    // Build hierarchy
    categories.forEach((cat) => {
      if (cat.parent_category_id && categoryMap.has(cat.parent_category_id)) {
        const parent = categoryMap.get(cat.parent_category_id)
        parent.subcategories.push(cat)
      }
    })
    // Get only top-level categories
    categories = Array.from(categoryMap.values()).filter(
      (cat) => !cat.parent_category_id
    )
  } catch (error) {
    console.error("Error fetching categories:", error)
  }

  // Fetch all products first (like sanity does with getAllProducts)
  // Don't pass countryCode - let listProducts handle region automatically
  try {
    const allProductsResult = await listProducts({
      pageParam: 1,
      queryParams: {
        limit: 1000, // Get a large batch to show all products
        fields: "*variants.calculated_price,+variants.inventory_quantity,*variants.images,+metadata,+tags,*categories",
        // Note: Medusa store API only returns published products by default
      },
      // No countryCode or regionId - listProducts will handle it
    })
    
    allProducts = allProductsResult.response.products || []
    allProductsCount = allProductsResult.response.count || 0
  } catch (error: any) {
    console.error("Error fetching all products:", error)
    allProducts = []
    allProductsCount = 0
  }

  // Filter products by category if specified (server-side filtering like sanity)
  let filteredProducts = allProducts
  if (category && allProducts.length > 0) {
    const categoryHandles = category.split(",")
    
    // Get all category IDs including subcategories
    const allCategoryIds: string[] = []
    categoryHandles.forEach((handle) => {
      const foundCategory = findCategoryByHandle(categories, handle)
      if (foundCategory) {
        if (foundCategory.subcategories && foundCategory.subcategories.length > 0) {
          // Include parent and all subcategories
          allCategoryIds.push(foundCategory.id)
          foundCategory.subcategories.forEach((sub: any) => {
            allCategoryIds.push(sub.id)
          })
        } else {
          allCategoryIds.push(foundCategory.id)
        }
      }
    })

    filteredProducts = allProducts.filter((product) => {
      // Check if product belongs to any of the selected categories
      const productCategoryIds = product.categories?.map((cat: any) => cat.id) || []
      return productCategoryIds.some((id: string) => allCategoryIds.includes(id))
    })
  }

  // Sort filtered products
  const { sortProducts } = await import("@lib/util/sort-products")
  const sortedProducts = sortProducts(filteredProducts, sort)

  // Always render ShopWithSidebar (like Sanity project) - it handles empty state internally
  return (
    <main>
      <ShopWithSidebar
        products={sortedProducts}
        categories={categories}
        region={region || undefined}
        totalCount={allProductsCount}
        allProducts={allProducts}
      />
    </main>
  )
}

// Helper function to find category by handle (supports nested search)
function findCategoryByHandle(categories: any[], handle: string): any {
  for (const cat of categories) {
    if (cat.handle === handle) {
      return cat
    }
    if (cat.subcategories && cat.subcategories.length > 0) {
      const found = findCategoryByHandle(cat.subcategories, handle)
      if (found) return found
    }
  }
  return null
}

