/**
 * WooCommerce Product Functions
 * Cloudflare caches WordPress API; Next.js uses no-store so responses are correct per request.
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
 * Get all products from WooCommerce (no Next.js cache; Cloudflare caches at edge)
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
  const endpoint = `/products${query ? `?${query}` : ""}`;

  const products = await wcFetch<WooCommerceProduct[]>(endpoint);
  return products.filter((product) => {
    const visibility = (product.catalog_visibility || "").toLowerCase();
    const isVisible =
      visibility !== "hidden" &&
      visibility !== "search" &&
      product.status !== "private" &&
      product.status !== "draft";
    const hasCategory =
      (product.categories?.length || 0) > 0 &&
      !product.categories?.some((cat) => cat.slug === "uncategorized");
    return isVisible && hasCategory;
  });
}

/**
 * Get product by ID
 */
export async function getProductById(id: number): Promise<WooCommerceProduct> {
  return wcFetch<WooCommerceProduct>(`/products/${id}`);
}

/**
 * Get product by slug (WooCommerce ?slug= query)
 */
export async function getProductBySlug(slug: string): Promise<WooCommerceProduct | null> {
  try {
    const endpoint = `/products?slug=${encodeURIComponent(slug)}&per_page=1`;
    const products = await wcFetch<WooCommerceProduct[]>(endpoint);
    const product = Array.isArray(products) && products.length > 0 ? products[0] : null;
    if (product) {
      if (
        product.catalog_visibility === "hidden" ||
        product.catalog_visibility === "search" ||
        product.status === "private" ||
        product.status === "draft" ||
        !product.categories?.length ||
        product.categories?.some((cat) => (cat as any).slug === "uncategorized")
      ) {
        return null;
      }
      return product;
    }
    const searchResults = await getProducts({ search: slug, per_page: 10 });
    const found = searchResults.find((p) => p.slug === slug);
    if (found && (found.catalog_visibility === "hidden" || found.catalog_visibility === "search")) return null;
    return found || null;
  } catch (error) {
    console.error(`[getProductBySlug] Error for slug ${slug}:`, error);
    return null;
  }
}

/**
 * Convert WooCommerce product with full variation details
 * This is used for PDP where we need complete variant information
 */
export async function convertWCToProductWithVariations(wcProduct: WooCommerceProduct): Promise<any> {
  // First do the basic conversion
  const baseProduct = await convertWCToProduct(wcProduct);
  
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
      console.error(`[convertWCToProductWithVariations] Error fetching variations:`, error);
      // Keep the placeholder variants if fetch fails
    }
  }
  
  return baseProduct;
}

/**
 * Convert WooCommerce variations → frontend `variants` format.
 * Used by server API routes so PDP can load variations lazily client-side.
 */
export function convertWCVariationsToVariants(params: {
  productName: string;
  baseMetadata?: Record<string, any>;
  variations: any[];
}): any[] {
  const { productName, baseMetadata = {}, variations } = params;

  const fullVariants = (variations || []).map((variation: any) => {
    const variationPrice = parseFloat(
      variation.price || variation.regular_price || variation.sale_price || "0"
    );

    // Build variant title from attributes
    let variantTitle = productName;
    if (variation.attributes && Array.isArray(variation.attributes) && variation.attributes.length > 0) {
      const attributeStrings = variation.attributes
        .filter((attr: any) => attr.name && attr.option)
        .map((attr: any) => `${attr.name}: ${attr.option}`);
      if (attributeStrings.length > 0) {
        variantTitle = attributeStrings.join(", ");
      }
    } else if (variation.name && variation.name !== productName) {
      variantTitle = variation.name;
    }

    // Extract gain value for sorting (e.g., "Gain: 8dBi" -> 8)
    let gainValue = 0;
    const gainMatch = variantTitle.match(/(\d+(?:\.\d+)?)\s*dBi/i);
    if (gainMatch) {
      gainValue = parseFloat(gainMatch[1]);
    } else if (variation.attributes && Array.isArray(variation.attributes)) {
      const gainAttr = variation.attributes.find(
        (attr: any) =>
          attr.name?.toLowerCase() === "gain" || attr.slug?.toLowerCase() === "gain"
      );
      if (gainAttr?.option) {
        const match = String(gainAttr.option).match(/(\d+(?:\.\d+)?)/);
        if (match) gainValue = parseFloat(match[1]);
      }
    }

    return {
      id: String(variation.id),
      title: variantTitle,
      sku: variation.sku || "",
      price: variationPrice, // dollars
      calculated_price: {
        calculated_amount: variationPrice * 100,
        currency_code: "USD",
      },
      inventory_quantity: variation.stock_quantity || 0,
      options: variation.attributes || [],
      gainValue,
      menu_order: variation.menu_order || 0,
      metadata: {
        ...baseMetadata,
        variation_id: variation.id,
        variation_attributes: variation.attributes,
      },
    };
  });

  fullVariants.sort((a: any, b: any) => {
    if (a.gainValue > 0 && b.gainValue > 0) return a.gainValue - b.gainValue;
    if (a.gainValue > 0 && b.gainValue === 0) return -1;
    if (a.gainValue === 0 && b.gainValue > 0) return 1;
    return (a.menu_order || 0) - (b.menu_order || 0);
  });

  return fullVariants;
}

