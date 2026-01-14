/**
 * Unified Data Layer
 * Uses WooCommerce and local fallback data
 */

import { getAllProducts as getLocalProducts } from "@/lib/data/shop-utils";
import { getProducts, getProductBySlug as getWCProductBySlug, convertWCToSanityProduct } from "@/lib/woocommerce/products";
import { isWooCommerceEnabled } from "@/lib/woocommerce/config";

/**
 * Get all products from WooCommerce or local data
 * Priority: WooCommerce (if enabled) > Local Data
 */
export async function getAllProducts() {
  const useWooCommerce = isWooCommerceEnabled();

  // Log status (always log in production for debugging)
  if (typeof window === 'undefined') {
    console.log("[getAllProducts] WooCommerce enabled:", useWooCommerce);
  }

  // Try WooCommerce first
  if (useWooCommerce) {
    try {
      console.log("[getAllProducts] Fetching products from WooCommerce...");
      const wcProducts = await getProducts({ per_page: 100 });
      
      if (wcProducts && wcProducts.length > 0) {
        // Filter out hidden products (already filtered in getProducts, but double-check)
        const visibleProducts = wcProducts.filter((p: any) => p.catalog_visibility !== "hidden");
        // Convert products (now async to fetch variations)
        const converted = await Promise.all(visibleProducts.map(convertWCToSanityProduct));
        console.log(`[getAllProducts] Successfully fetched ${converted.length} visible products from WooCommerce (${wcProducts.length - visibleProducts.length} hidden products filtered out)`);
        return converted;
      } else {
        console.warn("[getAllProducts] No products returned from WooCommerce, falling back to local data");
      }
    } catch (error: any) {
      console.error("[getAllProducts] WooCommerce fetch failed, falling back to local data:", error?.message || error);
    }
  }

  // Fallback to local data
  try {
    console.log("[getAllProducts] Attempting to fetch local products...");
    const localProducts = await getLocalProducts();
    if (localProducts && localProducts.length > 0) {
      console.log(`[getAllProducts] Fetched ${localProducts.length} products from local data`);
    } else {
      console.warn("[getAllProducts] No local products found");
    }
    return localProducts || [];
  } catch (error) {
    console.error("[getAllProducts] Local data fetch also failed:", error);
    return [];
  }
}

/**
 * Get product by slug
 * Tries WooCommerce first, then local data
 */
export async function getProductBySlug(slug: string) {
  const useWooCommerce = isWooCommerceEnabled();

  // Try WooCommerce first
  if (useWooCommerce) {
    try {
      console.log(`[getProductBySlug] Fetching product from WooCommerce: ${slug}`);
      const wcProduct = await getWCProductBySlug(slug);
      if (wcProduct) {
        // Double-check catalog visibility (should already be filtered, but be safe)
        if (wcProduct.catalog_visibility === "hidden") {
          console.log(`[getProductBySlug] Product ${slug} is hidden, skipping`);
          throw new Error("Product is hidden");
        }
        // Use convertWCToSanityProductWithVariations for PDP to get full variant details
        const { convertWCToSanityProductWithVariations } = await import("@/lib/woocommerce/products");
        const converted = await convertWCToSanityProductWithVariations(wcProduct);
        console.log(`[getProductBySlug] Successfully fetched product with variations from WooCommerce: ${slug}`);
        return converted;
      }
    } catch (error) {
      console.error(`[getProductBySlug] WooCommerce fetch failed for ${slug}, falling back to local data:`, error);
    }
  }

  // Fallback to local data
  const { getProduct } = await import("@/lib/data/shop-utils");
  return getProduct(slug);
}

/**
 * Get products by filter (for shop page filtering)
 * This function is kept for backward compatibility
 * @deprecated - Use client-side filtering in shop page instead
 */
export async function getProductsByFilter(
  query: string, 
  tags: string[],
  categories?: any[]
): Promise<any[]> {
  // Fallback to local data
  const { getProductsByFilter: getLocalProductsByFilter } = await import("@/lib/data/shop-utils");
  return getLocalProductsByFilter(query, tags);
}

/**
 * Get total products count
 */
export async function getAllProductsCount(): Promise<number> {
  // Fallback to local data
  try {
    const { getAllProductsCount: getLocalProductsCount } = await import("@/lib/data/shop-utils");
    return getLocalProductsCount() || 0;
  } catch (error) {
    console.error("[getAllProductsCount] Local data fetch also failed:", error);
    return 0;
  }
}

/**
 * Get categories with subcategories
 * Tries WooCommerce first, then local data
 */
export async function getCategoriesWithSubcategories() {
  const useWooCommerce = isWooCommerceEnabled();

  // Try WooCommerce first if enabled
  if (useWooCommerce) {
    try {
      const { getWooCommerceCategories } = await import("@/lib/woocommerce/categories");
      const categories = await getWooCommerceCategories();
      
      if (categories && categories.length > 0) {
        console.log(`[getCategoriesWithSubcategories] Successfully fetched ${categories.length} categories from WooCommerce`);
        return categories;
      }
    } catch (error: any) {
      console.error("[getCategoriesWithSubcategories] WooCommerce fetch failed, falling back to local data:", error?.message || error);
    }
  }

  // Fallback to local data
  try {
    const { getCategoriesWithSubcategories: getLocalCategories } = await import("@/lib/data/shop-utils");
    return getLocalCategories() || [];
  } catch (error) {
    console.error("[getCategoriesWithSubcategories] Local data fetch also failed:", error);
    return [];
  }
}

/**
 * Get all categories (without subcategories structure)
 * Uses WooCommerce (if enabled) then local data
 */
export async function getCategories() {
  const categories = await getCategoriesWithSubcategories();
  // Flatten subcategories into main array if needed, or return as-is
  return categories;
}

/**
 * Get category by slug
 * Tries WooCommerce first, then local data
 */
export async function getCategoryBySlug(slug: string) {
  const useWooCommerce = isWooCommerceEnabled();

  // Try WooCommerce first if enabled
  if (useWooCommerce) {
    try {
      const { getWooCommerceCategories } = await import("@/lib/woocommerce/categories");
      const allCategories = await getWooCommerceCategories();
      
      // Search in top-level categories and subcategories recursively
      const findCategory = (categories: any[]): any => {
        for (const category of categories) {
          const categoryHandle = (category as any).handle || category.slug?.current || category.slug;
          if (categoryHandle === slug) {
            return category;
          }
          // Check subcategories recursively
          if (category.subcategories && category.subcategories.length > 0) {
            const found = findCategory(category.subcategories);
            if (found) return found;
          }
        }
        return null;
      };
      
      const category = findCategory(allCategories);
      if (category) {
        console.log(`[getCategoryBySlug] Found category "${category.title || category.name}" in WooCommerce for slug: ${slug}`);
        return category;
      }
    } catch (error: any) {
      console.error("[getCategoryBySlug] WooCommerce fetch failed, falling back to local data:", error?.message || error);
    }
  }

  // Fallback to local data
  try {
    const { getCategoryBySlug: getLocalCategoryBySlug } = await import("@/lib/data/shop-utils");
    return getLocalCategoryBySlug(slug);
  } catch (error) {
    console.error("[getCategoryBySlug] Local data fetch also failed:", error);
    return null;
  }
}

