import Breadcrumb from "@/components/Common/Breadcrumb";
import ShopWithSidebar from "@/components/ShopWithSidebar";
import Newsletter from "@/components/Common/Newsletter";
import {
  getCategoryBySlug,
  getCategoriesWithSubcategories,
  getAllProducts,
} from "@/lib/data/unified-data";
import { imageBuilder, getFaq } from "@/lib/data/shop-utils";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";
export const revalidate = 300; // 5 min ISR — categories fetched at runtime, not build time (avoids Cloudflare bot challenge)
export const dynamicParams = true;

const RESERVED_SLUGS = new Set([
  "terms-and-conditions",
  "privacy-policy",
  "site-map",
  "sitemap",
]);

type Params = {
  params: Promise<{
    slug: string;
  }>;
  searchParams: Promise<{
    date: string;
    sort: string;
  }>;
};

export async function generateMetadata({ params }: Params) {
  const { slug } = await params;
  if (RESERVED_SLUGS.has(slug)) {
    return {
      title: "Not Found",
      description: "No product category has been found",
      robots: {
        index: false,
        follow: false,
      },
    };
  }
  let categoryData;
  
  try {
    categoryData = await getCategoryBySlug(slug);
  } catch (error) {
    console.error("[generateMetadata] Error fetching category:", error);
    // Return default metadata if category fetch fails
    return {
      title: "Category | ZDAComm - E-commerce Template",
      description: "Browse our product categories",
    };
  }
  
  const siteURL = process.env.NEXT_PUBLIC_SITE_URL;

  if (categoryData) {
    return {
      title: `${
        categoryData?.title || "Category Page"
      } | ZDA Communications`,
      description: `${categoryData?.description?.slice(0, 136)}...`,
      author: "ZDAComm",
      alternates: {
        canonical: `${siteURL}/categories/${categoryData?.slug?.current}`,
        languages: {
          "en-US": "/en-US",
          "de-DE": "/de-DE",
        },
      },

      robots: {
        index: true,
        follow: true,
        nocache: true,
        googleBot: {
          index: true,
          follow: false,
          "max-video-preview": -1,
          "max-image-preview": "large",
          "max-snippet": -1,
        },
      },

      // openGraph: {
      //   title: `${categoryData?.title} | ZDAComm`,
      //   description: categoryData.description,
      //   url: `${siteURL}/categories/${categoryData?.slug?.current}`,
      //   siteName: "ZDAComm",
      //   images: [
      //     {
      //       url: imageBuilder(categoryData.image).url(),
      //       width: 1800,
      //       height: 1600,
      //       alt: categoryData?.title,
      //     },
      //   ],
      //   locale: "en_US",
      //   type: "article",
      // },

      // twitter: {
      //   card: "summary_large_image",
      //   title: `${categoryData?.title} | ZDAComm`,
      //   description: `${categoryData?.description?.slice(0, 136)}...`,
      //   creator: "@ZDAComm",
      //   site: "@ZDAComm",
      //   images: [imageBuilder(categoryData.image).url()],
      //   url: `${siteURL}/categories/${categoryData?.slug?.current}`,
      // },
    };
  } else {
    return {
      title: "Not Found",
      description: "No product category has been found",
    };
  }
}