/**
 * Fetch product from WordPress REST API with ACF in standard format.
 * ACF returns image URLs instead of IDs when using ?acf_format=standard.
 * Used for PDP so images (thumbnails, datasheet, etc.) display correctly.
 */
async function fetchProductWithACF(productId: number): Promise<{ acf?: Record<string, any>; [key: string]: any } | null> {
  const baseUrl = (process.env.NEXT_PUBLIC_WC_SITE_URL || "").replace(/\/+$/, "");
  if (!baseUrl) return null;
  try {
    const url = `${baseUrl}/wp-json/wp/v2/product/${productId}?acf_format=standard`;
    const response = await fetch(url, { next: { revalidate: 60 } });
    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    console.warn(`[fetchProductWithACF] Failed for product ${productId}:`, error);
    return null;
  }
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
    
    const mediaUrl = `${WC_SITE_URL}/wp-json/wp/v2/media/${id}`;
    const response = await fetch(mediaUrl, { next: { revalidate: 60 } });
    
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
 * Get product variations for a specific product (PDP only)
 */
export async function getProductVariations(productId: number): Promise<any[]> {
  const variations = await wcFetch<any[]>(`/products/${productId}/variations?per_page=100`);
  return variations || [];
}


export async function getCategories(): Promise<Array<{
  id: number;
  name: string;
  slug: string;
  description?: string;
  count?: number;
  parent?: number;
}>> {
  return wcFetch("/products/categories?per_page=100");
}

/**
 * Convert WooCommerce product to frontend product format for compatibility
 * This matches the format expected by the shop page components
 * @param skipVariations - If true, skip fetching variations (faster for listing pages)
 * @param resolveMedia - If true, resolve ACF media IDs (datasheet image/PDF) via WP REST
 *                       For listing pages you can set this to false to avoid extra calls.
 */
export async function convertWCToProduct(
  wcProduct: WooCommerceProduct,
  skipVariations: boolean = false,
  resolveMedia: boolean = true
): Promise<any> {
  // Helper function to strip HTML tags from text
  const stripHTML = (html: string): string => {
    if (!html) return "";
    // Remove HTML tags but keep text content
    return html.replace(/<[^>]*>/g, "").trim();
  };

  // Rewrite old cms.zdacomm.com image URLs to current WC site (admin) so next/image works
  const rewriteCmsImageUrl = (url: string | null | undefined): string => {
    if (!url || typeof url !== "string") return url || "";
    const wcSite = (process.env.NEXT_PUBLIC_WC_SITE_URL || "").replace(/\/+$/, "");
    if (!wcSite) return url;
    return url.replace(/https?:\/\/cms\.zdacomm\.com\/?/gi, wcSite + "/");
  };

  // Parse price - WooCommerce prices are strings in the store currency (dollars)
  // The price field should be in dollars (components multiply by 100 for display)
  const priceStr = wcProduct.sale_price || wcProduct.price || wcProduct.regular_price || "0";
  const price = parseFloat(priceStr); // Keep in dollars

  // PDP: fetch product with ACF standard format so image fields return URLs, not IDs
  let acfProduct: { acf?: Record<string, any> } | null = null;
  if (resolveMedia) {
    acfProduct = await fetchProductWithACF(wcProduct.id);
  }

  // Convert images to expected format (use ACF URLs when WooCommerce returns IDs or empty)
  let thumbnails: Array<{ image: string; color: null }> = [];
  if (wcProduct.images && wcProduct.images.length > 0) {
    const firstImg = wcProduct.images[0];
    const firstSrc = firstImg?.src;
    const isFirstSrcUrl = typeof firstSrc === "string" && (firstSrc.startsWith("http://") || firstSrc.startsWith("https://"));
    if (isFirstSrcUrl) {
      thumbnails = wcProduct.images.map((img) => ({
        image: rewriteCmsImageUrl(img.src),
        color: null,
      }));
    }
    // If WooCommerce returned image ID(s) instead of URL(s), use ACF standard format image
    if (thumbnails.length === 0 && acfProduct?.acf) {
      const acf = acfProduct.acf;
      const mainImageUrl =
        (typeof acf.featured_image === "object" && acf.featured_image?.url) ||
        (typeof acf.product_image === "object" && acf.product_image?.url) ||
        (typeof acf.image === "object" && acf.image?.url) ||
        (typeof acf.main_image === "object" && acf.main_image?.url) ||
        (typeof acf.featured_image === "string" && acf.featured_image.startsWith("http") ? acf.featured_image : null) ||
        (typeof acf.product_image === "string" && acf.product_image?.startsWith("http") ? acf.product_image : null);
      if (mainImageUrl) {
        thumbnails = [{ image: rewriteCmsImageUrl(mainImageUrl), color: null }];
      }
    }
  } else if (acfProduct?.acf) {
    const acf = acfProduct.acf;
    const mainImageUrl =
      (typeof acf.featured_image === "object" && acf.featured_image?.url) ||
      (typeof acf.product_image === "object" && acf.product_image?.url) ||
      (typeof acf.image === "object" && acf.image?.url) ||
      (typeof acf.main_image === "object" && acf.main_image?.url) ||
      (typeof acf.featured_image === "string" && acf.featured_image?.startsWith("http") ? acf.featured_image : null) ||
      (typeof acf.product_image === "string" && acf.product_image?.startsWith("http") ? acf.product_image : null);
    if (mainImageUrl) {
      thumbnails = [{ image: rewriteCmsImageUrl(mainImageUrl), color: null }];
    }
  }
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
  // Product short description (WordPress "Product short description" in edit screen) – prefer WooCommerce native field, then metadata
  const subtitle = stripHTML(wcProduct.short_description || metadataObj.subtitle || metadataObj.shortDescription || "");
  const featureTitle = metadataObj.featureTitle ? stripHTML(metadataObj.featureTitle) : null; // Strip HTML from featureTitle
  
  // Get datasheet fields - prefer ACF standard format (URLs from ?acf_format=standard), else IDs/raw
  const acfData = (wcProduct as any).acf || {};
  const acfStandard = acfProduct?.acf || {};
  const datasheetImageFromACF =
    (typeof acfStandard.datasheet_image === "object" && acfStandard.datasheet_image?.url) ||
    (typeof acfStandard.datasheetImage === "object" && acfStandard.datasheetImage?.url) ||
    (typeof acfStandard.datasheet_image === "string" && acfStandard.datasheet_image?.startsWith("http") ? acfStandard.datasheet_image : null) ||
    (typeof acfStandard.datasheetImage === "string" && acfStandard.datasheetImage?.startsWith("http") ? acfStandard.datasheetImage : null);
  const datasheetPdfFromACF =
    (typeof acfStandard.datasheet_pdf === "object" && acfStandard.datasheet_pdf?.url) ||
    (typeof acfStandard.datasheetPdf === "object" && acfStandard.datasheetPdf?.url) ||
    (typeof acfStandard.datasheet_pdf === "string" && acfStandard.datasheet_pdf?.startsWith("http") ? acfStandard.datasheet_pdf : null) ||
    (typeof acfStandard.datasheetPdf === "string" && acfStandard.datasheetPdf?.startsWith("http") ? acfStandard.datasheetPdf : null);
  const datasheetImageRaw = datasheetImageFromACF ?? acfData.datasheet_image ?? acfData.datasheetImage ??
    metadataObj.datasheetImage ?? metadataObj.datasheet_image ?? metadataObj._datasheet_image ?? null;
  const datasheetPdfRaw = datasheetPdfFromACF ?? acfData.datasheet_pdf ?? acfData.datasheetPdf ??
    metadataObj.datasheetPdf ?? metadataObj.datasheet_pdf ?? metadataObj._datasheet_pdf ?? null;
  
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
  
  // Resolve datasheet image (ACF standard format already gives URL)
  let datasheetImage: string | null = null;
  if (datasheetImageFromACF) {
    datasheetImage = rewriteCmsImageUrl(datasheetImageFromACF) || null;
  } else if (datasheetImageRaw && resolveMedia) {
    // Skip ACF field keys silently - if field type is URL, WooCommerce should return URL directly
    if (isACFFieldKey(datasheetImageRaw)) {
      // Field key detected - ACF field should be configured as URL type in WordPress
      // WooCommerce should return the URL, not the field key
      datasheetImage = null;
    } else if (isMediaId(datasheetImageRaw)) {
      const resolved = await resolveMediaId(datasheetImageRaw);
      datasheetImage = resolved ? rewriteCmsImageUrl(resolved) : null;
    } else if (typeof datasheetImageRaw === 'string' && (datasheetImageRaw.startsWith('http://') || datasheetImageRaw.startsWith('https://'))) {
      datasheetImage = rewriteCmsImageUrl(datasheetImageRaw);
    } else {
      // Invalid format, skip it silently
      datasheetImage = null;
    }
  } else if (datasheetImageRaw && typeof datasheetImageRaw === 'string' && (datasheetImageRaw.startsWith('http://') || datasheetImageRaw.startsWith('https://'))) {
    // For listing pages, only use direct URLs (skip media ID resolution)
    datasheetImage = rewriteCmsImageUrl(datasheetImageRaw);
  }
  
  // Resolve datasheet PDF (ACF standard format already gives URL)
  let datasheetPdf: string | null = null;
  if (datasheetPdfFromACF) {
    datasheetPdf = rewriteCmsImageUrl(datasheetPdfFromACF) || null;
  } else if (datasheetPdfRaw && resolveMedia) {
    // Skip ACF field keys silently - if field type is URL, WooCommerce should return URL directly
    if (isACFFieldKey(datasheetPdfRaw)) {
      // Field key detected - ACF field should be configured as URL type in WordPress
      // WooCommerce should return the URL, not the field key
      datasheetPdf = null;
    } else if (isMediaId(datasheetPdfRaw)) {
      const resolved = await resolveMediaId(datasheetPdfRaw);
      datasheetPdf = resolved ? rewriteCmsImageUrl(resolved) : null;
    } else if (typeof datasheetPdfRaw === 'string' && (datasheetPdfRaw.startsWith('http://') || datasheetPdfRaw.startsWith('https://'))) {
      datasheetPdf = rewriteCmsImageUrl(datasheetPdfRaw);
    } else {
      // Invalid format, skip it silently
      datasheetPdf = null;
    }
  } else if (datasheetPdfRaw && typeof datasheetPdfRaw === 'string' && (datasheetPdfRaw.startsWith('http://') || datasheetPdfRaw.startsWith('https://'))) {
    // For listing pages, only use direct URLs (skip media ID resolution)
    datasheetPdf = rewriteCmsImageUrl(datasheetPdfRaw);
  }

  // Handle variants - WooCommerce uses variations
  const variants: any[] = [];
  
  // Check if product has variations
  if (wcProduct.variations && wcProduct.variations.length > 0) {
    // CRITICAL FIX: Only fetch variations if skipVariations is false (i.e., on product detail pages)
    // For listing pages (skipVariations=true), use placeholder variants to prevent MySQL overload
    if (!skipVariations) {
      // Product detail page - fetch full variation data
      try {
        const variations = await getProductVariations(wcProduct.id);
      
        // Sort variations by ID (ascending) to ensure first variation is the one with lowest ID
        const sortedVariations = [...variations].sort((a: any, b: any) => {
          return (a.id || 0) - (b.id || 0);
        });
        
        // Map variations to variants with actual variation data (not parent product data)
        sortedVariations.forEach((variation: any) => {
          const variationPrice = parseFloat(variation.price || variation.regular_price || variation.sale_price || priceStr || "0");
          
          // Build variant title from attributes if available, otherwise use variation name or parent name
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
          
          variants.push({
            id: variation.id.toString(),
            title: variantTitle,
            sku: variation.sku || "",
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
        // HARD FAILURE: If variations fail on PDP, we can't render the page properly
        // But don't cascade - log and use parent product data as fallback
        console.error(`[convertWCToProduct] CRITICAL: Error fetching variations for product ${wcProduct.id} on PDP:`, error);
        // Create a single variant from parent product as emergency fallback
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
          metadata: {
            ...metadataObj,
            _variationFetchFailed: true,
          },
        });
      }
    } else {
      // Listing page - use placeholder variants (NO variation fetch to prevent MySQL overload)
      // Use parent product SKU and price for all variants
      wcProduct.variations.forEach((variationId: number) => {
        variants.push({
          id: variationId.toString(),
          title: wcProduct.name,
          sku: wcProduct.sku || "", // Use parent SKU for listing pages
          price: price, // Use parent price for listing pages
          calculated_price: {
            calculated_amount: price * 100,
            currency_code: "USD",
          },
          inventory_quantity: 0,
          options: [],
          metadata: {
            ...metadataObj,
            variation_id: variationId,
            _needsVariationFetch: true, // Flag to fetch on PDP
          },
        });
      });
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
    shortDescription: subtitle, // WordPress "Product short description" (subtitle)
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
  };
}

