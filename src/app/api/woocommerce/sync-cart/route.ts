import { NextRequest, NextResponse } from "next/server";
import { wcFetch } from "@/lib/woocommerce/client";
import { isWooCommerceEnabled } from "@/lib/woocommerce/config";

/** Do not run at build time — avoids Cloudflare blocking WooCommerce. */
export const dynamic = "force-dynamic";

/**
 * Sync cart items to WooCommerce
 * This endpoint adds items to WooCommerce cart before redirecting to checkout
 * 
 * Note: WooCommerce REST API doesn't have a direct cart endpoint
 * This would require a custom WordPress plugin or using WooCommerce session API
 * For now, this is a placeholder that returns success
 */
export async function POST(request: NextRequest) {
  try {
    if (!isWooCommerceEnabled()) {
      return NextResponse.json(
        { error: "WooCommerce is not enabled" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { cartItems } = body;

    if (!cartItems || !Array.isArray(cartItems)) {
      return NextResponse.json(
        { error: "Invalid cart items" },
        { status: 400 }
      );
    }

    // TODO: Implement actual WooCommerce cart sync
    // This requires either:
    // 1. A custom WordPress REST endpoint that handles cart sessions
    // 2. Using WooCommerce session API (if available)
    // 3. Creating a draft order and converting it to cart
    
    // For now, return success - items will be added via URL parameters or session
    return NextResponse.json({
      success: true,
      message: "Cart items ready for checkout",
      cartItems,
    });
  } catch (error: any) {
    console.error("[sync-cart] Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to sync cart" },
      { status: 500 }
    );
  }
}

