import ShopWithSidebar from "@/components/ShopWithSidebar";
import Newsletter from "@/components/Common/Newsletter";
import { getProducts, convertWCToSanityProduct } from "@/lib/woocommerce/products";
import { getWooCommerceCategories } from "@/lib/woocommerce/categories";
import { isWooCommerceEnabled } from "@/lib/woocommerce/config";
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

  // Fetch products and categories from WooCommerce
  let allProducts: any[] = [];
  let categories: any[] = [];
  let allProductsCount = 0;

  const useWooCommerce = isWooCommerceEnabled();


  try {
    if (useWooCommerce) {
      // Fetch from WooCommerce
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
          // ✅ OPTIMIZATION: Skip variation fetching for listing pages (much faster)
          // Variations will be fetched on product detail pages when needed
          allProducts = await Promise.all(visibleProducts.map((p: any) => convertWCToSanityProduct(p, true)));
          allProductsCount = allProducts.length;
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
      } else {
        console.error("[ShopPage] Error fetching categories from WooCommerce:", categoriesResponse.reason);
        categories = [];
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

  // ✅ CLIENT-SIDE FILTERING: Pass all products to client for instant filtering
  // No server-side filtering needed - client will filter based on URL params
  // This makes filtering instant without server round-trips
  return (
    <main>
      <ShopWithSidebar
        data={{
          allProducts,
          products: allProducts, // Pass all products - client will filter
          categories,
          allProductsCount,
        }}
      />
      <Newsletter />
    </main>
  );
};

export default ShopWithSidebarPage;