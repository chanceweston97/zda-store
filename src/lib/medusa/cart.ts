"use server"

import { medusaClient } from "./client";
import { isMedusaEnabled } from "./config";
import { cookies } from "next/headers";

/**
 * Get cart ID from cookies
 */
export async function getCartId(): Promise<string | null> {
  if (!isMedusaEnabled()) {
    return null;
  }
  
  try {
    const cookieStore = await cookies();
    return cookieStore.get("_medusa_cart_id")?.value || null;
  } catch {
    return null;
  }
}

/**
 * Set cart ID in cookies
 */
export async function setCartId(cartId: string): Promise<void> {
  if (!isMedusaEnabled()) {
    return;
  }
  
  try {
    const cookieStore = await cookies();
    cookieStore.set("_medusa_cart_id", cartId, {
      maxAge: 60 * 60 * 24 * 7, // 7 days
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
    });
  } catch (error) {
    console.error("[setCartId] Error setting cart cookie:", error);
  }
}

/**
 * Remove cart ID from cookies
 */
export async function removeCartId(): Promise<void> {
  if (!isMedusaEnabled()) {
    return;
  }
  
  try {
    const cookieStore = await cookies();
    cookieStore.delete("_medusa_cart_id");
  } catch (error) {
    console.error("[removeCartId] Error removing cart cookie:", error);
  }
}

/**
 * Helper to access private fetch method
 */
async function medusaFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  return (medusaClient as any).fetch(endpoint, options) as Promise<T>;
}

/**
 * Retrieve a cart by its ID
 */
