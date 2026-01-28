/**
 * WooCommerce Configuration
 */

const WC_API_URL = process.env.NEXT_PUBLIC_WC_API_URL || "";
const WC_SITE_URL = process.env.NEXT_PUBLIC_WC_SITE_URL || "";
const WC_CONSUMER_KEY = process.env.NEXT_PUBLIC_WC_CONSUMER_KEY || "";
const WC_CONSUMER_SECRET = process.env.NEXT_PUBLIC_WC_CONSUMER_SECRET || "";
const WC_ENABLED = (process.env.WOO_ENABLED || "true").toLowerCase() !== "false";

/**
 * Check if WooCommerce is enabled and configured
 * This is the main function to check WooCommerce availability
 */
export function isWooCommerceEnabled(): boolean {
  return !!(
    WC_ENABLED &&
    WC_API_URL &&
    WC_SITE_URL &&
    WC_CONSUMER_KEY &&
    WC_CONSUMER_SECRET
  );
}

export const wcConfig = {
  apiUrl: WC_API_URL,
  siteUrl: WC_SITE_URL,
  consumerKey: WC_CONSUMER_KEY,
  // Don't expose secret
};

