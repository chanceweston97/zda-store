/**
 * WooCommerce API Client
 * Handles authentication and base API requests
 */

const WC_API_URL = process.env.NEXT_PUBLIC_WC_API_URL || "";
const WC_CONSUMER_KEY = process.env.NEXT_PUBLIC_WC_CONSUMER_KEY || "";
const WC_CONSUMER_SECRET = process.env.NEXT_PUBLIC_WC_CONSUMER_SECRET || "";

// SSL verification setting (for development with self-signed certificates)
const WC_DISABLE_SSL_VERIFY = process.env.NEXT_PUBLIC_WC_DISABLE_SSL_VERIFY === "true";

// Create custom HTTPS agent for Node.js (server-side only)
let httpsAgent: any = null;
if (typeof window === "undefined") {
  try {
    const https = require("https");
    httpsAgent = new https.Agent({
      rejectUnauthorized: !WC_DISABLE_SSL_VERIFY,
    });
  } catch (e) {
    // https module not available (shouldn't happen in Node.js)
    console.warn("[WooCommerce] Could not create HTTPS agent:", e);
  }
}

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
export async function wcFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
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
    console.log(`[WooCommerce] Making request to: ${url}`);
    console.log(`[WooCommerce] Method: ${options.method || 'GET'}`);
    
    // Create abort controller for timeout (more compatible)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
    
    try {
      // For Node.js server-side, use custom agent if SSL verification is disabled
      const fetchOptions: RequestInit = {
        ...options,
        headers,
        cache: "no-store",
        signal: controller.signal,
        keepalive: true,
      };

      // For Node.js server-side, handle SSL certificate issues
      if (typeof window === "undefined") {
        // If SSL verification is explicitly disabled, set the environment variable
        // Note: This affects all Node.js HTTPS requests, so use with caution
        if (WC_DISABLE_SSL_VERIFY) {
          const originalValue = process.env.NODE_TLS_REJECT_UNAUTHORIZED;
          process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
          console.warn("[WooCommerce] SSL verification disabled via NEXT_PUBLIC_WC_DISABLE_SSL_VERIFY. This should only be used in development!");
          
          // Restore original value after fetch (though this may not work perfectly)
          // The better approach is to fix the SSL certificate
        }
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
    if (error?.name === 'AbortError' || error?.message?.includes('aborted')) {
      throw new Error(`Request to WooCommerce API timed out after 30 seconds. Please check your network connection and try again. URL: ${url}`);
    }
    
    // Check for SSL certificate errors
    const isCertificateError = 
      error?.message?.includes('certificate') || 
      error?.message?.includes('SSL') || 
      error?.message?.includes('TLS') || 
      error?.code === 'CERT_HAS_EXPIRED' ||
      error?.cause?.message?.includes('certificate') ||
      error?.cause?.message?.includes('does not match certificate');

    if (isCertificateError) {
      const errorMsg = `SSL/TLS certificate error when connecting to WooCommerce API. `;
      const solutionMsg = typeof window === "undefined" 
        ? `To bypass SSL verification in development, set NEXT_PUBLIC_WC_DISABLE_SSL_VERIFY=true in your .env file. ` +
          `⚠️ WARNING: This should only be used in development! In production, fix the SSL certificate on your server.`
        : `Please check your SSL certificate configuration.`;
      throw new Error(errorMsg + solutionMsg + ` URL: ${url}`);
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

