/**
 * GA4 Ecommerce Event Tracking
 * Tracks product views, add-to-cart, checkout, and purchases
 */

declare global {
  interface Window {
    gtag?: (
      command: string,
      eventName: string,
      params?: Record<string, any>
    ) => void;
  }
}

export interface GA4Product {
  id: string;
  name: string;
  price: number;
  category?: string;
  quantity?: number;
}

export interface GA4CartItem {
  id: string;
  name: string;
  price: number;
  category?: string;
  quantity: number;
}

export interface GA4Order {
  id: string;
  total: number;
  items: GA4CartItem[];
}

/**
 * Track product view
 * Call when a product page loads
 */
export function trackViewItem(product: GA4Product) {
  if (!window.gtag) {
    console.warn('[GA4] gtag not loaded');
    return;
  }

  window.gtag("event", "view_item", {
    currency: "USD",
    value: product.price,
    items: [
      {
        item_id: product.id,
        item_name: product.name,
        price: product.price,
        item_category: product.category || "Uncategorized",
        quantity: 1,
      },
    ],
  });

  console.log('[GA4] Tracked view_item:', product.name);
}

/**
 * Track add to cart
 * Call when user clicks "Add to Cart"
 */
export function trackAddToCart(product: GA4Product & { quantity: number }) {
  if (!window.gtag) {
    console.warn('[GA4] gtag not loaded');
    return;
  }

  window.gtag("event", "add_to_cart", {
    currency: "USD",
    value: product.price * product.quantity,
    items: [
      {
        item_id: product.id,
        item_name: product.name,
        price: product.price,
        item_category: product.category || "Uncategorized",
        quantity: product.quantity,
      },
    ],
  });

  console.log('[GA4] Tracked add_to_cart:', product.name, 'x', product.quantity);
}

/**
 * Track remove from cart
 * Call when user removes item from cart
 */
export function trackRemoveFromCart(product: GA4Product & { quantity: number }) {
  if (!window.gtag) {
    console.warn('[GA4] gtag not loaded');
    return;
  }

  window.gtag("event", "remove_from_cart", {
    currency: "USD",
    value: product.price * product.quantity,
    items: [
      {
        item_id: product.id,
        item_name: product.name,
        price: product.price,
        item_category: product.category || "Uncategorized",
        quantity: product.quantity,
      },
    ],
  });

  console.log('[GA4] Tracked remove_from_cart:', product.name);
}

/**
 * Track checkout started
 * Call when user enters checkout page
 */
export function trackBeginCheckout(cartItems: GA4CartItem[]) {
  if (!window.gtag) {
    console.warn('[GA4] gtag not loaded');
    return;
  }

  const totalValue = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  window.gtag("event", "begin_checkout", {
    currency: "USD",
    value: totalValue,
    items: cartItems.map(item => ({
      item_id: item.id,
      item_name: item.name,
      price: item.price,
      item_category: item.category || "Uncategorized",
      quantity: item.quantity,
    })),
  });

  console.log('[GA4] Tracked begin_checkout, items:', cartItems.length, 'total:', totalValue);
}

/**
 * Track purchase completion
 * Call ONLY after payment is confirmed
 */
export function trackPurchase(order: GA4Order) {
  if (!window.gtag) {
    console.warn('[GA4] gtag not loaded');
    return;
  }

  window.gtag("event", "purchase", {
    transaction_id: order.id,
    value: order.total,
    currency: "USD",
    items: order.items.map(item => ({
      item_id: item.id,
      item_name: item.name,
      price: item.price,
      item_category: item.category || "Uncategorized",
      quantity: item.quantity,
    })),
  });

  console.log('[GA4] Tracked purchase, order:', order.id, 'total:', order.total);
}

/**
 * Track view cart
 * Call when user views their cart
 */
export function trackViewCart(cartItems: GA4CartItem[]) {
  if (!window.gtag) {
    console.warn('[GA4] gtag not loaded');
    return;
  }

  const totalValue = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  window.gtag("event", "view_cart", {
    currency: "USD",
    value: totalValue,
    items: cartItems.map(item => ({
      item_id: item.id,
      item_name: item.name,
      price: item.price,
      item_category: item.category || "Uncategorized",
      quantity: item.quantity,
    })),
  });

  console.log('[GA4] Tracked view_cart, items:', cartItems.length);
}
