import ShopWithSidebar from "@/components/ShopWithSidebar";
import FaqSection from "@/components/Home/Faq";
import Newsletter from "@/components/Common/Newsletter";
import { medusaClient } from "@/lib/medusa/client";
import { convertMedusaToSanityProduct } from "@/lib/medusa/products";
import { convertMedusaToSanityCategory } from "@/lib/medusa/categories";
import { getProducts, convertWCToSanityProduct } from "@/lib/woocommerce/products";
import { getWooCommerceCategories } from "@/lib/woocommerce/categories";
import { isWooCommerceEnabled } from "@/lib/woocommerce/config";
import { getFaq } from "@/lib/data/shop-utils";
import { Metadata } from 'next';

// Force dynamic rendering to prevent static generation in production
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: 'Shop Page | ZDA Communications',
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

  // Fetch products and categories from WooCommerce or Medusa
  let allProducts: any[] = [];
  let categories: any[] = [];
  let allProductsCount = 0;

  const useWooCommerce = isWooCommerceEnabled();

  // Log configuration for debugging (server-side only)
  if (typeof window === 'undefined') {
    console.log("[ShopPage] ========================================");
    if (useWooCommerce) {
      console.log("[ShopPage] Using WooCommerce for products");
      console.log("[ShopPage] WC_API_URL:", process.env.NEXT_PUBLIC_WC_API_URL || "NOT SET");
    } else {
      console.log("[ShopPage] Using Medusa for products");
      const backendUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || process.env.MEDUSA_BACKEND_URL || "not set";
      console.log("[ShopPage] Backend URL:", backendUrl);
    }
    console.log("[ShopPage] ========================================");
  }

  try {
    if (useWooCommerce) {
      // Fetch from WooCommerce
      console.log("[ShopPage] Fetching products from WooCommerce...");
      
      const [productsResponse, categoriesResponse] = await Promise.allSettled([
        getProducts({ per_page: 100 }),
        getWooCommerceCategories(),
      ]);

      // Handle products
      if (productsResponse.status === 'fulfilled') {
        const wcProducts = productsResponse.value;
        if (wcProducts && wcProducts.length > 0) {
          // Filter out hidden products (already filtered in getProducts, but double-check here)
          const visibleProducts = wcProducts.filter((p: any) => p.catalog_visibility !== "hidden");
          // Convert products (now async to fetch variations)
          allProducts = await Promise.all(visibleProducts.map(convertWCToSanityProduct));
          allProductsCount = allProducts.length;
          console.log(`[ShopPage] Successfully fetched ${allProducts.length} visible products from WooCommerce (${wcProducts.length - visibleProducts.length} hidden products filtered out)`);
        } else {
          console.warn("[ShopPage] No products in WooCommerce");
          allProducts = [];
        }
      } else {
        console.error("[ShopPage] Error fetching products from WooCommerce:", productsResponse.reason);
        allProducts = [];
      }

      // Handle categories
      if (categoriesResponse.status === 'fulfilled') {
        categories = categoriesResponse.value;
        console.log(`[ShopPage] Successfully fetched ${categories.length} categories from WooCommerce`);
      } else {
        console.error("[ShopPage] Error fetching categories from WooCommerce:", categoriesResponse.reason);
        categories = [];
      }
    } else {
      // Fetch from Medusa (original code)
      console.log("[ShopPage] Fetching products from Medusa...");
      
      const [productsResponse, categoriesResponse, countResponse] = await Promise.allSettled([
        medusaClient.getProducts({
          limit: 100,
          fields: "*variants.calculated_price,*categories",
        }),
        medusaClient.getCategories(),
        medusaClient.getProducts({ limit: 1 }),
      ]);

      // Handle products
      if (productsResponse.status === 'fulfilled') {
        const productsData = productsResponse.value;
        if (productsData?.products && productsData.products.length > 0) {
          allProducts = productsData.products.map(convertMedusaToSanityProduct);
          console.log(`[ShopPage] Successfully fetched ${allProducts.length} products from Medusa`);
        } else {
          console.warn("[ShopPage] No products in Medusa response");
          allProducts = [];
        }
      } else {
        console.error("[ShopPage] Error fetching products from Medusa:", productsResponse.reason);
        allProducts = [];
      }

      // Handle categories
      if (categoriesResponse.status === 'fulfilled') {
        const categoriesData = categoriesResponse.value;
        const product_categories = categoriesData?.product_categories || (categoriesData as any)?.categories || [];
        
        if (product_categories.length > 0) {
          const converted = product_categories.map((cat: any) =>
            convertMedusaToSanityCategory(cat, product_categories)
          );
          categories = converted.filter((cat: any) => !cat.parent);
          console.log(`[ShopPage] Successfully fetched ${categories.length} categories from Medusa`);
        } else {
          categories = [];
        }
      } else {
        console.error("[ShopPage] Error fetching categories from Medusa:", categoriesResponse.reason);
        categories = [];
      }

      // Handle product count
      if (countResponse.status === 'fulfilled') {
        allProductsCount = countResponse.value?.count || allProducts.length;
      } else {
        allProductsCount = allProducts.length;
      }
    }
  } catch (error: any) {
    console.error("[ShopPage] Unexpected error:", {
      error: error?.message || String(error),
      stack: process.env.NODE_ENV !== 'production' ? error?.stack : undefined,
    });
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

  const faqData = await getFaq();

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
      <FaqSection faqData={faqData} />
      <Newsletter />
    </main>
  );
};

export default ShopWithSidebarPage;