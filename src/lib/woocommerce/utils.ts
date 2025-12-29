/**
 * WooCommerce Utility Functions
 */

/**
 * Product ID Mapping
 * Map your product IDs to WooCommerce product IDs
 * 
 * Example:
 * const PRODUCT_ID_MAP: Record<string, number> = {
 *   "product-123": 456,  // Your product ID -> WooCommerce product ID
 *   "cable-custom": 789,
 * };
 * 
 * Update this map based on your products in WooCommerce
 */
const PRODUCT_ID_MAP: Record<string, number> = {
  // Add your product ID mappings here
  // Format: "your-product-id": wc_product_id,
};

/**
 * Convert cart item from use-shopping-cart format to WooCommerce format
 */
export function convertCartItemToWC(item: any): {
  product_id: number;
  quantity: number;
  variation_id?: number;
  meta_data?: Array<{ key: string; value: any }>;
  subtotal?: string;
  total?: string;
  price?: string;
} {
  // Extract product ID from item
  // Try multiple sources: product_id (direct), id, _id, metadata
  let productId: number = 0;
  
  // First, check if product_id is directly on the item (highest priority)
  if ((item as any).product_id) {
    productId = parseInt((item as any).product_id);
  }
  
  // If still 0, try to get from metadata (for custom cables)
  if (productId === 0 && item.metadata) {
    const wcProductId = item.metadata.woocommerce_product_id || item.metadata.wc_product_id;
    if (wcProductId) {
      productId = parseInt(wcProductId);
    }
  }
  
  // If still 0, try to get from mapping
  if (productId === 0) {
    const itemId = item.id?.toString() || (item as any)._id?.toString();
    if (itemId && PRODUCT_ID_MAP[itemId]) {
      productId = PRODUCT_ID_MAP[itemId];
    } else {
      // Try to parse directly (if IDs are numeric)
      productId = parseInt(item.id) || parseInt((item as any)._id) || 0;
    }
  }
  
  if (productId === 0) {
    console.warn("[convertCartItemToWC] Product ID is 0. Item:", item);
    console.warn("[convertCartItemToWC] Add mapping in PRODUCT_ID_MAP for:", itemId);
  }
  
  const wcItem: any = {
    product_id: productId,
    quantity: item.quantity || 1,
  };

  // Add variation ID if available
  if ((item as any).variantId) {
    const variantId = parseInt((item as any).variantId);
    if (!isNaN(variantId)) {
      wcItem.variation_id = variantId;
    }
  }

  // Add meta data for custom products (like cables)
  const metaData: Array<{ key: string; value: any }> = [];
  
  if (item.metadata) {
    Object.entries(item.metadata).forEach(([key, value]) => {
      // Skip internal WooCommerce IDs to avoid duplication
      if (key !== 'woocommerce_product_id' && key !== 'wc_product_id' && key !== 'unique_key') {
        // For custom cables, preserve the WooCommerce-specific format
        // (cable, length, from, to, display_name are already in metadata)
        metaData.push({ key, value: value as any });
      }
    });
  }
  
  // Add additional item info as metadata
  if (item.name) metaData.push({ key: "product_name", value: item.name });
  if (item.sku) metaData.push({ key: "sku", value: item.sku });
  if (item.slug) metaData.push({ key: "slug", value: item.slug });
  if ((item as any).variantId) {
    metaData.push({ key: "original_variant_id", value: (item as any).variantId });
  }
  
  // Add unique_key if present (prevents cart item merging)
  if (item.metadata?.unique_key) {
    metaData.push({ key: "unique_key", value: item.metadata.unique_key });
  }
  
  if (metaData.length > 0) {
    wcItem.meta_data = metaData;
  }

  return wcItem;
}

/**
 * Build WooCommerce checkout URL with cart items
 * This uses WooCommerce's add-to-cart query parameters
 */
export function buildWooCommerceCheckoutUrl(
  cartItems: any[],
  baseUrl?: string
): string {
  const wcSiteUrl = baseUrl || process.env.NEXT_PUBLIC_WC_SITE_URL || "";
  
  if (!wcSiteUrl) {
    throw new Error(
      "WC_SITE_URL is not configured. Set NEXT_PUBLIC_WC_SITE_URL in environment variables."
    );
  }

  // Convert cart items to WooCommerce format
  const wcItems = cartItems.map(convertCartItemToWC);

  // Build query parameters
  // WooCommerce supports adding items via query string
  const params = new URLSearchParams();
  
  // Add each item
  wcItems.forEach((item, index) => {
    // WooCommerce uses add-to-cart parameter for simple products
    // For variations, we need to use variation_id
    if (item.variation_id) {
      params.append(`add-to-cart[${index}]`, item.product_id.toString());
      params.append(`variation_id[${index}]`, item.variation_id.toString());
      params.append(`quantity[${index}]`, item.quantity.toString());
    } else {
      params.append(`add-to-cart[${index}]`, item.product_id.toString());
      params.append(`quantity[${index}]`, item.quantity.toString());
    }
  });

  return `${wcSiteUrl}/checkout/?${params.toString()}`;
}

/**
 * Redirect to WooCommerce checkout
 * This is the recommended approach for budget reasons
 */
export function redirectToWooCommerceCheckout(cartItems: any[]): void {
  try {
    const checkoutUrl = buildWooCommerceCheckoutUrl(cartItems);
    window.location.href = checkoutUrl;
  } catch (error: any) {
    console.error("Error redirecting to WooCommerce checkout:", error);
    throw error;
  }
}

