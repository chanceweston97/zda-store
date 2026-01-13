/**
 * WooCommerce Product Functions
 */

import { wcFetch } from "./client";

export interface WooCommerceProduct {
  id: number;
  name: string;
  slug: string;
  permalink: string;
  description?: string;
  short_description?: string;
  sku?: string;
  price?: string;
  regular_price?: string;
  sale_price?: string;
  images?: Array<{
    id: number;
    src: string;
    name: string;
    alt: string;
  }>;
  categories?: Array<{
    id: number;
    name: string;
    slug: string;
  }>;
  attributes?: Array<{
    id: number;
    name: string;
    options: string[];
  }>;
  variations?: number[];
  meta_data?: Array<{
    id: number;
    key: string;
    value: any;
  }>;
  type?: string;
  status?: string;
  catalog_visibility?: "visible" | "catalog" | "search" | "hidden";
}

/**
 * Get all products from WooCommerce
 */
export async function getProducts(params?: {
  per_page?: number;
  page?: number;
  category?: number;
  search?: string;
  orderby?: string;
  order?: "asc" | "desc";
}): Promise<WooCommerceProduct[]> {
  const queryParams = new URLSearchParams();
  
  if (params?.per_page) queryParams.append("per_page", params.per_page.toString());
  if (params?.page) queryParams.append("page", params.page.toString());
  if (params?.category) queryParams.append("category", params.category.toString());
  if (params?.search) queryParams.append("search", params.search);
  if (params?.orderby) queryParams.append("orderby", params.orderby);
  if (params?.order) queryParams.append("order", params.order);

  const query = queryParams.toString();
  // WC_API_URL already includes /wp-json/wc/v3, so just use /products
  const endpoint = `/products${query ? `?${query}` : ""}`;
  
  const products = await wcFetch<WooCommerceProduct[]>(endpoint);
  
  // Filter out products with catalog_visibility = "hidden"
  // These products should not appear in shop pages
  return products.filter(product => product.catalog_visibility !== "hidden");
}

/**
 * Get product by ID
 */
export async function getProductById(id: number): Promise<WooCommerceProduct> {
  // WC_API_URL already includes /wp-json/wc/v3, so just use /products
  return wcFetch<WooCommerceProduct>(`/products/${id}`);
}

/**
 * Get product by slug
 * WooCommerce REST API doesn't have a direct "get by slug" endpoint,
 * so we search and filter by slug
 */
export async function getProductBySlug(slug: string): Promise<WooCommerceProduct | null> {
  try {
    // First try to get products with the slug
    // WooCommerce search might not find by slug directly, so we'll fetch and filter
    // Note: getProducts already filters hidden products, so we don't need to filter again
    const products = await getProducts({ per_page: 100 });
    const product = products.find(p => p.slug === slug);
    
    if (product) {
      // Double-check catalog visibility (should already be filtered, but be safe)
      if (product.catalog_visibility === "hidden") {
        return null;
      }
      return product;
    }
    
    // If not found in first 100, try searching (though search might not match slug)
    const searchResults = await getProducts({ search: slug, per_page: 10 });
    const foundProduct = searchResults.find(p => p.slug === slug);
    
    // Double-check catalog visibility
    if (foundProduct && foundProduct.catalog_visibility === "hidden") {
      return null;
    }
    
    return foundProduct || null;
  } catch (error) {
    console.error(`[getProductBySlug] Error fetching product by slug ${slug}:`, error);
    return null;
  }
}

/**
 * Convert WooCommerce product with full variation details
 * This is used for PDP where we need complete variant information
 */
