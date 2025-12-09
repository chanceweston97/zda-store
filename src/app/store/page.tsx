import { Metadata } from "next"
import { listProducts, listProductsWithSort } from "@lib/data/products"
import { getRegion, listRegions } from "@lib/data/regions"
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

  // Try to get region - first try "us", then try first available region
  let region = await getRegion("us")
  
  // If "us" region not found, try to get the first available region
  if (!region) {
    try {
      const regions = await listRegions()
      if (regions && regions.length > 0) {
        // Get the first region
        region = regions[0]
      }
    } catch (error) {
      console.error("Error fetching regions:", error)
    }
  }
  
  if (!region) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-lg text-[#2958A4] mb-2">Unable to load products.</p>
          <p className="text-sm text-gray-600">
            Please make sure regions are set up in your Medusa Admin panel.
          </p>
        </div>
      </div>
    )
  }

  const sort = sortBy || "created_at"
  const countryCode = region.countries?.[0]?.iso_2?.toLowerCase() || "us"

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
  try {
    const allProductsResult = await listProducts({
      pageParam: 1,
      queryParams: {
        limit: 1000, // Get a large batch to show all products
        fields: "*variants.calculated_price,+variants.inventory_quantity,*variants.images,+metadata,+tags,*categories",
        // Note: Medusa store API only returns published products by default
      },
      countryCode: countryCode,
    })
    allProducts = allProductsResult.response.products || []
    allProductsCount = allProductsResult.response.count || 0
    
    // Debug logging - always log in development
    console.log("🔍 Store Page Debug:", {
      countryCode,
      regionId: region.id,
      regionName: region.name,
      productsFetched: allProducts.length,
      totalCount: allProductsCount,
      firstProduct: allProducts[0] ? {
        id: allProducts[0].id,
        title: allProducts[0].title,
        handle: allProducts[0].handle,
        status: allProducts[0].status,
        variantCount: allProducts[0].variants?.length || 0,
        hasPrice: allProducts[0].variants?.some((v: any) => v.calculated_price?.calculated_amount) || false,
        categories: allProducts[0].categories?.map((c: any) => c.name),
      } : null,
    })

    // Additional debugging if no products
    if (allProducts.length === 0) {
      console.warn("⚠️ No products returned from API. Possible reasons:")
      console.warn("   1. No products created in Medusa Admin")
      console.warn("   2. Products are not PUBLISHED (status must be 'published')")
      console.warn("   3. Products have no variants with prices")
      console.warn("   4. Products are not available in the region")
      console.warn("   5. Region ID mismatch:", region.id)
    }
  } catch (error: any) {
    console.error("❌ Error fetching all products:", error)
    console.error("Error details:", error.message, error.stack)
    allProducts = []
    allProductsCount = 0
  }

  // Filter products by category if specified (server-side filtering like sanity)
  let filteredProducts = allProducts
  if (category) {
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

  // Debug: Log if no products found
  if (sortedProducts.length === 0 && process.env.NODE_ENV === "development") {
    console.warn("Store Page: No products found", {
      allProductsCount,
      filteredProductsCount: filteredProducts.length,
      sortedProductsCount: sortedProducts.length,
      countryCode,
      regionId: region.id,
    })
  }

  // Always render ShopWithSidebar (like Sanity project) - it handles empty state internally
  return (
    <main>
      <ShopWithSidebar
        products={sortedProducts}
        categories={categories}
        region={region}
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

