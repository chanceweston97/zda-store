import { NextResponse } from "next/server";
import { wcFetch } from "@/lib/woocommerce/client";
import { isWooCommerceEnabled } from "@/lib/woocommerce/config";

export type WooCountryState = { code: string; name: string };
export type WooCountry = { code: string; name: string; states?: WooCountryState[] };

/**
 * GET /api/woocommerce/countries
 * Fetches country and state/province data from WooCommerce (WC_Countries).
 * Safe to cache; data rarely changes.
 */
export async function GET() {
  try {
    if (!isWooCommerceEnabled()) {
      return NextResponse.json(
        { error: "WooCommerce is not enabled" },
        { status: 400 }
      );
    }

    const countries = await wcFetch<WooCountry[]>("/data/countries", {
      next: { revalidate: 86400 }, // 24h
    });

    return NextResponse.json(countries);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch countries";
    console.error("[API] woocommerce/countries:", message);
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
