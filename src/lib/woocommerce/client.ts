/**
 * WooCommerce API Client
 * Handles authentication and base API requests
 */

const WC_API_URL = process.env.NEXT_PUBLIC_WC_API_URL || "";
const WC_CONSUMER_KEY = process.env.NEXT_PUBLIC_WC_CONSUMER_KEY || "";
const WC_CONSUMER_SECRET = process.env.NEXT_PUBLIC_WC_CONSUMER_SECRET || "";
const WOO_ENABLED = (process.env.WOO_ENABLED || "true").toLowerCase() !== "false";

/**
 * Create Basic Auth header for WooCommerce REST API
 */
function getAuthHeader(): string {
  const credentials = `${WC_CONSUMER_KEY}:${WC_CONSUMER_SECRET}`;
  // Use btoa for browser compatibility, Buffer for Node.js
  if (typeof window !== "undefined") {
    return `Basic ${btoa(credentials)}`;
  } else {
    return `Basic ${Buffer.from(credentials).toString("base64")}`;
  }
}

/**
 * Base fetch function for WooCommerce API
 */
type WcFetchOptions = RequestInit & {
  next?: {
    revalidate?: number;
    tags?: string[];
  };
  timeout?: number; // Timeout in milliseconds (default: 3000ms for GET, 30000ms for POST/PUT/DELETE)
};

export async function wcFetch<T>(
  endpoint: string,
  options: WcFetchOptions = {}
): Promise<T> {
  if (!WOO_ENABLED) {
    throw new Error("WooCommerce is disabled (WOO_ENABLED=false).");
  }
  if (!WC_API_URL || !WC_CONSUMER_KEY || !WC_CONSUMER_SECRET) {
    throw new Error(
      "WooCommerce API credentials are not configured. Set WC_API_URL, WC_CONSUMER_KEY, and WC_CONSUMER_SECRET in environment variables."
    );
  }

  const url = `${WC_API_URL}${endpoint}`;
  const headers = {
    "Content-Type": "application/json",
    Authorization: getAuthHeader(),
    ...options.headers,
  };

  try {
    // Create abort controller for timeout (more compatible)
    // Use longer timeout for POST/PUT/DELETE operations (like order creation)
    // Default: 3 seconds for GET requests, 30 seconds for mutations
    const isMutation = options.method && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(options.method.toUpperCase());
    const defaultTimeout = isMutation ? 30000 : 3000; // 30s for mutations, 3s for reads
    const timeout = options.timeout ?? defaultTimeout;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    try {
      const fetchOptions: WcFetchOptions = {
        ...options,
        headers,
        signal: controller.signal,
        // Add keepalive for better connection handling
        keepalive: true,
      };

      // CRITICAL FIX: Only set no-store if no next.revalidate is provided
      // When next.revalidate is set, Next.js handles caching automatically
      // Setting cache: "no-store" prevents static generation
      if (options.cache === undefined && !options.next?.revalidate) {
        fetchOptions.cache = "no-store";
      }
      // If next.revalidate is provided, don't set cache - let Next.js handle it

      const response = await fetch(url, fetchOptions);
      
      clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { message: errorText || "Unknown error" };
      }

      console.error(`[WooCommerce] Error response:`, {
        status: response.status,
        statusText: response.statusText,
        error: errorData,
        url: url,
      });

      const errorMessage =
        errorData.message ||
        errorData.error?.message ||
        `HTTP error! status: ${response.status}`;
      const error = new Error(errorMessage);
      (error as any).status = response.status;
      (error as any).statusText = response.statusText;
      (error as any).data = errorData;
      throw error;
    }

      const data = await response.json();
      return data;
    } catch (fetchError: any) {
      clearTimeout(timeoutId);
      throw fetchError;
    }
  } catch (error: any) {
    // Enhanced error logging
    const errorDetails: any = {
      message: error?.message || String(error),
      name: error?.name,
      url: url,
    };
    
    // Add more details if available
    if (error?.cause) errorDetails.cause = error.cause;
    if (error?.code) errorDetails.code = error.code;
    if (error?.errno) errorDetails.errno = error.errno;
    if (process.env.NODE_ENV !== 'production' && error?.stack) {
      errorDetails.stack = error.stack;
    }
    
    console.error(`[WooCommerce] Fetch error:`, errorDetails);
    
    // Check for specific error types
    if (error?.name === 'AbortError' || error?.message?.includes('aborted') || error?.message?.includes('timeout')) {
      const timeoutSeconds = Math.round((options.timeout ?? (options.method && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(options.method.toUpperCase()) ? 30000 : 3000)) / 1000);
      const timeoutError = new Error(`Request to WooCommerce API timed out after ${timeoutSeconds} seconds. URL: ${url}`);
      (timeoutError as any).code = 'TIMEOUT';
      (timeoutError as any).status = 504;
      throw timeoutError;
    }
    
    if (error?.message?.includes('certificate') || error?.message?.includes('SSL') || error?.message?.includes('TLS') || error?.code === 'CERT_HAS_EXPIRED') {
      throw new Error(`SSL/TLS certificate error when connecting to WooCommerce. Please check your SSL certificate. URL: ${url}`);
    }
    
    if (error?.code === 'ECONNREFUSED' || error?.code === 'ENOTFOUND' || error?.message?.includes('ECONNREFUSED') || error?.message?.includes('ENOTFOUND')) {
      throw new Error(`Cannot connect to WooCommerce API. Please verify the URL is correct and the server is accessible. URL: ${url}`);
    }
    
    if (error?.message?.includes('fetch failed')) {
      throw new Error(`Network error: Unable to reach WooCommerce API. This could be due to network issues, firewall, or the server being down. URL: ${url}. Original error: ${error?.message || 'Unknown'}`);
    }
    
    throw error;
  }
}

/**
 * Check if WooCommerce is configured
 * Note: Use isWooCommerceEnabled from config.ts instead
 * This is kept for backward compatibility
 */
export function isWooCommerceConfigured(): boolean {
  return !!(
    WC_API_URL &&
    WC_CONSUMER_KEY &&
    WC_CONSUMER_SECRET
  );
}

export const wcConfig = {
  apiUrl: WC_API_URL,
  consumerKey: WC_CONSUMER_KEY,
  // Don't expose secret in client config
};

