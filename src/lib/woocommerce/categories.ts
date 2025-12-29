/**
 * WooCommerce Categories Integration
 */

import { getCategories } from "./products";

export interface WooCommerceCategory {
  id: number;
  name: string;
  slug: string;
  description?: string;
  count?: number;
  parent?: number;
}

/**
 * Convert WooCommerce category to Sanity category format
 * This matches the format expected by the shop page
 */
export function convertWCToSanityCategory(
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
    .map((sub) => convertWCToSanityCategory(sub, allCategories));

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
  try {
    const categories = await getCategories();
    
    if (!categories || categories.length === 0) {
      console.warn("[getWooCommerceCategories] No categories in WooCommerce");
      return [];
    }

    // Convert all categories
    const converted = categories.map((cat) =>
      convertWCToSanityCategory(cat, categories)
    );

    // Filter to only return top-level categories (no parent)
    const topLevelCategories = converted.filter((cat) => !cat.parent);

    return topLevelCategories;
  } catch (error) {
    console.error("[getWooCommerceCategories] Error fetching categories from WooCommerce:", error);
    if (error instanceof Error) {
      console.error("[getWooCommerceCategories] Error details:", error.message);
    }
    return [];
  }
}

