/**
 * Medusa Products Integration
 * Functions to fetch products from Medusa backend
 */

import { medusaClient, MedusaProduct } from "./client";
import { isMedusaEnabled } from "./config";

// Helper to get cached region ID
async function getCachedRegionId(): Promise<string | null> {
  try {
    return await medusaClient.getCachedRegionId();
  } catch (error) {
    console.warn("[getMedusaProductByHandle] Could not get cached region ID:", error);
    return null;
  }
}

/**
 * Convert Medusa product to Sanity product format
 */
function convertMedusaToSanityProduct(medusaProduct: MedusaProduct): any {
  // Debug: Log what we're receiving from Medusa (subtitle is a direct product field per API schema)
  console.log('[convertMedusaToSanityProduct] Raw Medusa product:', {
    hasMetadata: !!medusaProduct.metadata,
    metadataKeys: medusaProduct.metadata ? Object.keys(medusaProduct.metadata) : [],
    datasheetImage: medusaProduct.metadata?.datasheetImage,
    datasheetPdf: medusaProduct.metadata?.datasheetPdf,
    subtitle: (medusaProduct as any).subtitle,
    subtitleFromMetadata: medusaProduct.metadata?.subtitle,
  });
  
  const cheapestPrice = medusaProduct.variants?.[0]?.calculated_price?.calculated_amount || 0;
  const price = cheapestPrice / 100; // Convert from cents to dollars

  // Convert images - Medusa images are URLs, not Sanity asset references
  const thumbnails = medusaProduct.images?.length > 0
    ? medusaProduct.images.map((img) => ({
        image: img.url, // Direct URL, not asset reference
        color: null,
      }))
    : medusaProduct.thumbnail
    ? [
        {
          image: medusaProduct.thumbnail,
          color: null,
        },
      ]
    : [];

  const previewImages = medusaProduct.images?.length > 0
    ? medusaProduct.images.map((img) => ({
        image: img.url,
        color: null,
      }))
    : thumbnails;

  // Convert category - use first category if available
  // Medusa products can have multiple categories, we'll use the first one as primary
  const primaryCategory = medusaProduct.categories && medusaProduct.categories.length > 0
    ? medusaProduct.categories[0]
    : null;
    
  const category = primaryCategory
    ? {
        _id: primaryCategory.id,
        id: primaryCategory.id,
        name: primaryCategory.name,
        slug: {
          current: primaryCategory.handle || primaryCategory.slug?.current || "",
        },
        title: primaryCategory.name,
        handle: primaryCategory.handle || primaryCategory.slug?.current || "",
      }
    : undefined;
    
  // Also store all categories with handles for filtering
  // IMPORTANT: Store id field for filtering (must match category.id)
  // Medusa API returns categories as an array with id, name, handle
  const allCategories = (medusaProduct.categories || []).map((cat: any) => {
    // Ensure we have the id field (Medusa category ID)
    const categoryId = cat.id;
    if (!categoryId) {
      console.warn('[convertMedusaToSanityProduct] Category missing id:', cat);
    }
    return {
      id: categoryId, // This is the Medusa category ID - used for filtering
      _id: categoryId, // Also store as _id for compatibility
      name: cat.name || '',
      handle: cat.handle || '',
      slug: {
        current: cat.handle || '',
      },
    };
  });

  // Extract variant options for different product types
  const productType = medusaProduct.metadata?.productType || "antenna";
  
  // For antennas: gainOptions from variants
  // Extract gain value from variant options (e.g., "6dBi" -> "6")
  const gainOptions = medusaProduct.metadata?.gainOptions || 
    (productType === "antenna" ? medusaProduct.variants?.map((v: any) => {
      // Try to get gain from variant options (look for option with "dBi" in value)
      let gainValue = v.title || "";
      if (!gainValue && v.options && Array.isArray(v.options)) {
        const gainOption = v.options.find((opt: any) => 
          opt.value && typeof opt.value === 'string' && opt.value.toLowerCase().includes('dbi')
        );
        if (gainOption) {
          // Extract number from "6dBi" -> "6"
          const match = gainOption.value.match(/(\d+\.?\d*)/);
          gainValue = match ? match[1] : gainOption.value.replace(/dbi/gi, '').trim();
        }
      }
      
      return {
        id: v.id,
        title: gainValue, // Extract from options if title is empty
        price: v.calculated_price?.calculated_amount || 0, // Price in cents
        sku: v.sku || "", // Include SKU for variant selection
        variantId: v.id, // Include variant ID for cart
      };
    }).filter((opt: any) => opt.title) : []) || []; // Filter out options without title
  
  // For cables: lengthOptions from variants (use variant.title directly like front project)
  const lengthOptions = medusaProduct.metadata?.lengthOptions ||
    (productType === "cable" ? medusaProduct.variants?.map((v: any) => ({
      value: v.title || "", // Use variant.title directly (e.g., "10", "25", "50")
      price: v.calculated_price?.calculated_amount || 0, // Price in cents (will be converted in component)
      sku: v.sku || "",
      variantId: v.id,
    })).filter((opt: any) => opt.value) : []) || []; // Filter out options without value
  
  // Extract all metadata fields (datasheetImage, datasheetPdf, features, applications, etc.)
  // These come from Custom Fields in Medusa admin panel
  const metadata = medusaProduct.metadata || {};
  
  const datasheetImage = metadata.datasheetImage || null;
  const datasheetPdf = metadata.datasheetPdf || null;
  
  // Extract features and applications from metadata (like front project - keep as strings)
  // Front project line 65-66: features/applications are strings, joined if arrays
  const features = typeof metadata.features === 'string' 
    ? metadata.features 
    : (Array.isArray(metadata.features) ? metadata.features.join('\n') : null);
  
  const applications = typeof metadata.applications === 'string'
    ? metadata.applications
    : (Array.isArray(metadata.applications) ? metadata.applications.join('\n') : null);
  
  // Extract specifications and subtitle
  const specifications = metadata.specifications || null;
  // Subtitle is a direct field on the product object (per Medusa API schema)
  const subtitle = (medusaProduct as any).subtitle 
    || metadata.subtitle 
    || metadata.shortDescription 
    || (medusaProduct.description ? medusaProduct.description.split('\n')[0].trim() : null);
  const featureTitle = metadata.featureTitle || null;

  return {
    _id: medusaProduct.id,
    _type: "product",
    name: medusaProduct.title,
    slug: {
      current: medusaProduct.handle,
    },
    productType,
    price,
    thumbnails,
    previewImages,
    category, // Add category information
    description: medusaProduct.description
      ? [
          {
            _type: "block",
            children: [
              {
                _type: "span",
                text: medusaProduct.description,
              },
            ],
          },
        ]
      : [],
    shortDescription: subtitle || medusaProduct.description || "",
    inStock: medusaProduct.variants?.some((v) => v.calculated_price) || false,
    status: true, // Assume published if in Medusa
    // Map Medusa tags - combine with category names, remove duplicates
    // For cable products, only use product tags (not category names)
    tags: (() => {
      const productTags = medusaProduct.tags?.map((tag) => tag.value).filter(Boolean) || [];
      
      // Helper function to normalize tag for comparison (lowercase, trim, remove plural 's')
      const normalizeTag = (tag: string): string => {
        const normalized = tag.toLowerCase().trim();
        // Remove trailing 's' for plural forms (e.g., "connectors" -> "connector")
        // But keep it if the tag is just "s" or ends with "ss" (like "class")
        if (normalized.length > 1 && normalized.endsWith('s') && !normalized.endsWith('ss')) {
          return normalized.slice(0, -1);
        }
        return normalized;
      };
      
      // Remove duplicates from product tags (case-insensitive and plural-aware)
      const seen = new Set<string>();
      const uniqueProductTags: string[] = [];
      for (const tag of productTags) {
        const normalized = normalizeTag(tag);
        if (!seen.has(normalized)) {
          seen.add(normalized);
          uniqueProductTags.push(tag); // Keep original case
        }
      }
      
      if (productType === "cable") {
        // For cables, only show actual product tags (already deduplicated)
        return uniqueProductTags;
      }
      // For other products, combine tags and category names
      const categoryNames = medusaProduct.categories?.map((cat: any) => cat.name).filter(Boolean) || [];
      const allTags = [...uniqueProductTags, ...categoryNames];
      
      // Remove duplicates using normalized comparison
      const finalSeen = new Set<string>();
      const uniqueTags: string[] = [];
      for (const tag of allTags) {
        const normalized = normalizeTag(tag);
        if (!finalSeen.has(normalized)) {
          finalSeen.add(normalized);
          uniqueTags.push(tag); // Keep original case
        }
      }
      return uniqueTags;
    })(),
    // Features and Applications (as strings for display, like front project)
    features,
    applications,
    specifications,
    subtitle,
    featureTitle,
    // Preserve full metadata object (includes all custom fields from admin panel)
    metadata: {
      ...metadata,
      datasheetImage,
      datasheetPdf,
      features,
      applications,
      specifications,
      subtitle,
      featureTitle,
    },
    // Add variants for pricing - convert Medusa variants to expected format
    variants: medusaProduct.variants?.map((variant: any) => {
      // Extract SKU from variant or try to find it in options/metadata
      let variantSku = variant.sku || "";
      if (!variantSku && variant.options) {
        // Sometimes SKU might be in options or metadata
        const skuOption = variant.options.find((opt: any) => opt.option?.title?.toLowerCase() === 'sku');
        if (skuOption) variantSku = skuOption.value || "";
      }
      
      return {
        id: variant.id,
        title: variant.title || "",
        sku: variantSku,
        price: variant.calculated_price?.calculated_amount ? variant.calculated_price.calculated_amount / 100 : 0,
        calculated_price: variant.calculated_price,
        inventory_quantity: variant.inventory_quantity || 0,
        options: variant.options || [],
        metadata: variant.metadata || {},
      };
    }) || [],
    // Variant options for different product types
    gainOptions,
    lengthOptions,
    // Datasheet information (for antenna products) - store at root level for easy access
    datasheetImage,
    datasheetPdf,
    // Store all categories for filtering (with handles)
    categories: allCategories,
    // Handle field for URL routing (Medusa uses handle, not slug)
    handle: medusaProduct.handle,
    // Preserve full metadata object (includes all custom fields from admin panel)
    // This is already set above, so we don't need to duplicate it
  };
}

