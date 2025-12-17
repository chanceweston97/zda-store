/**
 * Medusa Categories Integration
 * Functions to fetch categories from Medusa backend
 */

import { medusaClient, MedusaCategory } from "./client";
import { isMedusaEnabled } from "./config";

/**
 * Convert Medusa category to Sanity category format
 */
export function convertMedusaToSanityCategory(medusaCategory: MedusaCategory, allCategories: MedusaCategory[]): any {
  // Find parent category if exists
  const parent = medusaCategory.parent_category_id
    ? allCategories.find((c) => c.id === medusaCategory.parent_category_id)
    : null;

  // Find subcategories
  const subcategories = allCategories
    .filter((c) => c.parent_category_id === medusaCategory.id)
    .map((sub) => convertMedusaToSanityCategory(sub, allCategories));

  return {
    _id: medusaCategory.id,
    id: medusaCategory.id, // Also store as id for easier matching (like front project)
    title: medusaCategory.name,
    handle: medusaCategory.handle, // Store handle directly for easier access
    slug: {
      current: medusaCategory.handle,
      _type: "slug",
    },
    image: "", // Medusa categories don't have images by default
    description: medusaCategory.description || "",
    productCount: 0, // Will be calculated from products
    parent: parent
      ? {
          _id: parent.id,
          id: parent.id,
          title: parent.name,
          handle: parent.handle,
          slug: {
            current: parent.handle,
            _type: "slug",
          },
        }
      : null,
    subcategories: subcategories.length > 0 ? subcategories : undefined,
  };
}

/**
 * Get all categories from Medusa
 */
export async function getMedusaCategories(): Promise<any[]> {
  if (!isMedusaEnabled()) {
    return [];
  }

  try {
    const response = await medusaClient.getCategories();
    
    // Handle different response formats
    const product_categories = response.product_categories || (response as any).categories || [];

    if (!product_categories || product_categories.length === 0) {
      console.warn("[getMedusaCategories] No categories in Medusa response");
      return [];
    }

    // Convert all categories
    const converted = product_categories.map((cat) =>
      convertMedusaToSanityCategory(cat, product_categories)
    );

    // Filter to only return top-level categories (no parent)
    // Subcategories will be included in their parent's subcategories array
    const topLevelCategories = converted.filter((cat) => !cat.parent);

    // Don't fetch product counts via API (too slow - makes N API calls)
    // Product counts will be calculated client-side from products array (like front project)
    // This is much faster and doesn't require multiple API calls
    return topLevelCategories;
  } catch (error) {
    console.error("[getMedusaCategories] Error fetching categories from Medusa:", error);
    if (error instanceof Error) {
      console.error("[getMedusaCategories] Error details:", error.message);
    }
    return [];
  }
}

/**
 * Get category by handle from Medusa
 */
export async function getMedusaCategoryByHandle(handle: string): Promise<any | null> {
  if (!isMedusaEnabled()) {
    console.warn(`[getMedusaCategoryByHandle] Medusa is not enabled`);
    return null;
  }

  try {
    const categoryResponse = await medusaClient.getCategoryByHandle(handle);
    const product_category = categoryResponse.product_category || (categoryResponse as any).category;
    
    if (!product_category) {
      console.warn(`[getMedusaCategoryByHandle] Category not found: ${handle}`);
      return null;
    }
    
    const categoriesResponse = await medusaClient.getCategories();
    const product_categories = categoriesResponse.product_categories || (categoriesResponse as any).categories || [];
    
    return convertMedusaToSanityCategory(product_category, product_categories);
  } catch (error: any) {
    console.error(`[getMedusaCategoryByHandle] Error fetching category "${handle}" from Medusa:`, {
      error: error?.message || error,
      status: error?.status,
      statusText: error?.statusText,
      stack: error?.stack,
    });
    // Return null instead of throwing to prevent 500 errors
    return null;
  }
}

