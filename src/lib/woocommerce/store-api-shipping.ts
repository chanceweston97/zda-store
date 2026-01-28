/**
 * Store API–style shipping rates for headless checkout.
 *
 * The WooCommerce Store API (wc/store/v1/cart) calculates shipping using
 * zones, FedEx, etc., but it requires a session cart. For headless we call
 * a custom WordPress endpoint that accepts cart + address and returns
 * shipping_rates in the same shape as Store API.
 *
 * Set HEADLESS_SHIPPING_RATES_URL to your custom endpoint, e.g.:
 * https://yoursite.com/wp-json/wc/headless/v1/shipping-rates
 */

export type StoreApiShippingAddress = {
  country: string;
  state?: string;
  postcode?: string;
  city?: string;
  address_1?: string;
};

export type StoreApiCartItem = {
  product_id: number;
  quantity: number;
  variation_id?: number;
  /** Line price in currency (e.g. "10.00") for custom products */
  price?: string;
};

export type StoreApiShippingRate = {
  rate_id: string;
  name: string;
  price: string;
};

export type StoreApiShippingPackage = {
  package_id: number;
  shipping_rates: StoreApiShippingRate[];
};

/** Response from custom WordPress endpoint (same shape as Store API cart.shipping_rates) */
export type StoreApiShippingRatesResponse = {
  shipping_rates?: StoreApiShippingPackage[];
};

const HEADLESS_SHIPPING_RATES_URL = process.env.HEADLESS_SHIPPING_RATES_URL || "";
const WC_API_URL = process.env.NEXT_PUBLIC_WC_API_URL || "";
const WC_CONSUMER_KEY = process.env.NEXT_PUBLIC_WC_CONSUMER_KEY || "";
const WC_CONSUMER_SECRET = process.env.NEXT_PUBLIC_WC_CONSUMER_SECRET || "";

function getAuthHeader(): string {
  const credentials = `${WC_CONSUMER_KEY}:${WC_CONSUMER_SECRET}`;
  return `Basic ${Buffer.from(credentials).toString("base64")}`;
}

export function isStoreApiShippingEnabled(): boolean {
  return !!HEADLESS_SHIPPING_RATES_URL;
}

/**
 * Get calculated shipping rates from WordPress (Store API–style endpoint).
 * Requires a custom endpoint at HEADLESS_SHIPPING_RATES_URL that receives
 * cart + address and returns shipping_rates (same shape as wc/store/v1/cart).
 */
export async function getStoreApiShippingRates(
  cartItems: StoreApiCartItem[],
  shippingAddress: StoreApiShippingAddress
): Promise<{ id: string; name: string; price: number; provider?: string }[]> {
  if (!HEADLESS_SHIPPING_RATES_URL) return [];
  const url = HEADLESS_SHIPPING_RATES_URL;

  const body = {
    cart_items: cartItems,
    shipping_address: {
      country: shippingAddress.country,
      state: shippingAddress.state || "",
      postcode: shippingAddress.postcode || "",
      city: shippingAddress.city || "",
      address_1: shippingAddress.address_1 || "",
    },
  };

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(WC_CONSUMER_KEY && WC_CONSUMER_SECRET ? { Authorization: getAuthHeader() } : {}),
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Store API shipping failed: ${res.status} ${text}`);
  }

  const data: StoreApiShippingRatesResponse = await res.json();
  const packages = data.shipping_rates || [];
  const methods: { id: string; name: string; price: number; provider?: string }[] = [];

  for (const pkg of packages) {
    for (const rate of pkg.shipping_rates || []) {
      methods.push({
        id: rate.rate_id,
        name: rate.name,
        price: parseFloat(rate.price || "0"),
        provider: rate.rate_id?.split(":")[0],
      });
    }
  }

  return methods;
}
