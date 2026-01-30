import { NextResponse } from "next/server";
import { getWooCommerceCategories } from "@/lib/woocommerce/categories";
import { isWooCommerceEnabled } from "@/lib/woocommerce/config";

/**
 * GET /api/categories
 * Returns WooCommerce categories for the products/shop sidebar.
 * Used for: (1) client-side fallback when SSR categories are empty on Vercel,
 *           (2) debugging: hit this URL on Vercel to verify WooCommerce env vars and API.
 */
export async function GET() {
  try {
    if (!isWooCommerceEnabled()) {
      return NextResponse.json(
        { categories: [], _error: "woo_not_configured" },
        {
          status: 200,
          headers: {
            "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
          },
        }
      );
    }

    const categories = await getWooCommerceCategories();

    return NextResponse.json(
      { categories: Array.isArray(categories) ? categories : [] },
      {
        status: 200,
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
        },
      }
    );
  } catch (error: any) {
    console.error("[API] categories:", error?.message || error);
    return NextResponse.json(
      { categories: [], _error: error?.message || "fetch_failed" },
      {
        status: 200, // 200 so client can handle empty; _error for debugging
        headers: {
          "Cache-Control": "public, s-maxage=10, stale-while-revalidate=60",
        },
      }
    );
  }
}
