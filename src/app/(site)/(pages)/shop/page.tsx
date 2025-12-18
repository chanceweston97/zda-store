import ShopWithSidebar from "@/components/ShopWithSidebar";
import { medusaClient } from "@/lib/medusa/client";
import { convertMedusaToSanityProduct } from "@/lib/medusa/products";
import { convertMedusaToSanityCategory } from "@/lib/medusa/categories";
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

  // Fetch products and categories directly from Medusa backend API
  // No fallback to local data - call backend API directly
  let allProducts: any[] = [];
  let categories: any[] = [];
  let allProductsCount = 0;

  // Log Medusa configuration for debugging (server-side only)
  // ALWAYS log in production to help debug
  if (typeof window === 'undefined') {
    const backendUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || process.env.MEDUSA_BACKEND_URL || "not set";
    console.log("[ShopPage] ========================================");
    console.log("[ShopPage] Fetching products directly from Medusa backend API");
    console.log("[ShopPage] Backend URL:", backendUrl);
    console.log("[ShopPage] NODE_ENV:", process.env.NODE_ENV);
    console.log("[ShopPage] NEXT_PUBLIC_MEDUSA_BACKEND_URL:", process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "NOT SET");
    console.log("[ShopPage] MEDUSA_BACKEND_URL:", process.env.MEDUSA_BACKEND_URL || "NOT SET");
    console.log("[ShopPage] NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY:", process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY ? `${process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY.substring(0, 20)}... (${process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY.length} chars)` : "NOT SET");
    
    // CRITICAL: Check if using localhost in production
    if (process.env.NODE_ENV === 'production' && backendUrl.includes('localhost')) {
      console.error("[ShopPage] ❌❌❌ CRITICAL ERROR: Using localhost in production! ❌❌❌");
      console.error("[ShopPage] This will FAIL on the server!");
      console.error("[ShopPage] Set NEXT_PUBLIC_MEDUSA_BACKEND_URL=http://18.224.229.214:9000 in .env.local");
      console.error("[ShopPage] Then rebuild: yarn build");
    }
    console.log("[ShopPage] ========================================");
  }

  try {
    // Call Medusa API directly - bypass isMedusaEnabled() check
    console.log("[ShopPage] Calling medusaClient.getProducts() directly...");
    
    // Fetch products and categories in parallel
    const [productsResponse, categoriesResponse, countResponse] = await Promise.allSettled([
      // Fetch products directly from Medusa backend API
      medusaClient.getProducts({
        limit: 100,
        fields: "*variants.calculated_price,*categories",
      }),
      // Fetch categories directly from Medusa backend API
      medusaClient.getCategories(),
      // Get product count
      medusaClient.getProducts({ limit: 1 }),
    ]);

    // Handle products
    if (productsResponse.status === 'fulfilled') {
      const productsData = productsResponse.value;
      if (productsData?.products && productsData.products.length > 0) {
        // Convert Medusa products to Sanity format
        allProducts = productsData.products.map(convertMedusaToSanityProduct);
        console.log(`[ShopPage] Successfully fetched ${allProducts.length} products from Medusa backend`);
      } else {
        console.warn("[ShopPage] No products in Medusa response - check if products exist in database");
        allProducts = [];
      }
    } else {
      console.error("[ShopPage] Error fetching products from Medusa backend:", productsResponse.reason);
      if (productsResponse.reason instanceof Error) {
        console.error("[ShopPage] Error message:", productsResponse.reason.message);
        console.error("[ShopPage] Error stack:", productsResponse.reason.stack);
        if ((productsResponse.reason as any).url) {
          console.error("[ShopPage] Failed URL:", (productsResponse.reason as any).url);
        }
      }
      allProducts = [];
    }

    // Handle categories
    if (categoriesResponse.status === 'fulfilled') {
      const categoriesData = categoriesResponse.value;
      const product_categories = categoriesData?.product_categories || (categoriesData as any)?.categories || [];
      
      if (product_categories.length > 0) {
        // Convert all categories
        const converted = product_categories.map((cat: any) =>
          convertMedusaToSanityCategory(cat, product_categories)
        );
        // Filter to only return top-level categories (no parent)
        categories = converted.filter((cat: any) => !cat.parent);
        console.log(`[ShopPage] Successfully fetched ${categories.length} categories from Medusa backend`);
      } else {
        console.warn("[ShopPage] No categories in Medusa response");
        categories = [];
      }
    } else {
      console.error("[ShopPage] Error fetching categories from Medusa backend:", categoriesResponse.reason);
      if (categoriesResponse.reason instanceof Error) {
        console.error("[ShopPage] Error message:", categoriesResponse.reason.message);
        if ((categoriesResponse.reason as any).url) {
          console.error("[ShopPage] Failed URL:", (categoriesResponse.reason as any).url);
        }
      }
      categories = [];
    }

    // Handle product count
    if (countResponse.status === 'fulfilled') {
      allProductsCount = countResponse.value?.count || allProducts.length;
      console.log(`[ShopPage] Product count from Medusa backend: ${allProductsCount}`);
    } else {
      console.error("[ShopPage] Error fetching product count from Medusa backend:", countResponse.reason);
      allProductsCount = allProducts.length; // Use array length as fallback
    }
  } catch (error: any) {
    console.error("[ShopPage] Unexpected error during Medusa API calls:", {
      error: error?.message || String(error),
      stack: process.env.NODE_ENV !== 'production' ? error?.stack : undefined,
    });
    // Continue with empty arrays to prevent 500 error
    allProducts = [];
    categories = [];
    allProductsCount = 0;
  }

  // OPTIMIZED: Build a map of handle -> category for O(1) lookup instead of recursive search
  // This is much faster than calling findCategoryByHandle in a loop
  const categoryMap = new Map<string, any>();
  const buildCategoryMap = (cats: any[]) => {
    cats.forEach((cat) => {
      const catHandle = (cat as any).handle || cat.slug?.current || cat.slug;
      if (catHandle) {
        categoryMap.set(catHandle, cat);
      }
      const subcats = cat.subcategories || cat.category_children || [];
      if (subcats.length > 0) {
        buildCategoryMap(subcats);
      }
    });
  };
  buildCategoryMap(categories);

  // OPTIMIZED SERVER-SIDE FILTERING: Single pass with efficient data structures
  // This is much faster than multiple filter passes
  let filteredProducts = allProducts;
  
  // Build category ID set for O(1) lookup (much faster than array.includes)
  const categoryIdSet = new Set<string>();
  if (category && allProducts.length > 0) {
    const categoryHandles = category.split(",").filter(Boolean);
    
    // Get all category IDs including subcategories using the map (O(1) lookup)
    categoryHandles.forEach((handle) => {
      const foundCategory = categoryMap.get(handle);
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