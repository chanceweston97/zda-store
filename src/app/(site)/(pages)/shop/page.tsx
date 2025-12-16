import ShopWithSidebar from "@/components/ShopWithSidebar";
import {
  getAllProducts,
  getAllProductsCount,
  getCategoriesWithSubcategories,
} from "@/lib/data/unified-data";
import { Metadata } from 'next';

// Force dynamic rendering to prevent static generation in production
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: 'Shop Page | ZDAComm |  Store',
  description: 'This is Shop Page for ZDAComm Template',
  // other metadata
};

type PageProps = {
  searchParams: Promise<{
    category?: string;
    sizes?: string;
    minPrice?: string;
    maxPrice?: string;
    sort?: string;
  }>;
};

const ShopWithSidebarPage = async ({ searchParams }: PageProps) => {
  const { category, sizes, minPrice, maxPrice, sort } = await searchParams;

  // Fetch all products and categories (like front project)
  // Wrap in try-catch to prevent 500 errors if API calls fail
  let allProducts: any[] = [];
  let categories: any[] = [];
  let allProductsCount = 0;

  // Log Medusa configuration for debugging (server-side only)
  if (typeof window === 'undefined' && process.env.NODE_ENV !== 'production') {
    const { isMedusaEnabled } = await import("@/lib/medusa/config");
    console.log("[ShopPage] Medusa enabled:", isMedusaEnabled());
    console.log("[ShopPage] Backend URL:", process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL);
  }

  try {
    const results = await Promise.allSettled([
      getAllProducts(),
      getCategoriesWithSubcategories(),
      getAllProductsCount(),
    ]);

    // Handle products
    if (results[0].status === 'fulfilled') {
      allProducts = results[0].value || [];
      if (allProducts.length === 0) {
        console.warn("[ShopPage] getAllProducts returned empty array - check Medusa connection and product data");
      }
    } else {
      console.error("[ShopPage] Error fetching products:", results[0].reason);
      if (results[0].reason instanceof Error) {
        console.error("[ShopPage] Error message:", results[0].reason.message);
        console.error("[ShopPage] Error stack:", results[0].reason.stack);
      }
      // Fallback to empty array - will show "No products found"
    }

    // Handle categories
    if (results[1].status === 'fulfilled') {
      categories = results[1].value || [];
    } else {
      console.error("[ShopPage] Error fetching categories:", results[1].reason);
      categories = [];
    }

    // Handle product count
    if (results[2].status === 'fulfilled') {
      allProductsCount = results[2].value || 0;
    } else {
      console.error("[ShopPage] Error fetching product count:", results[2].reason);
      allProductsCount = allProducts.length; // Use array length as fallback
    }
  } catch (error: any) {
    console.error("[ShopPage] Unexpected error during data fetching:", {
      error: error?.message || String(error),
      stack: process.env.NODE_ENV !== 'production' ? error?.stack : undefined,
    });
    // Continue with empty arrays to prevent 500 error
  }

  // Helper function to find category by handle (supports nested search)
  const findCategoryByHandle = (cats: any[], handle: string): any => {
    for (const cat of cats) {
      const catHandle = (cat as any).handle || cat.slug?.current || cat.slug;
      if (catHandle === handle) {
        return cat;
      }
      const subcats = cat.subcategories || cat.category_children || [];
      if (subcats.length > 0) {
        const found = findCategoryByHandle(subcats, handle);
        if (found) return found;
      }
    }
    return null;
  };

  // OPTIMIZED SERVER-SIDE FILTERING: Single pass with efficient data structures
  // This is much faster than multiple filter passes
  let filteredProducts = allProducts;
  
  // Build category ID set for O(1) lookup (much faster than array.includes)
  const categoryIdSet = new Set<string>();
  if (category && allProducts.length > 0) {
    const categoryHandles = category.split(",").filter(Boolean);
    
    // Get all category IDs including subcategories
    categoryHandles.forEach((handle) => {
      const foundCategory = findCategoryByHandle(categories, handle);
      if (foundCategory) {
        const categoryId = foundCategory.id || foundCategory._id;
        if (categoryId) {
          categoryIdSet.add(categoryId);
          const subcats = foundCategory.subcategories || foundCategory.category_children || [];
          subcats.forEach((sub: any) => {
            const subId = sub.id || sub._id;
            if (subId) categoryIdSet.add(subId);
          });
        }
      }
    });
  }

  // Build size set for O(1) lookup
  const selectedSizesSet = sizes 
    ? new Set(sizes.split(",").filter(Boolean))
    : null;

  // Parse price filters once
  const minPriceNum = minPrice ? parseFloat(minPrice) : null;
  const maxPriceNum = maxPrice ? parseFloat(maxPrice) : null;

  // Single pass filtering: combine all filters in one iteration
  if (categoryIdSet.size > 0 || selectedSizesSet || minPriceNum !== null || maxPriceNum !== null) {
    filteredProducts = allProducts.filter((product: any) => {
      // Category filter
      if (categoryIdSet.size > 0) {
        const productCategoryIds = product.categories?.map((cat: any) => cat.id).filter(Boolean) || [];
        const matchesCategory = productCategoryIds.some((id: string) => categoryIdSet.has(id));
        if (!matchesCategory) return false;
      }

      // Size filter
      if (selectedSizesSet && selectedSizesSet.size > 0) {
        const productSizes = product.sizes || [];
        const matchesSize = Array.from(selectedSizesSet).some(size => productSizes.includes(size));
        if (!matchesSize) return false;
      }

      // Price filter
      if (minPriceNum !== null || maxPriceNum !== null) {
        const productPrice = product.price || 0;
        if (minPriceNum !== null && productPrice < minPriceNum) return false;
        if (maxPriceNum !== null && productPrice > maxPriceNum) return false;
      }

      return true;
    });
  }

  // Sort products only if sort parameter is provided
  if (sort === 'popular') {
    filteredProducts.sort((a, b) => {
      const aReviews = a.reviews?.length || 0;
      const bReviews = b.reviews?.length || 0;
      return bReviews - aReviews;
    });
  }

  return (
    <main>
      <ShopWithSidebar
        data={{
          allProducts,
          products: filteredProducts, // Pass filtered products from server
          categories,
          allProductsCount,
        }}
      />
    </main>
  );
};

export default ShopWithSidebarPage;