/**
 * Get all products from Medusa
 */
export async function getMedusaProducts(params?: {
  limit?: number;
  offset?: number;
  regionId?: string;
}): Promise<any[]> {
  if (!isMedusaEnabled()) {
    return [];
  }

  try {
    const response = await medusaClient.getProducts({
      limit: params?.limit || 100,
      offset: params?.offset || 0,
      region_id: params?.regionId,
      fields: "*variants.calculated_price,*categories", // Include categories for filtering
    });

    if (!response.products || response.products.length === 0) {
      console.warn("[getMedusaProducts] No products in Medusa response");
      return [];
    }

    const converted = response.products.map(convertMedusaToSanityProduct);
    return converted;
  } catch (error) {
    console.error("[getMedusaProducts] Error fetching products from Medusa:", error);
    if (error instanceof Error) {
      console.error("[getMedusaProducts] Error details:", error.message);
    }
    return [];
  }
}

/**
 * Get product by handle from Medusa
 */
export async function getMedusaProductByHandle(
  handle: string,
  regionId?: string
): Promise<any | null> {
  if (!isMedusaEnabled()) {
    return null;
  }

  try {
    // Use cached region ID if not provided
    const cachedRegionId = regionId || await getCachedRegionId();
    const { product } = await medusaClient.getProductByHandle(handle, cachedRegionId || undefined);
    
    if (!product) {
      console.warn(`[getMedusaProductByHandle] Product not found for handle: ${handle}`);
      return null;
    }
    
    return convertMedusaToSanityProduct(product);
  } catch (error) {
    console.error(`[getMedusaProductByHandle] Error fetching product ${handle} from Medusa:`, error);
    if (error instanceof Error) {
      console.error(`[getMedusaProductByHandle] Error details:`, error.message);
      // Check if it's a 404 error
      if ((error as any).status === 404) {
        console.warn(`[getMedusaProductByHandle] Product ${handle} not found (404)`);
        return null;
      }
    }
    return null;
  }
}

