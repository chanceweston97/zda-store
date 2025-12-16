/**
 * Medusa Client
 * Simple fetch-based client for Medusa API
 */

import { medusaConfig } from "./config";

export interface MedusaProduct {
  id: string;
  title: string;
  handle: string;
  description?: string;
  thumbnail?: string;
  images?: Array<{ url: string }>;
  categories?: Array<{
    id: string;
    name: string;
    handle: string;
  }>;
  variants?: Array<{
    id: string;
    title: string;
    calculated_price?: {
      calculated_amount: number;
      currency_code: string;
    };
  }>;
  metadata?: Record<string, any>;
  tags?: Array<{ id: string; value: string }>;
  created_at: string;
  updated_at: string;
}

export interface MedusaRegion {
  id: string;
  name: string;
  currency_code: string;
  countries?: Array<{
    id: string;
    iso_2: string;
    name: string;
  }>;
}

export interface MedusaCategory {
  id: string;
  name: string;
  handle: string;
  description?: string;
  parent_category_id?: string;
  category_children?: MedusaCategory[];
  created_at: string;
  updated_at: string;
}

class MedusaClient {
  private baseUrl: string;
  private publishableKey: string;
  private cachedRegionId: string | null = null;
  private regionCacheTime: number = 0;
  private readonly REGION_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  constructor() {
    this.baseUrl = medusaConfig.backendUrl;
    this.publishableKey = medusaConfig.publishableKey;
  }

