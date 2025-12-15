import ShopWithSidebar from "@/components/ShopWithSidebar";
import {
  getAllProducts,
  getAllProductsCount,
  getCategoriesWithSubcategories,
} from "@/lib/data/unified-data";
import { Metadata } from 'next';

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
  const [allProducts, categories, allProductsCount] = await Promise.all([
    getAllProducts(),
    getCategoriesWithSubcategories(),
    getAllProductsCount(),
  ]);

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

  // Filter products by category (server-side filtering like front project)
  let filteredProducts = allProducts;
  if (category && allProducts.length > 0) {
    const categoryHandles = category.split(",");
    
    // Get all category IDs including subcategories
    const allCategoryIds: string[] = [];
    categoryHandles.forEach((handle) => {
      const foundCategory = findCategoryByHandle(categories, handle);
      if (foundCategory) {
        const categoryId = foundCategory.id || foundCategory._id;
        if (categoryId) {
          const subcats = foundCategory.subcategories || foundCategory.category_children || [];
          if (subcats.length > 0) {
            // Include parent and all subcategories
            allCategoryIds.push(categoryId);
            subcats.forEach((sub: any) => {
              const subId = sub.id || sub._id;
              if (subId) allCategoryIds.push(subId);
            });
          } else {
            allCategoryIds.push(categoryId);
          }
        }
      }
    });

    // Filter products by category IDs (exactly like front project)
    if (allCategoryIds.length > 0) {
      filteredProducts = allProducts.filter((product: any) => {
        const productCategoryIds = product.categories?.map((cat: any) => cat.id).filter(Boolean) || [];
        return productCategoryIds.some((id: string) => allCategoryIds.includes(id));
      });
    } else {
      filteredProducts = [];
    }
  }

  // Filter by size
  if (sizes) {
    const selectedSizes = sizes.split(",").filter(Boolean);
    if (selectedSizes.length > 0) {
      filteredProducts = filteredProducts.filter((product: any) => {
        const productSizes = product.sizes || [];
        return selectedSizes.some(size => productSizes.includes(size));
      });
    }
  }

  // Filter by price
  if (minPrice || maxPrice) {
    filteredProducts = filteredProducts.filter((product: any) => {
      const productPrice = product.price || 0;
      if (minPrice && productPrice < parseFloat(minPrice)) return false;
      if (maxPrice && productPrice > parseFloat(maxPrice)) return false;
      return true;
    });
  }

  // Sort products
  if (sort === 'popular') {
    filteredProducts.sort((a, b) => {
      const aReviews = a.reviews?.length || 0;
      const bReviews = b.reviews?.length || 0;
      return bReviews - aReviews;
    });
  } else {
    // Default: sort by creation date (newest first)
    filteredProducts.sort((a, b) => {
      const aDate = a._createdAt || a.created_at || 0;
      const bDate = b._createdAt || b.created_at || 0;
      return new Date(bDate).getTime() - new Date(aDate).getTime();
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