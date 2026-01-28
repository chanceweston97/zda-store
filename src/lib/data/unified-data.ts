/**
 * Unified Data Layer
 * Uses WooCommerce and local fallback data
 */

import { getAllProducts as getLocalProducts } from "@/lib/data/shop-utils";
import { getProducts, getProductBySlug as getWCProductBySlug, convertWCToProduct } from "@/lib/woocommerce/products";
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
        const visibleProducts = wcProducts.filter((p: any) => {
          const visibility = (p.catalog_visibility || "").toLowerCase();
          return visibility !== "hidden" && visibility !== "search";
        });
        
        // CRITICAL FIX: Limit concurrency to prevent MySQL overload
        // Process products in batches of 10 to avoid overwhelming the database
        const BATCH_SIZE = 10;
        const converted: any[] = [];
        
        for (let i = 0; i < visibleProducts.length; i += BATCH_SIZE) {
          const batch = visibleProducts.slice(i, i + BATCH_SIZE);
          try {
            const batchResults = await Promise.all(
              // Listing page: skip variations + skip media ID resolution for performance
              batch.map((product) => convertWCToProduct(product, true, false))
            );
            converted.push(...batchResults);
          } catch (error) {
            // If a batch fails, log but continue with other batches
            // This prevents one failed product from blocking all products
            console.error(`[getAllProducts] Error converting batch ${i / BATCH_SIZE + 1}:`, error);
            // Add placeholder products for failed batch to maintain array consistency
            batch.forEach((product) => {
              converted.push({
                _id: product.id?.toString() || 'unknown',
                name: product.name || 'Unknown Product',
                _conversionFailed: true,
              });
            });
          }
        }
        
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
        // ✅ CRITICAL: Do NOT fetch variations during SSR.
        // Variations are fetched lazily client-side via /api/product-variations to prevent 504s.
        const { convertWCToProduct } = await import("@/lib/woocommerce/products");
        const converted = await convertWCToProduct(wcProduct, true); // skip variations
        const hasVariations = Array.isArray((wcProduct as any).variations) && (wcProduct as any).variations.length > 0;
        if (hasVariations) {
          (converted as any)._variationsLazy = true;
          (converted as any)._wcProductId = wcProduct.id;
        }
        console.log(`[getProductBySlug] Successfully fetched base product (variations lazy) from WooCommerce: ${slug}`);
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
  console.log(`[getCategoriesWithSubcategories] WooCommerce enabled: ${useWooCommerce}`);

  // Try WooCommerce first if enabled
  if (useWooCommerce) {
    try {
      console.log("[getCategoriesWithSubcategories] Attempting to fetch from WooCommerce...");
      const { getWooCommerceCategories } = await import("@/lib/woocommerce/categories");
      const categories = await getWooCommerceCategories();
      
      console.log(`[getCategoriesWithSubcategories] WooCommerce returned ${categories?.length || 0} categories`);
      
      if (categories && categories.length > 0) {
        console.log(`[getCategoriesWithSubcategories] Successfully fetched ${categories.length} categories from WooCommerce`);
        console.log(`[getCategoriesWithSubcategories] First category:`, categories[0]?.title || categories[0]?.name);
        return categories;
      } else {
        console.warn("[getCategoriesWithSubcategories] WooCommerce returned empty categories array");
      }
    } catch (error: any) {
      console.error("[getCategoriesWithSubcategories] WooCommerce fetch failed:", error?.message || error);
      if (error?.stack) {
        console.error("[getCategoriesWithSubcategories] Error stack:", error.stack);
      }
    }
  } else {
    console.warn("[getCategoriesWithSubcategories] WooCommerce is not enabled - check environment variables");
  }

  // Fallback to local data
  console.log("[getCategoriesWithSubcategories] Falling back to local data...");
  try {
    const { getCategoriesWithSubcategories: getLocalCategories } = await import("@/lib/data/shop-utils");
    const localCategories = getLocalCategories() || [];
    console.log(`[getCategoriesWithSubcategories] Local data returned ${localCategories.length} categories`);
    return localCategories;
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

const RESERVED_CATEGORY_SLUGS = new Set([
  "terms-and-conditions",
  "privacy-policy",
  "site-map",
  "sitemap",
]);

/**
 * Get category by slug
 * Tries WooCommerce first, then local data
 */
export async function getCategoryBySlug(slug: string) {
  if (RESERVED_CATEGORY_SLUGS.has(slug)) {
    return null;
  }
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