  private async fetch<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      "Content-Type": "application/json",
      "x-publishable-api-key": this.publishableKey,
      ...options.headers,
    };

    // Log the URL being fetched (only in development or if env var is set)
    const shouldLog = process.env.NODE_ENV !== 'production' || process.env.LOG_MEDUSA_FETCH === 'true';
    if (shouldLog) {
      console.log(`[MedusaClient] Fetching: ${url}`);
    }

    try {
      // Simple fetch without timeout to avoid server hangs
      const response = await fetch(url, {
        ...options,
        headers,
        cache: "no-store",
      } as RequestInit);

      if (!response.ok) {
        const errorText = await response.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { message: errorText || "Unknown error" };
        }
        
        // Always log errors in production for debugging
        console.error(`[MedusaClient] Error response:`, {
          status: response.status,
          statusText: response.statusText,
          error: errorData,
          url: url,
          backendUrl: this.baseUrl,
        });
        
        const errorMessage = errorData.message || errorData.error?.message || `HTTP error! status: ${response.status}`;
        const error = new Error(errorMessage);
        (error as any).status = response.status;
        (error as any).statusText = response.statusText;
        (error as any).data = errorData;
        (error as any).url = url;
        throw error;
      }

      const data = await response.json();
      return data;
    } catch (error: any) {
      // Simple error logging - avoid complex error handling that might cause hangs
      console.error(`[MedusaClient] Fetch error:`, error?.message || error);
      throw error;
    }
  }

  /**
   * Get all products
   */
  async getProducts(params?: {
    limit?: number;
    offset?: number;
    region_id?: string;
    fields?: string;
  }): Promise<{ products: MedusaProduct[]; count: number }> {
    // Use cached region ID if not provided (avoids fetching on every request)
    let regionId = params?.region_id;
    
    if (!regionId) {
      const cached = await this.getCachedRegionId();
      regionId = cached || undefined;
    }

    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.offset) queryParams.append("offset", params.offset.toString());
    if (regionId) queryParams.append("region_id", regionId);
    // Include categories in the response (required for filtering)
    if (params?.fields) {
      queryParams.append("fields", params.fields);
    } else {
      // Default: include categories and variants for pricing
      queryParams.append("fields", "*variants.calculated_price,*categories");
    }

    const query = queryParams.toString();
    const endpoint = `/store/products${query ? `?${query}` : ""}`;
    
    return this.fetch<{ products: MedusaProduct[]; count: number }>(endpoint);
  }

  /**
   * Get product by handle
   */
  async getProductByHandle(handle: string, regionId?: string): Promise<{ product: MedusaProduct }> {
    const queryParams = new URLSearchParams();
    // Use handle as query parameter, not path parameter (Medusa API requirement)
    queryParams.append("handle", handle);
    if (regionId) queryParams.append("region_id", regionId);
    // Request all fields including metadata, subtitle, images, description, categories, and variant fields
    // Note: Medusa API requires specific field syntax - use *metadata to get all metadata fields
    queryParams.append("fields", "*variants.calculated_price,*variants.options,*variants.inventory_quantity,*variants.metadata,*variants.sku,*variants.title,*images,*categories,*tags,title,description,subtitle,*metadata");

    const query = queryParams.toString();
    // Use /store/products with handle query parameter (not /store/products/{handle})
    return this.fetch<{ products: MedusaProduct[] }>(
      `/store/products?${query}`
    ).then((response) => {
      // The API returns an array of products, we need the first one
      if (response.products && response.products.length > 0) {
        const product = response.products[0];
        // Debug: Log metadata to verify it's being returned
        console.log(`[getProductByHandle] Product metadata for ${handle}:`, {
          hasMetadata: !!product.metadata,
          metadataKeys: product.metadata ? Object.keys(product.metadata) : [],
          subtitle: product.metadata?.subtitle,
          datasheetImage: product.metadata?.datasheetImage,
          datasheetPdf: product.metadata?.datasheetPdf,
        });
        return { product };
      }
      throw new Error(`Product with handle: ${handle} was not found`);
    });
  }

  /**
   * Get all regions (with caching)
   */
  async getRegions(): Promise<{ regions: MedusaRegion[] }> {
    return this.fetch<{ regions: MedusaRegion[] }>("/store/regions");
  }

  /**
   * Get cached region ID (avoids fetching on every request)
   */
  async getCachedRegionId(): Promise<string | null> {
    // Return cached region if still valid
    if (this.cachedRegionId && Date.now() - this.regionCacheTime < this.REGION_CACHE_TTL) {
      return this.cachedRegionId;
    }

    // Fetch and cache region
    try {
      const regions = await this.getRegions();
      if (regions.regions && regions.regions.length > 0) {
        this.cachedRegionId = regions.regions[0].id;
        this.regionCacheTime = Date.now();
        return this.cachedRegionId;
      }
    } catch (error) {
      console.warn(`[MedusaClient] Could not fetch regions for caching:`, error);
    }
    return null;
  }

  /**
   * Get region by country code
   */
  async getRegionByCountryCode(countryCode: string): Promise<MedusaRegion | null> {
    const { regions } = await this.getRegions();
    for (const region of regions) {
      if (region.countries?.some((c) => c.iso_2.toLowerCase() === countryCode.toLowerCase())) {
        return region;
      }
    }
    return null;
  }

  /**
   * Get all product categories
   */
  async getCategories(): Promise<{ product_categories: MedusaCategory[] }> {
    try {
      // Try the standard endpoint first
      return await this.fetch<{ product_categories: MedusaCategory[] }>("/store/product-categories");
    } catch (error: any) {
      // If that fails, try alternative endpoint format
      if (error.status === 404) {
        console.warn("[MedusaClient] /store/product-categories not found, trying /store/categories");
        return await this.fetch<{ product_categories: MedusaCategory[] }>("/store/categories");
      }
      throw error;
    }
  }

  /**
   * Get category by handle
   * According to Medusa API docs, categories should be queried, not fetched by ID
   */
  async getCategoryByHandle(handle: string): Promise<{ product_category: MedusaCategory }> {
    // Query categories by handle (not fetch by ID)
    const queryParams = new URLSearchParams();
    queryParams.append("handle", handle);
    
    try {
      const url = `/store/product-categories?${queryParams.toString()}`;
      console.log(`[MedusaClient] Fetching category: ${this.baseUrl}${url}`);
      
      const response = await this.fetch<{ product_categories: MedusaCategory[] }>(url);
      
      if (response.product_categories && response.product_categories.length > 0) {
        return { product_category: response.product_categories[0] };
      }
      
      // Category not found - return empty response instead of throwing
      console.warn(`[MedusaClient] Category with handle "${handle}" not found`);
      return { product_category: null as any };
    } catch (error: any) {
      console.error(`[MedusaClient] Error fetching category by handle ${handle}:`, {
        error: error?.message || error,
        status: error?.status,
        statusText: error?.statusText,
        url: `${this.baseUrl}/store/product-categories?handle=${handle}`,
      });
      // Re-throw to let caller handle it
      throw error;
    }
  }

  /**
   * Get products by category ID(s)
   * Returns products and count for the specified category
   */
  async getProductsByCategoryId(categoryIds: string[], params?: {
    limit?: number;
    offset?: number;
    region_id?: string;
  }): Promise<{ products: MedusaProduct[]; count: number; limit: number; offset: number }> {
    // Use cached region ID if not provided (avoids fetching on every request)
    let regionId = params?.region_id;
    
    if (!regionId) {
      const cached = await this.getCachedRegionId();
      regionId = cached || undefined;
    }

    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.offset) queryParams.append("offset", params.offset.toString());
    if (regionId) queryParams.append("region_id", regionId);
    // Include categories in the response (required for filtering)
    queryParams.append("fields", "*variants.calculated_price,*categories");
    
    // Add category_id[] for each category
    categoryIds.forEach((id) => {
      queryParams.append("category_id[]", id);
    });

    const query = queryParams.toString();
    const endpoint = `/store/products${query ? `?${query}` : ""}`;
    
    return this.fetch<{ products: MedusaProduct[]; count: number; limit: number; offset: number }>(endpoint);
  }

  /**
   * Initiate payment session for a cart
   * This creates the payment collection automatically (like frontend project)
   * In Medusa v2, this should create the payment collection if it doesn't exist
   */
  async initiatePaymentSession(cart: any, data: { provider_id: string }): Promise<any> {
    const paymentCollectionId = cart?.payment_collection?.id;
    
    if (paymentCollectionId) {
      // Payment collection exists, create session for it
      console.log("[MedusaClient] Payment collection exists, creating session for it:", paymentCollectionId);
      return this.fetch(
        `/store/payment-collections/${paymentCollectionId}/payment-sessions`,
        {
          method: "POST",
          body: JSON.stringify({
            provider_id: data.provider_id,
          }),
        }
      );
    } else {
      // No payment collection yet - try to create it via payment session initiation
      // In Medusa v2, initiating a payment session should create the payment collection
      console.log("[MedusaClient] No payment collection found, attempting to create via payment session initiation");
      
      // Try the payment collections endpoint directly (create payment collection first)
      try {
        // First, try to create payment collection for the cart
        const createCollectionResponse = await this.fetch(
          `/store/payment-collections`,
          {
            method: "POST",
            body: JSON.stringify({
              cart_id: cart.id,
            }),
          }
        );
        
        // If successful, create payment session for the new collection
        const newCollectionId = createCollectionResponse?.payment_collection?.id || createCollectionResponse?.id;
        if (newCollectionId) {
          console.log("[MedusaClient] Payment collection created, now creating session:", newCollectionId);
          return this.fetch(
            `/store/payment-collections/${newCollectionId}/payment-sessions`,
            {
              method: "POST",
              body: JSON.stringify({
                provider_id: data.provider_id,
              }),
            }
          );
        }
      } catch (createError: any) {
        console.warn("[MedusaClient] Failed to create payment collection directly:", createError.message);
      }
      
      // Fallback: Try to initiate via cart endpoint (Medusa might create collection automatically)
      try {
        console.log("[MedusaClient] Trying cart payment-sessions endpoint as fallback");
        return this.fetch(
          `/store/carts/${cart.id}/payment-sessions`,
          {
            method: "POST",
            body: JSON.stringify({
              provider_id: data.provider_id,
            }),
          }
        );
      } catch (error: any) {
        console.error("[MedusaClient] Payment session initiation failed:", error.message);
        throw new Error(`Failed to initiate payment session: ${error.message || "Unknown error"}`);
      }
    }
  }
}

// Export singleton instance first
const medusaClientInstance = new MedusaClient();

// Add store.payment namespace to match frontend SDK structure
// Do this after instance is created to avoid initialization errors
(medusaClientInstance as any).store = {
  payment: {
    initiatePaymentSession: (cart: any, data: { provider_id: string }) => {
      return medusaClientInstance.initiatePaymentSession(cart, data);
    },
  },
};

// Export the instance
export const medusaClient = medusaClientInstance;

