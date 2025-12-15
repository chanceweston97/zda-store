"use server"

/**
 * Cart Data Layer - Compatibility wrapper for API routes
 * This file provides compatibility for API routes that import from @lib/data/cart
 * It re-exports functions from the Medusa cart implementation
 * 
 * NOTE: This file exists to support API routes that were created before the Sanity removal.
 * All cart functionality is now in @lib/medusa/cart.ts
 */

// Import functions first for aliases
import {
  getCartId,
  setCartId,
  removeCartId,
  retrieveCart,
  createCart,
  updateCart,
  addLineItem,
  updateLineItem,
  setShippingMethod,
  listCartShippingMethods,
  initiatePaymentSession,
  createPaymentCollection,
  createPaymentSessions,
  setPaymentSession,
  completeCart,
} from "../medusa/cart";
import { medusaClient } from "../medusa/client";

// Re-export all functions from medusa/cart
export {
  getCartId,
  setCartId,
  removeCartId,
  retrieveCart,
  createCart,
  updateCart,
  addLineItem,
  updateLineItem,
  setShippingMethod,
  listCartShippingMethods,
  initiatePaymentSession,
  createPaymentCollection,
  createPaymentSessions,
  setPaymentSession,
  completeCart,
};

// Aliases for compatibility (in case API routes use different names)
export const addToCart = addLineItem;

// Remove line item - DELETE endpoint wrapper
export async function removeLineItem(cartId: string, lineItemId: string): Promise<any> {
  try {
    const response = await (medusaClient as any).fetch(
      `/store/carts/${cartId}/line-items/${lineItemId}`,
      {
        method: "DELETE",
      }
    ) as { cart: any };
    return response.cart || null;
  } catch (error) {
    console.error("[removeLineItem] Error:", error);
    throw error;
  }
}

// Alias for deleteLineItem (some API routes use this name)
export const deleteLineItem = removeLineItem;

// Helper function that might be used by API routes  
export async function getOrSetCart(regionId?: string): Promise<any> {
  const cartId = await getCartId();
  
  if (!cartId) {
    if (!regionId) {
      return null;
    }
    return await createCart(regionId);
  }
  
  return await retrieveCart(cartId);
}