export async function convertWCToSanityProductWithVariations(wcProduct: WooCommerceProduct): Promise<any> {
  // First do the basic conversion
  const baseProduct = await convertWCToSanityProduct(wcProduct);
  
  // If product has variations, fetch full variation details
  if (wcProduct.variations && wcProduct.variations.length > 0) {
    try {
      const variations = await getProductVariations(wcProduct.id);
      
      // Update variants with full variation data
      const fullVariants = variations.map((variation: any) => {
        const variationPrice = parseFloat(variation.price || variation.regular_price || variation.sale_price || "0");
        
        // Build variant title from attributes (e.g., "Color: Red, Size: Large" or "Gain: 8dBi")
        let variantTitle = wcProduct.name;
        if (variation.attributes && Array.isArray(variation.attributes) && variation.attributes.length > 0) {
          const attributeStrings = variation.attributes
            .filter((attr: any) => attr.name && attr.option)
            .map((attr: any) => `${attr.name}: ${attr.option}`);
          if (attributeStrings.length > 0) {
            variantTitle = attributeStrings.join(", ");
          }
        } else if (variation.name && variation.name !== wcProduct.name) {
          variantTitle = variation.name;
        }
        
        // Extract gain value for sorting (e.g., "Gain: 8dBi" -> 8, or "8dBi" -> 8)
        let gainValue = 0;
        const gainMatch = variantTitle.match(/(\d+(?:\.\d+)?)\s*dBi/i);
        if (gainMatch) {
          gainValue = parseFloat(gainMatch[1]);
        } else if (variation.attributes && Array.isArray(variation.attributes)) {
          // Try to extract from attributes
          const gainAttr = variation.attributes.find((attr: any) => 
            attr.name?.toLowerCase() === 'gain' || attr.slug?.toLowerCase() === 'gain'
          );
          if (gainAttr?.option) {
            const match = gainAttr.option.match(/(\d+(?:\.\d+)?)/);
            if (match) gainValue = parseFloat(match[1]);
          }
        }
        
        const variant = {
          id: variation.id.toString(),
          title: variantTitle,
          sku: variation.sku || "",
          price: variationPrice, // In dollars
          calculated_price: {
            calculated_amount: variationPrice * 100, // Convert to cents
            currency_code: "USD",
          },
          inventory_quantity: variation.stock_quantity || 0,
          options: variation.attributes || [],
          gainValue: gainValue, // Store gain value for sorting
          menu_order: variation.menu_order || 0, // Store menu_order as fallback
          metadata: {
            ...baseProduct.metadata,
            variation_id: variation.id,
            variation_attributes: variation.attributes,
          },
        };
        return variant;
      });
      
      // Sort variants by gain value (smallest to largest), then by menu_order as fallback
      fullVariants.sort((a: any, b: any) => {
        // If both have gain values, sort by gain
        if (a.gainValue > 0 && b.gainValue > 0) {
          return a.gainValue - b.gainValue;
        }
        // If only one has gain value, prioritize it
        if (a.gainValue > 0 && b.gainValue === 0) return -1;
        if (a.gainValue === 0 && b.gainValue > 0) return 1;
        // Fallback to menu_order
        return (a.menu_order || 0) - (b.menu_order || 0);
      });
      
      // Replace placeholder variants with full variant data
      baseProduct.variants = fullVariants;
    } catch (error) {
      console.error(`[convertWCToSanityProductWithVariations] Error fetching variations:`, error);
      // Keep the placeholder variants if fetch fails
    }
  }
  
  return baseProduct;
}

/**
 * Resolve WordPress media ID to URL
 * WordPress REST API endpoint: /wp-json/wp/v2/media/{id}
 */
async function resolveMediaId(mediaId: number | string | null | undefined): Promise<string | null> {
  if (!mediaId) return null;
  
  // If it's already a URL, return it
  if (typeof mediaId === 'string' && (mediaId.startsWith('http://') || mediaId.startsWith('https://'))) {
    return mediaId;
  }
  
  // If it's not a number, return null
  const id = typeof mediaId === 'string' ? parseInt(mediaId, 10) : mediaId;
  if (isNaN(id) || id <= 0) {
    return null;
  }
  
  try {
    const WC_SITE_URL = process.env.NEXT_PUBLIC_WC_SITE_URL || "";
    if (!WC_SITE_URL) {
      console.warn(`[resolveMediaId] WC_SITE_URL not configured, cannot resolve media ID ${id}`);
      return null;
    }
    
    // WordPress REST API endpoint for media
    const mediaUrl = `${WC_SITE_URL}/wp-json/wp/v2/media/${id}`;
    
    const response = await fetch(mediaUrl);
    if (!response.ok) {
      console.warn(`[resolveMediaId] Failed to fetch media ${id}: ${response.status} ${response.statusText}`);
      return null;
    }
    
    const mediaData = await response.json();
    // WordPress media object has 'source_url' field
    const url = mediaData.source_url || mediaData.guid?.rendered || null;
    
    if (url) {
      // Media ID resolved successfully
    } else {
      console.warn(`[resolveMediaId] Media ${id} has no source_url or guid`);
    }
    
    return url;
  } catch (error) {
    console.error(`[resolveMediaId] Error resolving media ID ${id}:`, error);
    return null;
  }
}

