/**
 * Unified Data Layer
 * This layer allows gradual migration from local data to Medusa
 * It can use both data sources and merge results
 */

import { getAllProducts as getLocalProducts } from "@/lib/data/shop-utils";
import { getMedusaProducts } from "@/lib/medusa/products";
import { isMedusaEnabled } from "@/lib/medusa/config";
import { medusaClient } from "@/lib/medusa/client";
import { cache } from "react";

// In-memory cache for products and categories
let cachedProducts: any[] | null = null;
let cachedProductsTime: number = 0;
let cachedCategories: any[] | null = null;
let cachedCategoriesTime: number = 0;
let cachedProductsCount: number | null = null;
let cachedProductsCountTime: number = 0;

// Cache TTL: 2 minutes for products/categories, 5 minutes for count
const PRODUCTS_CACHE_TTL = 2 * 60 * 1000; // 2 minutes
const CATEGORIES_CACHE_TTL = 2 * 60 * 1000; // 2 minutes
const PRODUCTS_COUNT_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Get all products from both local data and Medusa
 * Priority: Medusa (if enabled) > Local Data
 * Uses in-memory cache to avoid refetching on every request
 */
export const getAllProducts = cache(async () => {
  // Return cached products if still valid
  if (cachedProducts !== null && Date.now() - cachedProductsTime < PRODUCTS_CACHE_TTL) {
    return cachedProducts;
  }

  const useMedusa = isMedusaEnabled();

  if (useMedusa) {
    try {
      // Use limit 1000 like front project to get all products at once
      const medusaProducts = await getMedusaProducts({ limit: 1000 });
      
      if (medusaProducts && medusaProducts.length > 0) {
        // Cache the products and count
        cachedProducts = medusaProducts;
        cachedProductsTime = Date.now();
        cachedProductsCount = medusaProducts.length;
        cachedProductsCountTime = Date.now();
        return medusaProducts;
      } else {
        console.warn("[getAllProducts] No products returned from Medusa, falling back to local data");
      }
    } catch (error: any) {
      // Enhanced error logging for production debugging
      console.error("[getAllProducts] Medusa fetch failed, falling back to local data:", {
        error: error?.message || String(error),
        status: error?.status,
        connectionError: error?.connectionError,
        timeoutError: error?.timeoutError,
        hint: error?.hint,
        backendUrl: process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || 'not set',
      });
    }
  }

  // Fallback to local data
  try {
    const localProducts = await getLocalProducts();
    const products = localProducts || [];
    // Cache local products too
    cachedProducts = products;
    cachedProductsTime = Date.now();
    return products;
  } catch (error) {
    console.error("[getAllProducts] Local data fetch also failed:", error);
    return []; // Return empty array instead of throwing
  }
});

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
 * Uses cached count if available to avoid extra API calls
 */
export async function getAllProductsCount(): Promise<number> {
  const useMedusa = isMedusaEnabled();

  if (useMedusa) {
    // Return cached count if still valid
    if (cachedProductsCount !== null && Date.now() - cachedProductsCountTime < PRODUCTS_COUNT_CACHE_TTL) {
      return cachedProductsCount;
    }

    try {
      const { count } = await medusaClient.getProducts({ limit: 1 });
      const productCount = count || 0;
      // Cache the count
      cachedProductsCount = productCount;
      cachedProductsCountTime = Date.now();
      return productCount;
    } catch (error: any) {
      // Enhanced error logging
      console.error("[getAllProductsCount] Medusa fetch failed, falling back to local data:", {
        error: error?.message || String(error),
        status: error?.status,
        connectionError: error?.connectionError,
        timeoutError: error?.timeoutError,
        hint: error?.hint,
      });
    }
  }

  // Fallback to local data
  try {
    const { getAllProductsCount: getLocalProductsCount } = await import("@/lib/data/shop-utils");
    return getLocalProductsCount() || 0;
  } catch (error) {
    console.error("[getAllProductsCount] Local data fetch also failed:", error);
    return 0; // Return 0 instead of throwing
  }
}

/**
 * Get categories with subcategories
 * Tries Medusa first, then local data
 * Uses in-memory cache to avoid refetching on every request
 */
export const getCategoriesWithSubcategories = cache(async () => {
  // Return cached categories if still valid
  if (cachedCategories !== null && Date.now() - cachedCategoriesTime < CATEGORIES_CACHE_TTL) {
    return cachedCategories;
  }

  const useMedusa = isMedusaEnabled();

  if (useMedusa) {
    try {
      const { getMedusaCategories } = await import("@/lib/medusa/categories");
      const categories = await getMedusaCategories();
      
      if (categories && categories.length > 0) {
        // Cache categories
        cachedCategories = categories;
        cachedCategoriesTime = Date.now();
        return categories;
      }
    } catch (error: any) {
      // Enhanced error logging
      console.error("[getCategoriesWithSubcategories] Medusa fetch failed, falling back to local data:", {
        error: error?.message || String(error),
        status: error?.status,
        connectionError: error?.connectionError,
        timeoutError: error?.timeoutError,
        hint: error?.hint,
      });
    }
  }

  // Fallback to local data
  try {
    const { getCategoriesWithSubcategories: getLocalCategories } = await import("@/lib/data/shop-utils");
    const categories = getLocalCategories() || [];
    // Cache local categories too
    cachedCategories = categories;
    cachedCategoriesTime = Date.now();
    return categories;
  } catch (error) {
    console.error("[getCategoriesWithSubcategories] Local data fetch also failed:", error);
    return []; // Return empty array instead of throwing
  }
});

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

/**
 * Clear all caches (useful for testing or manual refresh)
 */
export function clearCaches() {
  cachedProducts = null;
  cachedProductsTime = 0;
  cachedCategories = null;
  cachedCategoriesTime = 0;
  cachedProductsCount = null;
  cachedProductsCountTime = 0;
  console.log("[clearCaches] All caches cleared");
}

