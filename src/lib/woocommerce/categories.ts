/**
 * WooCommerce Categories Integration
 * Fetches from: GET /wp-json/wc/v3/products/categories
 */

import { wcFetch } from "./client";
import { unstable_cache } from "next/cache";

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
  const timerLabel = `[WooCommerce] categories|${crypto.randomUUID()}`;
  try {
    console.time(timerLabel);
    console.log("[getWooCommerceCategories] Fetching from wc/v3/products/categories...");
    const categories = await wcFetch<WooCommerceCategory[]>(CATEGORIES_ENDPOINT, {
      timeout: 5000,
      next: { revalidate: 300, tags: ["wc-categories"] },
    });
    console.timeEnd(timerLabel);
    const raw = Array.isArray(categories) ? categories : [];
    console.log(`[getWooCommerceCategories] Received ${raw.length} raw categories from API`);

    if (raw.length === 0) {
      console.warn("[getWooCommerceCategories] No categories in WooCommerce - API returned empty array");
      return [];
    }

    // Convert all categories (normalize id/count/parent in case API returns strings)
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

    // Top-level: no parent or parent is 0
    const topLevelCategories = converted.filter((cat) => !cat.parent);
    console.log(`[getWooCommerceCategories] Top-level categories: ${topLevelCategories.length} (total: ${converted.length})`);

    if (topLevelCategories.length === 0) {
      // If no strict top-level, show all as flat list so something appears
      console.warn("[getWooCommerceCategories] No top-level categories; returning all categories as flat list");
      return converted;
    }

    return topLevelCategories;
  } catch (error) {
    try {
      console.timeEnd(timerLabel);
    } catch { /* no-op */ }
    console.error("[getWooCommerceCategories] Error fetching categories:", error);
    if (error instanceof Error) {
      console.error("[getWooCommerceCategories] Error details:", error.message);
    }
    return [];
  }
};

/**
 * Get all categories from WooCommerce (cached for 5 minutes)
 * ✅ FIX: Uses unstable_cache for Next.js server-side caching
 * Shop page loads instantly without waiting on WordPress
 */
export const getCachedCategories = unstable_cache(
  async () => fetchWooCategories(),
  ["woo-categories"],
  { revalidate: 300 } // 5 minutes - categories don't change often
);

/**
 * Get all categories from WooCommerce (backwards compatibility)
 * Now uses cached version
 */
export async function getWooCommerceCategories(): Promise<any[]> {
  try {
    return await getCachedCategories();
  } catch (error) {
    // If cache fails, return empty array - never block page load
    console.error("[getWooCommerceCategories] Cache error, returning empty array:", error);
    return [];
  }
}

