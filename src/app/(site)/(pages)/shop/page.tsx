import ShopWithSidebar from "@/components/ShopWithSidebar";
import Newsletter from "@/components/Common/Newsletter";
import { medusaClient } from "@/lib/medusa/client";
import { convertMedusaToSanityProduct } from "@/lib/medusa/products";
import { convertMedusaToSanityCategory } from "@/lib/medusa/categories";
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

  // Fetch products and categories from WooCommerce or Medusa
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
    } else {
      // Fetch from Medusa (original code)
      const [productsResponse, categoriesResponse, countResponse] = await Promise.allSettled([
        medusaClient.getProducts({
          limit: 100,
          fields: "*variants.calculated_price,*variants.sku,*categories",
        }),
        medusaClient.getCategories(),
        medusaClient.getProducts({ limit: 1 }),
      ]);

      // Handle products
      if (productsResponse.status === 'fulfilled') {
        const productsData = productsResponse.value;
        if (productsData?.products && productsData.products.length > 0) {
          allProducts = productsData.products.map(convertMedusaToSanityProduct);
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