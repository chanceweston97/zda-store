import ProductsPageWithCategoriesFallback from "@/components/ShopWithSidebar/ProductsPageWithCategoriesFallback";
import { getWooCommerceCategories } from "@/lib/woocommerce/categories";
import { isWooCommerceEnabled } from "@/lib/woocommerce/config";
import { DEFAULT_OG_IMAGE } from "@/lib/seo";
import { Metadata } from "next";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "RF Products: Antennas, Cables & Connectors | ZDA Communications",
  description:
    "Industrial antennas, coaxial cables, and RF components built for consistent performance, reliability, and efficiency in critical networks.",
  openGraph: {
    title: "RF Products | ZDA Communications",
    description:
      "Industrial-grade RF hardware engineered for dependable performance in demanding wireless environments.",
    images: [{ url: DEFAULT_OG_IMAGE }],
  },
  twitter: {
    card: "summary_large_image",
    title: "RF Products | ZDA Communications",
    description:
      "Industrial-grade RF hardware engineered for dependable performance in demanding wireless environments.",
    images: [DEFAULT_OG_IMAGE],
  },
};

type PageProps = {
  searchParams: Promise<{
    category?: string;
  }>;
};

const ProductsPage = async ({ searchParams }: PageProps) => {
  await searchParams;

  // Fetch categories from WooCommerce (SSR); empty on Vercel if env/cold start fails → client fallback
  let categories: any[] = [];
  const products: any[] = [];
  const totalCount = 0;

  const useWooCommerce = isWooCommerceEnabled();

  try {
    if (useWooCommerce) {
      categories = await getWooCommerceCategories();
    }
  } catch (error: any) {
    console.error("[ProductsPage] Unexpected error:", {
      error: error?.message || String(error),
      stack: process.env.NODE_ENV !== 'production' ? error?.stack : undefined,
    });
    categories = [];
  }

  return (
    <main>
      <ProductsPageWithCategoriesFallback
        initialData={{
          products,
          categories,
          totalCount,
        }}
      />
    </main>
  );
};
  
export default ProductsPage;
