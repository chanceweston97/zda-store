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
 */
export function convertWCToSanityProduct(wcProduct: WooCommerceProduct): any {
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
  const subtitle = stripHTML(metadataObj.subtitle || metadataObj.shortDescription || wcProduct.short_description || ""); // Strip HTML from subtitle
  const featureTitle = metadataObj.featureTitle ? stripHTML(metadataObj.featureTitle) : null; // Strip HTML from featureTitle
  const datasheetImage = metadataObj.datasheetImage || null;
  const datasheetPdf = metadataObj.datasheetPdf || null;

  // Handle variants - WooCommerce uses variations
  // For now, we'll create a simple variant structure
  // In a full implementation, you'd fetch variations separately
  const variants: any[] = [];
  if (wcProduct.variations && wcProduct.variations.length > 0) {
    // Note: Variations need to be fetched separately via WooCommerce API
    // For now, create a placeholder
    variants.push({
      id: wcProduct.id.toString(),
      title: wcProduct.name,
      sku: wcProduct.sku || "",
      price: price, // Already in dollars
      calculated_price: {
        calculated_amount: price * 100, // Convert to cents for calculated_price
        currency_code: "USD",
      },
      inventory_quantity: 0, // Would need to fetch from WooCommerce
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
    shortDescription: subtitle || stripHTML(wcProduct.short_description || wcProduct.description || ""), // Strip HTML from short description
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

