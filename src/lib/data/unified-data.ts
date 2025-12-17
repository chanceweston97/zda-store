/**
 * Unified Data Layer
 * This layer allows gradual migration from local data to Medusa
 * It can use both data sources and merge results
 */

import { getAllProducts as getLocalProducts } from "@/lib/data/shop-utils";
import { getMedusaProducts } from "@/lib/medusa/products";
import { isMedusaEnabled } from "@/lib/medusa/config";
import { medusaClient } from "@/lib/medusa/client";

/**
 * Get all products from both local data and Medusa
 * Priority: Medusa (if enabled) > Local Data
 */
export async function getAllProducts() {
  const useMedusa = isMedusaEnabled();

  // Log Medusa status (always log in production for debugging)
  if (typeof window === 'undefined') {
    console.log("[getAllProducts] Medusa enabled:", useMedusa);
    if (!useMedusa) {
      console.warn("[getAllProducts] Medusa is disabled - will use local data fallback");
      console.warn("[getAllProducts] Set NEXT_PUBLIC_USE_MEDUSA=true to enable Medusa");
    }
  }

  if (useMedusa) {
    try {
      console.log("[getAllProducts] Fetching products from Medusa...");
      const medusaProducts = await getMedusaProducts({ limit: 100 });
      
      if (medusaProducts && medusaProducts.length > 0) {
        console.log(`[getAllProducts] Successfully fetched ${medusaProducts.length} products from Medusa`);
        return medusaProducts;
      } else {
        console.warn("[getAllProducts] No products returned from Medusa, falling back to local data");
      }
    } catch (error: any) {
      console.error("[getAllProducts] Medusa fetch failed, falling back to local data:", error?.message || error);
      if (error?.url) {
        console.error("[getAllProducts] Failed URL:", error.url);
      }
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
 * Tries Medusa first, then local data
 */
export async function getProductBySlug(slug: string) {
  const useMedusa = isMedusaEnabled();

  if (useMedusa) {
    try {
      const { getMedusaProductByHandle } = await import("@/lib/medusa/products");
      const product = await getMedusaProductByHandle(slug);
      if (product) {
        return product;
      }
    } catch (error) {
      console.error("Medusa fetch failed, falling back to local data:", error);
    }
  }

  // Fallback to local data
  const { getProduct } = await import("@/lib/data/shop-utils");
  return getProduct(slug);
}

/**
 * Get products by filter (for shop page filtering)
 * This function is kept for backward compatibility but should not be used for Medusa
 * For Medusa, filtering is done client-side in the shop page
 * @deprecated - Use client-side filtering in shop page instead
 */
export async function getProductsByFilter(
  query: string, 
  tags: string[],
  categories?: any[]
): Promise<any[]> {
  const useMedusa = isMedusaEnabled();

  if (useMedusa) {
    // For Medusa, just return all products - filtering is done client-side
    const { getMedusaProducts } = await import("@/lib/medusa/products");
    return await getMedusaProducts({ limit: 100 });
  }

  // Fallback to local data
  const { getProductsByFilter: getLocalProductsByFilter } = await import("@/lib/data/shop-utils");
  return getLocalProductsByFilter(query, tags);
}

/**
 * Get total products count
 */
export async function getAllProductsCount(): Promise<number> {
  const useMedusa = isMedusaEnabled();

  if (useMedusa) {
    try {
      const { count } = await medusaClient.getProducts({ limit: 1 });
      return count || 0;
    } catch (error: any) {
      console.error("[getAllProductsCount] Medusa fetch failed, falling back to local data:", error?.message || error);
    }
  }

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
 * Tries Medusa first, then local data
 */
export async function getCategoriesWithSubcategories() {
  const useMedusa = isMedusaEnabled();

  if (useMedusa) {
    try {
      const { getMedusaCategories } = await import("@/lib/medusa/categories");
      const categories = await getMedusaCategories();
      
      if (categories && categories.length > 0) {
        return categories;
      }
    } catch (error: any) {
      console.error("[getCategoriesWithSubcategories] Medusa fetch failed, falling back to local data:", error?.message || error);
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
 * Tries Medusa first, then local data
 */
export async function getCategories() {
  const categories = await getCategoriesWithSubcategories();
  // Flatten subcategories into main array if needed, or return as-is
  return categories;
}

/**
 * Get category by slug
 * Tries Medusa first, then local data
 */
export async function getCategoryBySlug(slug: string) {
  const useMedusa = isMedusaEnabled();

  if (useMedusa) {
    try {
      const { getMedusaCategoryByHandle } = await import("@/lib/medusa/categories");
      const category = await getMedusaCategoryByHandle(slug);
      if (category) {
        return category;
      }
    } catch (error) {
      console.error("Medusa fetch failed, falling back to local data:", error);
    }
  }

  // Fallback to local data
  const { getCategoryBySlug: getLocalCategoryBySlug } = await import("@/lib/data/shop-utils");
  return getLocalCategoryBySlug(slug);
}

/**
 * Feature flag: Enable/disable Medusa integration
 */
export const USE_MEDUSA = process.env.NEXT_PUBLIC_USE_MEDUSA === "true";

