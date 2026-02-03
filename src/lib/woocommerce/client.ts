/**
 * WooCommerce API Client
 * Handles authentication and base API requests
 */

// Normalize: no trailing slash so endpoint "/products" builds correct URL
const WC_API_URL = (process.env.NEXT_PUBLIC_WC_API_URL || "").replace(/\/+$/, "");
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
  timeout?: number; // Timeout in milliseconds (default: 10s for GET, 30s for mutations)
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

  const method = (options.method || "GET").toUpperCase();
  const isGet = method === "GET";

  // Build URL: for GET, pass credentials as query params (matches browser; some servers strip Basic Auth)
  const authParams = new URLSearchParams({
    consumer_key: WC_CONSUMER_KEY,
    consumer_secret: WC_CONSUMER_SECRET,
  });
  const baseUrl = `${WC_API_URL}${endpoint}`;
  const url = isGet
    ? `${baseUrl}${baseUrl.includes("?") ? "&" : "?"}${authParams.toString()}`
    : baseUrl;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (!isGet) {
    headers.Authorization = getAuthHeader();
  }

  try {
    // Timeout: 10s for GET (Cloudflare caches WordPress), 30s for mutations
    const isMutation = options.method && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(options.method.toUpperCase());
    const defaultTimeout = isMutation ? 30000 : 10000;
    const timeout = options.timeout ?? defaultTimeout;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const fetchOptions: WcFetchOptions = {
        ...options,
        headers,
        signal: controller.signal,
        keepalive: true,
      };
      // Let Cloudflare cache WordPress API; Next.js does not cache
      if (options.cache === undefined) {
        fetchOptions.cache = "no-store";
      }

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
      const timeoutSeconds = Math.round((options.timeout ?? (options.method && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(options.method.toUpperCase()) ? 30000 : 10000)) / 1000);
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

