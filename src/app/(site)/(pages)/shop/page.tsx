import ShopWithSidebar from "@/components/ShopWithSidebar";
import Newsletter from "@/components/Common/Newsletter";
import { getWooCommerceCategories } from "@/lib/woocommerce/categories";
import { isWooCommerceEnabled } from "@/lib/woocommerce/config";
import { Metadata } from 'next';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Products Page | ZDA Communications',
  description: 'This is Products Page for ZDA Communications',
  // other metadata
};

type PageProps = {
  searchParams: Promise<{
    category?: string;
  }>;
};

const ShopWithSidebarPage = async ({ searchParams }: PageProps) => {
  await searchParams;

  // Fetch categories from WooCommerce
  let categories: any[] = [];
  const products: any[] = [];
  const totalCount = 0;

  const useWooCommerce = isWooCommerceEnabled();


  try {
    if (useWooCommerce) {
      categories = await getWooCommerceCategories();
    }
  } catch (error: any) {
    console.error("[ShopPage] Unexpected error:", {
      error: error?.message || String(error),
      stack: process.env.NODE_ENV !== 'production' ? error?.stack : undefined,
    });
    categories = [];
  }

  return (
    <main>
      <ShopWithSidebar
        data={{
          products,
          categories,
          totalCount,
        }}
      />
      <Newsletter />
    </main>
  );
};

export default ShopWithSidebarPage;