const CategoryPage = async ({ params, searchParams }: Params) => {
  const { slug } = await params; // This is actually the handle from the URL
  const { date, sort } = await searchParams;
  
  if (RESERVED_SLUGS.has(slug)) {
    notFound();
  }

  let categoryData;
  let allProducts: any[] = [];

  // CRITICAL FIX: Fail fast on category fetch - don't retry or continue rendering
  try {
    // Try to fetch category - single attempt, no retries
    categoryData = await getCategoryBySlug(slug);
    
    // If category not found, return 404 immediately
    if (!categoryData) {
      console.warn(`[CategoryPage] Category not found for slug: ${slug}`);
      notFound(); // This will stop execution
    }
  } catch (error: any) {
    // Enhanced error logging for production debugging
    console.error("[CategoryPage] CRITICAL: Error fetching category - failing fast to prevent retry loop:", {
      slug,
      error: error?.message || String(error),
      status: error?.status,
      connectionError: error?.connectionError,
      timeoutError: error?.timeoutError,
      hint: error?.hint,
      stack: process.env.NODE_ENV !== 'production' ? error?.stack : undefined,
    });
    
    // HARD FAILURE: Return 404 immediately to stop Next.js retry cascade
    // This prevents the retry loop that causes 504s
    notFound(); // This will stop execution and prevent further rendering attempts
  }
  
  // Validate categoryData exists before accessing properties
  // This should never execute if notFound() was called, but safety check
  if (!categoryData) {
    console.warn(`[CategoryPage] Category data is null for slug: ${slug} - this should not happen`);
    notFound();
  }

  // Try to fetch products separately - don't fail page if products fail
  try {
    const { getAllProducts } = await import("@/lib/data/unified-data");
    allProducts = await getAllProducts() || [];
  } catch (error) {
    console.error("[CategoryPage] Error fetching products:", error);
    // Continue with empty products array if fetch fails
    allProducts = [];
  }
  
  // Get the category ID - use id field if available (convert to string for consistency)
  const categoryId = categoryData?.id?.toString() || categoryData?._id?.toString();
  const categoryHandle = (categoryData as any)?.handle || categoryData?.slug?.current || categoryData?.slug || slug;
  
  // Filter products by category ID (WooCommerce uses category IDs for filtering)
  let filteredProducts = allProducts;
  
  if (categoryData && categoryId) {
    // Get all category IDs including subcategories (normalize to strings)
    const allCategoryIds: string[] = [categoryId];
    
    if (categoryData.subcategories && categoryData.subcategories.length > 0) {
      // Include all subcategory IDs
      categoryData.subcategories.forEach((sub: { id?: string | number; _id?: string | number }) => {
        const subId = (sub.id?.toString()) || (sub._id?.toString());
        if (subId) allCategoryIds.push(subId);
      });
    }
    
    // Filter products by category IDs (exactly like shop page)
    // WooCommerce products have category IDs as strings, so we compare as strings
    filteredProducts = allProducts.filter((product: any) => {
      const productCategoryIds = product.categories?.map((cat: any) => {
        // Normalize category ID to string for comparison
        const catId = cat.id?.toString() || cat._id?.toString();
        return catId;
      }).filter(Boolean) || [];
      
      const matches = productCategoryIds.some((id: string) => allCategoryIds.includes(id));
      return matches;
    });
  } else if (categoryHandle) {
    // Fallback: filter by handle/slug if ID not available
    filteredProducts = allProducts.filter((product: any) => {
      const productCategoryHandles = product.categories?.map((cat: any) => 
        (cat as any).handle || cat.slug?.current || cat.slug
      ).filter(Boolean) || [];
      const matches = productCategoryHandles.includes(categoryHandle);
      return matches;
    });
  } else {
    // No category found, show empty
    console.warn(`[CategoryPage] No category ID or handle found for slug: ${slug}`);
    filteredProducts = [];
  }

  // Sort products
  if (sort === 'popular') {
    filteredProducts.sort((a, b) => {
      const aReviews = a.reviews?.length || 0;
      const bReviews = b.reviews?.length || 0;
      return bReviews - aReviews;
    });
  } else if (date) {
    filteredProducts.sort((a, b) => {
      const aDate = a._createdAt || a.created_at || 0;
      const bDate = b._createdAt || b.created_at || 0;
      return date === 'desc' 
        ? new Date(bDate).getTime() - new Date(aDate).getTime()
        : new Date(aDate).getTime() - new Date(bDate).getTime();
    });
  }

  // Fetch all categories for the sidebar
  let categories: any[] = [];
  try {
    categories = await getCategoriesWithSubcategories();
  } catch (error) {
    console.error("[CategoryPage] Error fetching categories:", error);
    categories = [];
  }

  // Get category name for hero section
  const categoryName = categoryData?.title || categoryData?.name || slug;

  return (
    <main>
      <ShopWithSidebar
        data={{
          allProducts,
          products: filteredProducts,
          categories,
          allProductsCount: allProducts.length,
          currentCategory: categoryData, // Pass current category for subcategories display
        }}
        categoryName={categoryName}
      />
      <Newsletter />
    </main>
  );
};

export default CategoryPage;