export async function retrieveCart(cartId: string, fields?: string): Promise<any> {
  if (!isMedusaEnabled()) {
    return null;
  }
  
  try {
    const queryParams = new URLSearchParams();
    if (fields) queryParams.append("fields", fields);
    
    const endpoint = `/store/carts/${cartId}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    
    const response = await medusaFetch<{ cart: any }>(
      endpoint,
      {
        method: "GET",
      }
    );
    
    return response.cart || null;
  } catch (error) {
    console.error("[retrieveCart] Error:", error);
    return null;
  }
}

/**
 * Create a new cart
 */
export async function createCart(regionId: string): Promise<any> {
  if (!isMedusaEnabled()) {
    return null;
  }
  
  try {
    const response = await medusaFetch<{ cart: any }>(
      "/store/carts",
      {
        method: "POST",
        body: JSON.stringify({ region_id: regionId }),
      }
    );
    
    if (response.cart) {
      await setCartId(response.cart.id);
    }
    return response.cart || null;
  } catch (error) {
    console.error("[createCart] Error:", error);
    return null;
  }
}

/**
 * Update an existing cart
 */
export async function updateCart(data: any): Promise<any> {
  if (!isMedusaEnabled()) {
    return null;
  }
  
  const cartId = await getCartId();
  if (!cartId) {
    console.error("[updateCart] No cart ID found to update.");
    return null;
  }
  
  try {
    const response = await medusaFetch<{ cart: any }>(
      `/store/carts/${cartId}`,
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    );
    return response.cart || null;
  } catch (error) {
    console.error("[updateCart] Error:", error);
    throw error;
  }
}

/**
 * Add a line item to the cart
 */
export async function addLineItem(cartId: string, variantId: string, quantity: number): Promise<any> {
  if (!isMedusaEnabled()) {
    return null;
  }
  
  try {
    // First, verify the cart is not completed
    const cartCheck = await retrieveCart(cartId, "id,completed_at");
    if (cartCheck?.completed_at) {
      const error = new Error(`Cart ${cartId} is already completed`);
      (error as any).status = 400;
      (error as any).isCompleted = true;
      throw error;
    }
    
    const response = await medusaFetch<{ cart: any }>(
      `/store/carts/${cartId}/line-items`,
      {
        method: "POST",
        body: JSON.stringify({
          variant_id: variantId,
          quantity: quantity,
        }),
      }
    );
    
    // Verify the response cart is not completed
    if (response.cart?.completed_at) {
      const error = new Error(`Cart ${cartId} became completed during item addition`);
      (error as any).status = 400;
      (error as any).isCompleted = true;
      throw error;
    }
    
    return response.cart || null;
  } catch (error: any) {
    console.error("[addLineItem] Error:", error);
    
    // If cart is completed, enhance the error message
    if (error.message?.includes("already completed") || 
        error.message?.includes("is already completed") ||
        error.isCompleted ||
        (error.status === 400 && error.message?.includes("completed"))) {
      const enhancedError = new Error(`Cart ${cartId} is already completed. Cannot add items.`);
      (enhancedError as any).status = 400;
      (enhancedError as any).isCompleted = true;
      throw enhancedError;
    }
    
    throw error;
  }
}

/**
 * Update a line item in the cart
 * Supports overriding title, description, unit_price, quantity, and metadata
 * This is critical for custom products to override default product details
 */
export async function updateLineItem(
  cartId: string, 
  lineItemId: string, 
  data: { 
    quantity?: number; 
    metadata?: Record<string, any>; 
    title?: string; 
    description?: string;
    unit_price?: number; 
  }
): Promise<any> {
  if (!isMedusaEnabled()) {
    return null;
  }
  
  try {
    // Verify cart is not completed before updating
    const cartCheck = await retrieveCart(cartId, "id,completed_at");
    if (cartCheck?.completed_at) {
      const error = new Error(`Cart ${cartId} is already completed`);
      (error as any).status = 400;
      (error as any).isCompleted = true;
      throw error;
    }
    
    const response = await medusaFetch<{ cart: any }>(
      `/store/carts/${cartId}/line-items/${lineItemId}`,
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    );
    
    // Verify the response cart is not completed
    if (response.cart?.completed_at) {
      const error = new Error(`Cart ${cartId} became completed during line item update`);
      (error as any).status = 400;
      (error as any).isCompleted = true;
      throw error;
    }
    
    return response.cart || null;
  } catch (error: any) {
    console.error("[updateLineItem] Error:", error);
    
    // If cart is completed, enhance the error message
    if (error.message?.includes("already completed") || 
        error.message?.includes("is already completed") ||
        error.isCompleted ||
        (error.status === 400 && error.message?.includes("completed"))) {
      const enhancedError = new Error(`Cart ${cartId} is already completed. Cannot update line items.`);
      (enhancedError as any).status = 400;
      (enhancedError as any).isCompleted = true;
      throw enhancedError;
    }
    
    throw error;
  }
}

/**
 * Set shipping method for the cart
 */
export async function setShippingMethod({ cartId, shippingMethodId }: { cartId: string; shippingMethodId: string }): Promise<any> {
  if (!isMedusaEnabled()) {
    return null;
  }
  
  try {
    const response = await medusaFetch<{ cart: any }>(
      `/store/carts/${cartId}/shipping-methods`,
      {
        method: "POST",
        body: JSON.stringify({ option_id: shippingMethodId }),
      }
    );
    return response.cart || null;
  } catch (error) {
    console.error("[setShippingMethod] Error:", error);
    throw error;
  }
}

/**
 * List available shipping methods for a cart
 */
export async function listCartShippingMethods(cartId: string): Promise<any[] | null> {
  if (!isMedusaEnabled()) {
    return null;
  }
  
  try {
    const response = await medusaFetch<{ shipping_options: any[] }>(
      `/store/shipping-options?cart_id=${cartId}`,
      {
        method: "GET",
      }
    );
    return response.shipping_options || null;
  } catch (error) {
    console.error("[listCartShippingMethods] Error:", error);
    return null;
  }
}

/**
 * Initiate payment session for the cart
 * In Medusa v2, payment sessions are created through payment collections
 */
export async function initiatePaymentSession(cart: any, data: any): Promise<any> {
  if (!isMedusaEnabled()) {
    return null;
  }
  
  try {
    // First, try to get or create payment collection
    // Medusa automatically creates a payment collection when items are added
    // We just need to create a payment session for it
    
    // Get the payment collection ID from the cart
    if (!cart.payment_collection?.id) {
      // If no payment collection exists, we might need to create one
      // But typically Medusa creates it automatically when items are added
      console.warn("[initiatePaymentSession] No payment collection found on cart");
      // Try to retrieve the cart again to get the payment collection
      const updatedCart = await retrieveCart(cart.id, "*payment_collection");
      if (!updatedCart?.payment_collection?.id) {
        throw new Error("Payment collection not found. Cart may not be ready for payment.");
      }
      cart = updatedCart;
    }
    
    const paymentCollectionId = cart.payment_collection.id;
    
    // Create payment session for the payment collection
    const response = await medusaFetch<{ payment_session: any }>(
      `/store/payment-collections/${paymentCollectionId}/payment-sessions`,
      {
        method: "POST",
        body: JSON.stringify({
          provider_id: data.provider_id,
        }),
      }
    );
    
    // Return the cart with updated payment collection
    return await retrieveCart(cart.id, "*payment_collection,*payment_collection.payment_sessions");
  } catch (error: any) {
    console.error("[initiatePaymentSession] Error:", error);
    // If the endpoint doesn't exist, try alternative approach
    if (error.message?.includes("Cannot POST") || error.status === 404) {
      console.warn("[initiatePaymentSession] Payment session endpoint not available, skipping payment session creation");
      // For COD, we might not need a payment session
      return cart;
    }
    throw error;
  }
}

/**
 * Create payment collection for a cart
 * In Medusa v2, payment collections must be created before completing checkout
 */
export async function createPaymentCollection(cartId: string): Promise<any> {
  if (!isMedusaEnabled()) {
    return null;
  }
  
  try {
    const response = await medusaFetch<{ cart: any }>(
      `/store/carts/${cartId}/payment-collections`,
      {
        method: "POST",
      }
    );
    return response.cart || null;
  } catch (error: any) {
    // If that fails, try payment-collection (singular)
    if (error.status === 404 || error.message?.includes("Cannot POST")) {
      try {
        const response = await medusaFetch<{ cart: any }>(
          `/store/carts/${cartId}/payment-collection`,
          {
            method: "POST",
          }
        );
        return response.cart || null;
      } catch (error2: any) {
        console.error("[createPaymentCollection] Error:", error2);
        throw error2;
      }
    }
    console.error("[createPaymentCollection] Error:", error);
    throw error;
  }
}

/**
 * Create payment sessions for a cart
 * In Medusa v2, this might not be a direct endpoint
 * Payment sessions may be created automatically or through payment collection
 */
export async function createPaymentSessions(cartId: string): Promise<any> {
  if (!isMedusaEnabled()) {
    return null;
  }
  
  try {
    // Try the payment-sessions endpoint (plural)
    const response = await medusaFetch<{ cart: any }>(
      `/store/carts/${cartId}/payment-sessions`,
      {
        method: "POST",
      }
    );
    return response.cart || null;
  } catch (error: any) {
    // If that fails, try payment-session (singular) - some Medusa versions use this
    if (error.status === 404 || error.message?.includes("Cannot POST")) {
      try {
        const response = await medusaFetch<{ cart: any }>(
          `/store/carts/${cartId}/payment-session`,
          {
            method: "POST",
          }
        );
        return response.cart || null;
      } catch (error2: any) {
        // If both fail, payment sessions might be created automatically
        console.warn("[createPaymentSessions] Payment session endpoints not available, Medusa may create them automatically");
        return null;
      }
    }
    console.error("[createPaymentSessions] Error:", error);
    throw error;
  }
}

/**
 * Set payment session for a cart
 * This selects which payment provider to use (e.g., "manual" for COD)
 */
export async function setPaymentSession(cartId: string, providerId: string): Promise<any> {
  if (!isMedusaEnabled()) {
    return null;
  }
  
  try {
    const response = await medusaFetch<{ cart: any }>(
      `/store/carts/${cartId}/payment-session`,
      {
        method: "POST",
        body: JSON.stringify({
          provider_id: providerId,
        }),
      }
    );
    return response.cart || null;
  } catch (error: any) {
    console.error("[setPaymentSession] Error:", error);
    throw error;
  }
}

/**
 * Complete the cart to create an order
 * @param cartId - The cart ID to complete
 * @param metadata - Optional metadata object. If provided, should be in format { metadata: {...} }
 */
export async function completeCart(cartId: string, metadata?: { metadata?: Record<string, any> } | Record<string, any>): Promise<any> {
  if (!isMedusaEnabled()) {
    return null;
  }
  
  try {
    const body: any = {};
    
    // Handle metadata - it can be passed as { metadata: {...} } or directly as {...}
    if (metadata) {
      if (metadata && typeof metadata === 'object' && 'metadata' in metadata && typeof (metadata as any).metadata === 'object') {
        // Already in correct format: { metadata: {...} }
        body.metadata = (metadata as any).metadata;
      } else if (typeof metadata === 'object' && !Array.isArray(metadata) && !('metadata' in metadata)) {
        // Direct object format, wrap it
        body.metadata = metadata;
      }
    }
    
    const response = await medusaFetch(
      `/store/carts/${cartId}/complete`,
      {
        method: "POST",
        body: Object.keys(body).length > 0 ? JSON.stringify(body) : undefined,
      }
    ) as any;
    return response || null;
  } catch (error) {
    console.error("[completeCart] Error:", error);
    throw error;
  }
}

