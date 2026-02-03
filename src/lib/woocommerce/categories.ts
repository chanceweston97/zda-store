/**
 * WooCommerce Categories Integration
 * Cloudflare caches WordPress API; Next.js uses no-store.
 */

import { wcFetch } from "./client";

export interface WooCommerceCategory {
  id: number;
  name: string;
  slug: string;
  description?: string;
  count?: number;
  parent?: number;
}

/** Top-level categories have parent 0 or missing; treat 0 and "0" as no parent */
function hasParent(wcCategory: WooCommerceCategory): boolean {
  const p = wcCategory.parent;
  if (p === undefined || p === null) return false;
  if (typeof p === "number") return p !== 0;
  if (typeof p === "string") return p !== "0" && p !== "";
  return true;
}

/**
 * Convert WooCommerce category to frontend format
 * This matches the format expected by the shop page
 */
export function convertWCToCategory(
  wcCategory: WooCommerceCategory,
  allCategories: WooCommerceCategory[]
): any {
  // Find parent category if exists (parent id can be number or string from API)
  const parentId = hasParent(wcCategory) ? wcCategory.parent : null;
  const parent =
    parentId != null
      ? allCategories.find(
          (c) => String(c.id) === String(parentId) || c.id === Number(parentId)
        )
      : null;

  // Find subcategories (parent can be number or string from API)
  const catId = wcCategory.id;
  const subcategories = allCategories
    .filter(
      (c) =>
        c.parent !== undefined &&
        c.parent !== null &&
        (String(c.parent) === String(catId) || Number(c.parent) === Number(catId))
    )
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

/** WooCommerce REST API v3: GET /products/categories - same as wp-json/wc/v3/products/categories */
const CATEGORIES_ENDPOINT = "/products/categories?per_page=100";

/**
 * Core function that fetches and converts categories from WooCommerce.
 * Calls wc/v3/products/categories directly. Returns [] on error so cache never blocks SSR; never throws.
 */
const fetchWooCategories = async (): Promise<any[]> => {
  try {
    const categories = await wcFetch<WooCommerceCategory[]>(CATEGORIES_ENDPOINT);
    const raw = Array.isArray(categories) ? categories : [];
    if (raw.length === 0) return [];

    const normalized: WooCommerceCategory[] = raw.map((cat: any) => ({
      id: Number(cat.id),
      name: cat.name ?? "",
      slug: cat.slug ?? "",
      description: cat.description,
      count: cat.count !== undefined ? Number(cat.count) : 0,
      parent: cat.parent !== undefined && cat.parent !== null && cat.parent !== "" ? Number(cat.parent) : undefined,
    }));

    const converted = normalized.map((cat) =>
      convertWCToCategory(cat, normalized)
    );

    const topLevelCategories = converted.filter((cat) => !cat.parent);
    if (topLevelCategories.length === 0) return converted;
    return topLevelCategories;
  } catch (error) {
    console.error("[getWooCommerceCategories] Error fetching categories:", error);
    if (error instanceof Error) {
      console.error("[getWooCommerceCategories] Error details:", error.message);
    }
    return [];
  }
};

/**
 * Get all categories from WooCommerce (no Next.js cache; Cloudflare caches at edge)
 */
export async function getWooCommerceCategories(): Promise<any[]> {
  try {
    return await fetchWooCategories();
  } catch (error) {
    console.error("[getWooCommerceCategories] Error:", error);
    return [];
  }
}

