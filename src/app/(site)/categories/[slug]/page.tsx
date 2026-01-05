import Breadcrumb from "@/components/Common/Breadcrumb";
import ShopWithoutSidebar from "@/components/ShopWithoutSidebar";
import FaqSection from "@/components/Home/Faq";
import Newsletter from "@/components/Common/Newsletter";
import {
  getCategories,
  getCategoryBySlug,
  getCategoriesWithSubcategories,
} from "@/lib/data/unified-data";
import { imageBuilder, getFaq } from "@/lib/data/shop-utils";

// Force dynamic rendering to prevent static generation in production
export const dynamic = "force-dynamic";

type Params = {
  params: Promise<{
    slug: string;
  }>;
  searchParams: Promise<{
    date: string;
    sort: string;
  }>;
};

export async function generateStaticParams() {
  try {
    const categories = await getCategories();
    const categoriesWithSubs = await getCategoriesWithSubcategories();
    
    // Include both parent categories and subcategories
    // Use handle if available, otherwise use slug.current
    const allSlugs = [
      ...(categories || []).map((category) => ({ 
        slug: (category as any).handle || category.slug?.current || category.slug 
      })),
      ...(categoriesWithSubs || []).flatMap((category) => 
        category.subcategories?.map((sub) => ({ 
          slug: (sub as any).handle || sub.slug?.current || sub.slug 
        })) || []
      ),
    ];
    
    // Remove duplicates
    const uniqueSlugs = Array.from(
      new Map(allSlugs.map((item) => [item.slug, item])).values()
    );
    
    return uniqueSlugs;
  } catch (error) {
    console.error("[generateStaticParams] Error generating static params:", error);
    // Return empty array if generation fails (pages will be generated on-demand)
    return [];
  }
}

export async function generateMetadata({ params }: Params) {
  const { slug } = await params;
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
      } | ZDAComm -  E-commerce Template`,
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

  let categoryData;
  let allProducts: any[] = [];

  try {
    // Try to fetch category
    categoryData = await getCategoryBySlug(slug);
    
    // If category not found, return 404
    if (!categoryData) {
      console.warn(`[CategoryPage] Category not found for slug: ${slug}`);
      const { notFound } = await import("next/navigation");
      notFound();
    }
  } catch (error: any) {
    // Enhanced error logging for production debugging
    console.error("[CategoryPage] Error fetching category:", {
      slug,
      error: error?.message || String(error),
      status: error?.status,
      connectionError: error?.connectionError,
      timeoutError: error?.timeoutError,
      hint: error?.hint,
      stack: process.env.NODE_ENV !== 'production' ? error?.stack : undefined,
    });
    
    // If it's a connection error, log additional diagnostic info
    if (error?.connectionError || error?.timeoutError) {
      const backendUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || 'not set';
      console.error(`[CategoryPage] Medusa connection issue detected. Backend URL: ${backendUrl}`);
      console.error(`[CategoryPage] If this is production, ensure NEXT_PUBLIC_MEDUSA_BACKEND_URL is set correctly and rebuild.`);
    }
    
    // Return not found if category fetch fails (prevents 500 error)
    const { notFound } = await import("next/navigation");
    notFound();
  }
  
  // Validate categoryData exists before accessing properties
  if (!categoryData) {
    console.warn(`[CategoryPage] Category data is null for slug: ${slug}`);
    const { notFound } = await import("next/navigation");
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
  
  console.log(`[CategoryPage] Filtering products for category:`, {
    slug,
    categoryId,
    categoryHandle,
    categoryTitle: categoryData?.title || categoryData?.name,
  });
  
  // Filter products by category ID (WooCommerce and Medusa use category IDs for filtering)
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
    
    console.log(`[CategoryPage] Filtering by category IDs:`, allCategoryIds);
    
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
    
    console.log(`[CategoryPage] Found ${filteredProducts.length} products matching category IDs`);
  } else if (categoryHandle) {
    // Fallback: filter by handle/slug if ID not available
    console.log(`[CategoryPage] Filtering by category handle: ${categoryHandle}`);
    filteredProducts = allProducts.filter((product: any) => {
      const productCategoryHandles = product.categories?.map((cat: any) => 
        (cat as any).handle || cat.slug?.current || cat.slug
      ).filter(Boolean) || [];
      const matches = productCategoryHandles.includes(categoryHandle);
      return matches;
    });
    
    console.log(`[CategoryPage] Found ${filteredProducts.length} products matching category handle`);
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

  // Clean slug by removing hyphens and symbol characters
  const cleanSlug = slug
    ? slug
        .replace(/[^a-zA-Z0-9\s]/g, "  ")
        .replace(/\s+/g, " ")
        .trim()
    : "Category Page";

  const faqData = await getFaq();

  return (
    <main>
      <ShopWithoutSidebar shopData={filteredProducts} />
      <FaqSection faqData={faqData} />
      <Newsletter />
    </main>
  );
};

export default CategoryPage;
