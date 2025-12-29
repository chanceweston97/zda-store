"use server";

import { wcFetch } from "./client";
import { isWooCommerceEnabled } from "./config";
import { cookies } from "next/headers";

/**
 * Get cart session key from cookies
 * WooCommerce uses session-based carts
 */
export async function getCartSessionKey(): Promise<string | null> {
  if (!isWooCommerceEnabled()) {
    return null;
  }

  try {
    const cookieStore = await cookies();
    return cookieStore.get("woocommerce_cart_session")?.value || null;
  } catch {
    return null;
  }
}

/**
 * Set cart session key in cookies
 */
export async function setCartSessionKey(sessionKey: string): Promise<void> {
  if (!isWooCommerceEnabled()) {
    return;
  }

  try {
    const cookieStore = await cookies();
    cookieStore.set("woocommerce_cart_session", sessionKey, {
      maxAge: 60 * 60 * 24 * 7, // 7 days
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
    });
  } catch (error) {
    console.error("[setCartSessionKey] Error setting cart cookie:", error);
  }
}

/**
 * Get cart from WooCommerce
 * Note: WooCommerce REST API doesn't have a direct cart endpoint
 * We'll use the session-based approach or create orders as drafts
 */
export async function getCart(): Promise<any> {
  if (!isWooCommerceEnabled()) {
    return null;
  }

  try {
    // WooCommerce doesn't have a direct cart endpoint in REST API
    // We'll need to use session-based approach or store cart items client-side
    // For now, return null - cart will be managed client-side
    return null;
  } catch (error) {
    console.error("[getCart] Error:", error);
    return null;
  }
}

/**
 * Add item to WooCommerce cart
 * This creates a cart item via WooCommerce API
 * Note: WooCommerce REST API doesn't have a cart endpoint, so we'll use a different approach
 */
export async function addToCart(payload: {
  product_id: number;
  quantity: number;
  variation_id?: number;
  variation?: Record<string, any>;
  meta_data?: Array<{ key: string; value: any }>;
}): Promise<any> {
  if (!isWooCommerceEnabled()) {
    throw new Error("WooCommerce is not enabled");
  }

  try {
    // WooCommerce REST API doesn't have a direct cart endpoint
    // We'll need to use the session-based cart or create a custom endpoint
    // For now, we'll return the item data to be stored client-side
    // In production, you'd want to create a custom WordPress endpoint that handles cart sessions
    
    // Alternative: Use WooCommerce session API if available
    // Or create a custom WordPress REST endpoint for cart management
    
    return {
      success: true,
      item: {
        id: Date.now().toString(), // Temporary ID
        product_id: payload.product_id,
        quantity: payload.quantity,
        variation_id: payload.variation_id,
        variation: payload.variation,
        meta_data: payload.meta_data || [],
      },
    };
  } catch (error) {
    console.error("[addToCart] Error:", error);
    throw error;
  }
}

/**
 * Update cart item quantity
 */
export async function updateCartItem(
  itemKey: string,
  quantity: number
): Promise<any> {
  if (!isWooCommerceEnabled()) {
    throw new Error("WooCommerce is not enabled");
  }

  try {
    // Similar to addToCart, this would need a custom endpoint
    return {
      success: true,
      itemKey,
      quantity,
    };
  } catch (error) {
    console.error("[updateCartItem] Error:", error);
    throw error;
  }
}

/**
 * Remove item from cart
 */
export async function removeCartItem(itemKey: string): Promise<any> {
  if (!isWooCommerceEnabled()) {
    throw new Error("WooCommerce is not enabled");
  }

  try {
    // Similar to addToCart, this would need a custom endpoint
    return {
      success: true,
      itemKey,
    };
  } catch (error) {
    console.error("[removeCartItem] Error:", error);
    throw error;
  }
}

/**
 * Clear cart
 */
export async function clearCart(): Promise<any> {
  if (!isWooCommerceEnabled()) {
    throw new Error("WooCommerce is not enabled");
  }

  try {
    // Clear session cookie
    const cookieStore = await cookies();
    cookieStore.delete("woocommerce_cart_session");
    
    return {
      success: true,
    };
  } catch (error) {
    console.error("[clearCart] Error:", error);
    throw error;
  }
}

