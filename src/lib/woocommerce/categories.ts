/**
 * WooCommerce Categories Integration
 */

import { getCategories } from "./products";

const CATEGORY_CACHE_TTL_MS = 1000 * 60 * 30; // 30 minutes
let cachedCategories: any[] | null = null;
let cachedAt = 0;

export interface WooCommerceCategory {
  id: number;
  name: string;
  slug: string;
  description?: string;
  count?: number;
  parent?: number;
}

/**
 * Convert WooCommerce category to frontend format
 * This matches the format expected by the shop page
 */
export function convertWCToCategory(
  wcCategory: WooCommerceCategory,
  allCategories: WooCommerceCategory[]
): any {
  // Find parent category if exists
  const parent = wcCategory.parent
    ? allCategories.find((c) => c.id === wcCategory.parent)
    : null;

  // Find subcategories
  const subcategories = allCategories
    .filter((c) => c.parent === wcCategory.id)
    .map((sub) => convertWCToCategory(sub, allCategories));

  return {
    _id: wcCategory.id.toString(),
    id: wcCategory.id.toString(), // Store as string for consistency
    title: wcCategory.name,
    handle: wcCategory.slug,
    slug: {
      current: wcCategory.slug,
      _type: "slug",
    },
    image: "",
    description: wcCategory.description || "",
    productCount: wcCategory.count || 0,
    parent: parent
      ? {
          _id: parent.id.toString(),
          id: parent.id.toString(),
          title: parent.name,
          handle: parent.slug,
          slug: {
            current: parent.slug,
            _type: "slug",
          },
        }
      : null,
    subcategories: subcategories.length > 0 ? subcategories : undefined,
  };
}

/**
 * Get all categories from WooCommerce
 */
export async function getWooCommerceCategories(): Promise<any[]> {
  const now = Date.now();
  if (cachedCategories && now - cachedAt < CATEGORY_CACHE_TTL_MS) {
    return cachedCategories;
  }

  try {
    const categories = await getCategories();
    
    if (!categories || categories.length === 0) {
      console.warn("[getWooCommerceCategories] No categories in WooCommerce");
      return [];
    }

    // Convert all categories
    const converted = categories.map((cat) =>
      convertWCToCategory(cat, categories)
    );

    // Filter to only return top-level categories (no parent)
    const topLevelCategories = converted.filter((cat) => !cat.parent);

    if (topLevelCategories.length > 0) {
      cachedCategories = topLevelCategories;
      cachedAt = now;
    }

    return topLevelCategories;
  } catch (error) {
    console.error("[getWooCommerceCategories] Error fetching categories from WooCommerce:", error);
    if (error instanceof Error) {
      console.error("[getWooCommerceCategories] Error details:", error.message);
    }
    if (cachedCategories) {
      console.warn("[getWooCommerceCategories] Returning cached categories due to error");
      return cachedCategories;
    }
    return [];
  }
}

