import { wcFetch } from "./client";
import { isWooCommerceEnabled } from "./config";

/**
 * Create order in WooCommerce
 * This is used for headless checkout
 */
export async function createOrder(orderData: {
  payment_method: string;
  payment_method_title: string;
  set_paid?: boolean;
  billing: {
    first_name: string;
    last_name: string;
    address_1: string;
    address_2?: string;
    city: string;
    state: string;
    postcode: string;
    country: string;
    email: string;
    phone?: string;
  };
  shipping: {
    first_name: string;
    last_name: string;
    address_1: string;
    address_2?: string;
    city: string;
    state: string;
    postcode: string;
    country: string;
  };
  line_items: Array<{
    product_id: number;
    quantity: number;
    variation_id?: number;
    meta_data?: Array<{ key: string; value: any }>;
    subtotal?: string;
    total?: string;
    price?: string;
  }>;
  shipping_lines?: Array<{
    method_id: string;
    method_title: string;
    total: string;
  }>;
  meta_data?: Array<{ key: string; value: any }>;
}): Promise<any> {
  if (!isWooCommerceEnabled()) {
    throw new Error("WooCommerce is not enabled");
  }

  try {
    // Log line items for debugging
    console.log("[createOrder] Line items being sent:", orderData.line_items.map((item: any) => ({
      product_id: item.product_id,
      quantity: item.quantity,
      price: item.price,
      subtotal: item.subtotal,
      total: item.total,
    })));
    
    // WC_API_URL already includes /wp-json/wc/v3, so just use /orders
    const response = await wcFetch<any>("/orders", {
      method: "POST",
      body: JSON.stringify(orderData),
    });

    console.log("[createOrder] Order created successfully:", {
      orderId: response.id,
      orderTotal: response.total,
      lineItemsTotal: response.line_items?.map((item: any) => item.total),
    });

    return response;
  } catch (error) {
    console.error("[createOrder] Error:", error);
    throw error;
  }
}

/**
 * Get checkout URL for redirect-based checkout
 * This is the recommended approach for budget reasons
 * 
 * Note: WooCommerce doesn't support adding multiple items via URL parameters directly
 * A better approach is to use a custom WordPress endpoint or session-based cart
 * For now, this redirects to the checkout page and items should be added via API first
 */
export function getCheckoutUrl(cartItems?: Array<{
  product_id: number;
  quantity: number;
  variation_id?: number;
}>): string {
  if (!isWooCommerceEnabled()) {
    throw new Error("WooCommerce is not enabled");
  }

  const wcSiteUrl = process.env.NEXT_PUBLIC_WC_SITE_URL || "";
  if (!wcSiteUrl) {
    throw new Error("WC_SITE_URL is not configured");
  }

  // For now, just redirect to checkout page
  // Items should be added to WooCommerce cart via API before redirecting
  // Or use a custom WordPress endpoint that accepts cart data
  return `${wcSiteUrl}/checkout/`;
}

/**
 * Get cart URL for viewing cart on WordPress
 */
export function getCartUrl(): string {
  const wcSiteUrl = process.env.NEXT_PUBLIC_WC_SITE_URL || "";
  if (!wcSiteUrl) {
    throw new Error("WC_SITE_URL is not configured");
  }

  return `${wcSiteUrl}/cart/`;
}