/**
 * Get product variations for a specific product
 */
export async function getProductVariations(productId: number): Promise<any[]> {
  try {
    // WC_API_URL already includes /wp-json/wc/v3, so just use /products/{id}/variations
    const variations = await wcFetch<any[]>(`/products/${productId}/variations?per_page=100`);
    return variations || [];
  } catch (error) {
    console.error(`[getProductVariations] Error fetching variations for product ${productId}:`, error);
    return [];
  }
}

/**
 * Get product categories
 */
export async function getCategories(): Promise<Array<{
  id: number;
  name: string;
  slug: string;
  description?: string;
  count?: number;
  parent?: number;
}>> {
  // WC_API_URL already includes /wp-json/wc/v3, so just use /products/categories
  return wcFetch<Array<{
    id: number;
    name: string;
    slug: string;
    description?: string;
    count?: number;
    parent?: number;
  }>>("/products/categories?per_page=100");
}

/**
 * Convert WooCommerce product to Sanity/Medusa format for compatibility
 * This matches the format expected by the shop page components
 * @param skipVariations - If true, skip fetching variations (faster for listing pages)
 */
export async function convertWCToSanityProduct(wcProduct: WooCommerceProduct, skipVariations: boolean = false): Promise<any> {
  // Helper function to strip HTML tags from text
  const stripHTML = (html: string): string => {
    if (!html) return "";
    // Remove HTML tags but keep text content
    return html.replace(/<[^>]*>/g, "").trim();
  };

  // Parse price - WooCommerce prices are strings in the store currency (dollars)
  // The price field should be in dollars (components multiply by 100 for display)
  const priceStr = wcProduct.sale_price || wcProduct.price || wcProduct.regular_price || "0";
  const price = parseFloat(priceStr); // Keep in dollars (matching Medusa format where price is in dollars)

  // Convert images to expected format
  const thumbnails = (wcProduct.images && wcProduct.images.length > 0)
    ? wcProduct.images.map((img) => ({
        image: img.src,
        color: null,
      }))
    : [];

  const previewImages = thumbnails.length > 0 ? thumbnails : [];

  // Get primary category (first category)
  const primaryCategory = wcProduct.categories && wcProduct.categories.length > 0
    ? wcProduct.categories[0]
    : null;

  const category = primaryCategory
    ? {
        _id: primaryCategory.id.toString(),
        id: primaryCategory.id.toString(),
        name: primaryCategory.name,
        slug: {
          current: primaryCategory.slug,
        },
        title: primaryCategory.name,
        handle: primaryCategory.slug,
      }
    : undefined;

  // Store all categories for filtering
  const allCategories = (wcProduct.categories || []).map((cat) => ({
    id: cat.id.toString(),
    _id: cat.id.toString(),
    name: cat.name,
    handle: cat.slug,
    slug: {
      current: cat.slug,
    },
  }));

  // Extract metadata
  const metadataObj = wcProduct.meta_data?.reduce((acc, meta) => {
    acc[meta.key] = meta.value;
    return acc;
  }, {} as Record<string, any>) || {};

  // Extract product type from metadata or default
  const productType = metadataObj.productType || "antenna";

  // Extract features, applications, etc. from metadata
  const features = typeof metadataObj.features === 'string' 
    ? metadataObj.features 
    : (Array.isArray(metadataObj.features) ? metadataObj.features.join('\n') : null);

  const applications = typeof metadataObj.applications === 'string'
    ? metadataObj.applications
    : (Array.isArray(metadataObj.applications) ? metadataObj.applications.join('\n') : null);

  const specifications = metadataObj.specifications || null;
  // Use subtitle from metadata as shortDescription (priority: subtitle > shortDescription > short_description)
  const subtitle = stripHTML(metadataObj.subtitle || metadataObj.shortDescription || wcProduct.short_description || "");
  const featureTitle = metadataObj.featureTitle ? stripHTML(metadataObj.featureTitle) : null; // Strip HTML from featureTitle
  
  // Get datasheet fields - they might be IDs (numbers) or URLs (strings)
  // Check ACF fields first (they might be in acf object or directly in metadata)
  const datasheetImageRaw = metadataObj.datasheetImage || 
                            metadataObj.datasheet_image || 
                            metadataObj._datasheet_image ||
                            (wcProduct as any).acf?.datasheet_image ||
                            null;
  const datasheetPdfRaw = metadataObj.datasheetPdf || 
                          metadataObj.datasheet_pdf || 
                          metadataObj._datasheet_pdf ||
                          (wcProduct as any).acf?.datasheet_pdf ||
                          null;
  
  // Resolve media IDs to URLs if needed
  // If the value is a number or numeric string, it's likely a media ID
  const isMediaId = (value: any): boolean => {
    if (!value) return false;
    if (typeof value === 'number') return true;
    if (typeof value === 'string') {
      // Skip ACF field keys (they start with 'field_')
      if (value.startsWith('field_')) return false;
      // Check if it's a numeric string (not a URL)
      const num = parseInt(value, 10);
      return !isNaN(num) && num > 0 && !value.startsWith('http');
    }
    return false;
  };
  
  // Helper to check if value is an ACF field key
  const isACFFieldKey = (value: any): boolean => {
    return typeof value === 'string' && value.startsWith('field_');
  };
  
  // ✅ OPTIMIZATION: Skip media ID resolution for listing pages (only needed on PDP)
  // Resolve datasheet image
  let datasheetImage: string | null = null;
  if (datasheetImageRaw && !skipVariations) {
    // Skip ACF field keys - they need to be resolved differently
    if (isACFFieldKey(datasheetImageRaw)) {
      console.warn(`[convertWCToSanityProduct] Product ${wcProduct.id}: datasheetImage is an ACF field key (${datasheetImageRaw}), not a media ID. This needs to be resolved from ACF field data.`);
      datasheetImage = null; // ACF field keys can't be resolved this way
    } else if (isMediaId(datasheetImageRaw)) {
      datasheetImage = await resolveMediaId(datasheetImageRaw);
    } else if (typeof datasheetImageRaw === 'string' && (datasheetImageRaw.startsWith('http://') || datasheetImageRaw.startsWith('https://'))) {
      datasheetImage = datasheetImageRaw;
    } else {
      // Invalid format, skip it
      console.warn(`[convertWCToSanityProduct] Product ${wcProduct.id}: Invalid datasheetImage format:`, datasheetImageRaw);
      datasheetImage = null;
    }
  } else if (datasheetImageRaw && typeof datasheetImageRaw === 'string' && (datasheetImageRaw.startsWith('http://') || datasheetImageRaw.startsWith('https://'))) {
    // For listing pages, only use direct URLs (skip media ID resolution)
    datasheetImage = datasheetImageRaw;
  }
  
  // Resolve datasheet PDF
  let datasheetPdf: string | null = null;
  if (datasheetPdfRaw && !skipVariations) {
    // Skip ACF field keys - they need to be resolved differently
    if (isACFFieldKey(datasheetPdfRaw)) {
      console.warn(`[convertWCToSanityProduct] Product ${wcProduct.id}: datasheetPdf is an ACF field key (${datasheetPdfRaw}), not a media ID. This needs to be resolved from ACF field data.`);
      datasheetPdf = null; // ACF field keys can't be resolved this way
    } else if (isMediaId(datasheetPdfRaw)) {
      datasheetPdf = await resolveMediaId(datasheetPdfRaw);
    } else if (typeof datasheetPdfRaw === 'string' && (datasheetPdfRaw.startsWith('http://') || datasheetPdfRaw.startsWith('https://'))) {
      datasheetPdf = datasheetPdfRaw;
    } else {
      // Invalid format, skip it
      console.warn(`[convertWCToSanityProduct] Product ${wcProduct.id}: Invalid datasheetPdf format:`, datasheetPdfRaw);
      datasheetPdf = null;
    }
  } else if (datasheetPdfRaw && typeof datasheetPdfRaw === 'string' && (datasheetPdfRaw.startsWith('http://') || datasheetPdfRaw.startsWith('https://'))) {
    // For listing pages, only use direct URLs (skip media ID resolution)
    datasheetPdf = datasheetPdfRaw;
  }

  // Handle variants - WooCommerce uses variations
  // Fetch variations to get actual SKUs (required for listing pages to show SKU)
  const variants: any[] = [];
  
  // Check if product has variations
  if (wcProduct.variations && wcProduct.variations.length > 0) {
    // ✅ OPTIMIZATION: Skip variation fetching for listing pages (much faster)
    if (skipVariations) {
      // Create placeholder variants without fetching (for listing pages)
      wcProduct.variations.forEach((variationId: number) => {
        variants.push({
          id: variationId.toString(),
          title: wcProduct.name,
          sku: wcProduct.sku || "",
          price: price,
          calculated_price: {
            calculated_amount: price * 100,
            currency_code: "USD",
          },
          inventory_quantity: 0,
          options: [],
          metadata: {
            ...metadataObj,
            variation_id: variationId,
            _needsVariationFetch: true,
          },
        });
      });
    } else {
      // Fetch full variation details (for product detail pages)
      try {
        // Fetch actual variations to get their SKUs
        // This is required because WooCommerce doesn't include variation data in product listings
        const variations = await getProductVariations(wcProduct.id);
      
      // Sort variations by ID (ascending) to ensure first variation is the one with lowest ID
      const sortedVariations = [...variations].sort((a: any, b: any) => {
        return (a.id || 0) - (b.id || 0);
      });
      
      // Map variations to variants with actual SKU data
      sortedVariations.forEach((variation: any) => {
        const variationPrice = parseFloat(variation.price || variation.regular_price || variation.sale_price || priceStr || "0");
        
        variants.push({
          id: variation.id.toString(),
          title: wcProduct.name,
          sku: variation.sku || wcProduct.sku || "", // Use variation SKU, fallback to parent SKU
          price: variationPrice,
          calculated_price: {
            calculated_amount: variationPrice * 100,
            currency_code: "USD",
          },
          inventory_quantity: variation.stock_quantity || 0,
          options: variation.attributes || [],
          metadata: {
            ...metadataObj,
            variation_id: variation.id,
            variation_attributes: variation.attributes,
          },
        });
      });
      } catch (error) {
        console.error(`[convertWCToSanityProduct] Error fetching variations for product ${wcProduct.id}:`, error);
        // Fallback: create placeholder variants if fetch fails
        wcProduct.variations.forEach((variationId: number) => {
          variants.push({
            id: variationId.toString(),
            title: wcProduct.name,
            sku: wcProduct.sku || "",
            price: price,
            calculated_price: {
              calculated_amount: price * 100,
              currency_code: "USD",
            },
            inventory_quantity: 0,
            options: [],
            metadata: {
              ...metadataObj,
              variation_id: variationId,
              _needsVariationFetch: true,
            },
          });
        });
      }
    }
  } else {
    // For simple products without variations, create a single variant
    variants.push({
      id: wcProduct.id.toString(),
      title: wcProduct.name,
      sku: wcProduct.sku || "",
      price: price,
      calculated_price: {
        calculated_amount: price * 100,
        currency_code: "USD",
      },
      inventory_quantity: 0,
      options: [],
      metadata: metadataObj,
    });
  }

  // Extract gainOptions and lengthOptions from metadata or attributes
  const gainOptions = metadataObj.gainOptions || [];
  const lengthOptions = metadataObj.lengthOptions || [];

  // Build description - WooCommerce description is HTML, store it as a string
  // The Description component will handle HTML rendering
  const description = wcProduct.description || wcProduct.short_description || "";

  return {
    _id: wcProduct.id.toString(),
    _type: "product",
    name: stripHTML(wcProduct.name), // Strip HTML from name
    slug: {
      current: wcProduct.slug,
    },
    productType,
    price,
    thumbnails,
    previewImages,
    category,
    description,
    shortDescription: subtitle, // Use subtitle from metadata (from WordPress admin)
    inStock: wcProduct.status === "publish", // Published products are in stock
    status: wcProduct.status === "publish",
    tags: [], // WooCommerce uses tags differently, extract if needed
    features,
    applications,
    specifications,
    subtitle,
    featureTitle,
    metadata: {
      ...metadataObj,
      datasheetImage,
      datasheetPdf,
      features,
      applications,
      specifications,
      subtitle,
      featureTitle,
    },
    variants,
    gainOptions,
    lengthOptions,
    datasheetImage,
    datasheetPdf,
    categories: allCategories,
    handle: wcProduct.slug,
    sku: wcProduct.sku,
    // Include datasheet fields at top level for easy access in components
    datasheetImage: datasheetImage,
    datasheetPdf: datasheetPdf,
  };
}

