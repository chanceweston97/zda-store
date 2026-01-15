// Local data fetching utilities
import { Product } from "@/data/types";
import { Category } from "@/data/types";
import { getAllProducts as getAllProductsData, getProductBySlug as getProductBySlugData, getProductsByCategory, getProductsByType } from "@/data/products";
import { getAllCategories as getAllCategoriesData, getCategoryBySlug as getCategoryBySlugData, getCategoriesWithSubcategories as getCategoriesWithSubcategoriesData } from "@/data/categories";
import { heroBanners } from "@/data/content/hero-banners";
import { heroIntroduction } from "@/data/content/hero-introduction";
import { proudPartners } from "@/data/content/proud-partners";
import { whatWeOffer } from "@/data/content/what-we-offer";
import { ourStory } from "@/data/content/our-story";
import { faqs } from "@/data/content/faq";
import { countdown } from "@/data/content/countdown";

// Convert local Product to frontend format
function convertProductToFrontendFormat(product: Product): any {
  return {
    ...product,
    _id: product._id || product.id,
    slug: product.slug ? { current: product.slug } : undefined,
    category: product.category ? {
      ...product.category,
      _id: product.category._id || product.category.id,
      slug: { current: product.category.slug },
    } : undefined,
    cableSeries: product.cableSeries ? {
      ...product.cableSeries,
      _id: product.cableSeries._id || product.cableSeries.id,
      slug: { current: product.cableSeries.slug },
    } : undefined,
    cableType: product.cableType ? {
      ...product.cableType,
      _id: product.cableType._id || product.cableType.id,
      slug: { current: product.cableType.slug },
      series: product.cableType.series ? {
        ...product.cableType.series,
        _id: product.cableType.series._id || product.cableType.series.id,
      } : undefined,
    } : undefined,
    connectorA: product.connectorA ? {
      ...product.connectorA,
      _id: product.connectorA._id || product.connectorA.id,
      slug: { current: product.connectorA.slug },
    } : undefined,
    connectorB: product.connectorB ? {
      ...product.connectorB,
      _id: product.connectorB._id || product.connectorB.id,
      slug: { current: product.connectorB.slug },
    } : undefined,
  };
}

// Convert local Category to frontend format
function convertCategoryToFrontendFormat(category: Category): any {
  return {
    ...category,
    _id: category._id || category.id,
    slug: { current: category.slug, _type: "slug" },
    subcategories: category.subcategories?.map(convertCategoryToFrontendFormat),
    parent: category.parent ? {
      ...category.parent,
      _id: category.parent._id || category.parent.id,
      slug: { current: category.parent.slug, _type: "slug" },
    } : null,
  };
}

export async function getCategories() {
  const categories = getAllCategoriesData();
  return categories.map(convertCategoryToFrontendFormat);
}

export async function getCategoryBySlug(slug: string) {
  const category = getCategoryBySlugData(slug);
  return category ? convertCategoryToFrontendFormat(category) : null;
}

export async function getCategoriesWithSubcategories() {
  const categories = getCategoriesWithSubcategoriesData();
  return categories.map(convertCategoryToFrontendFormat);
}

export async function getCategoryById(id: string) {
  const categories = getAllCategoriesData();
  const category = categories.find(c => c.id === id || c._id === id);
  return category ? convertCategoryToFrontendFormat(category) : null;
}

export async function getAllProducts() {
  const products = getAllProductsData();
  return products.map(convertProductToFrontendFormat);
}

export async function getProduct(slug: string) {
  const product = getProductBySlugData(slug);
  return product ? convertProductToFrontendFormat(product) : null;
}

export async function getProductsByFilter(query: string, tags: string[]): Promise<any[]> {
  // Simple filter implementation - can be enhanced
  let products = getAllProductsData();
  
  // Parse basic filters from query string
  if (query.includes('_type == "product"')) {
    // Already filtered to products
  }
  
  if (query.includes('category->slug.current ==')) {
    const match = query.match(/category->slug\.current == "([^"]+)"/);
    if (match) {
      products = getProductsByCategory(match[1]);
    }
  }
  
  if (query.includes('_type == "cableType"')) {
    products = getProductsByType("cable");
  }
  
  if (query.includes('productType == "connector"')) {
    products = getProductsByType("connector");
  }
  
  return products.map(convertProductToFrontendFormat);
}

export async function getAllProductsCount() {
  return getAllProductsData().length;
}

export async function getHighestPrice() {
  const products = getAllProductsData();
  let highestPrice = 0;
  
  for (const product of products) {
    if (product.gainOptions) {
      for (const option of product.gainOptions) {
        if (typeof option === 'object' && 'price' in option) {
          highestPrice = Math.max(highestPrice, option.price);
        }
      }
    }
    if (product.lengthOptions) {
      for (const option of product.lengthOptions) {
        if (typeof option === 'object' && 'price' in option) {
          highestPrice = Math.max(highestPrice, option.price);
        }
      }
    }
    if (product.price) {
      highestPrice = Math.max(highestPrice, product.price);
    }
  }
  
  return highestPrice;
}

export async function getOrders(query: string) {
  // Orders are stored in Prisma, not local data
  // This should be handled by a separate API route
  return [];
}

export async function getOrderById(orderId: string) {
  // Orders are stored in Prisma, not local data
  // This should be handled by a separate API route
  return null;
}

export const getHeroBanners = async () => {
  // Return local hero banners data only (no backend fetch)
  return heroBanners;
};

export const getHeroSliders = async () => await getHeroBanners(); // Alias

export const getHeroIntroduction = async () => {
  // Return local hero introduction data only (no backend fetch)
  return heroIntroduction;
};

export const getProudPartners = async () => {
  // Return local proud partners data only (no backend fetch)
  return proudPartners;
};

export const getWhatWeOffer = async () => {
  // Return local what we offer data only (no backend fetch)
  return whatWeOffer;
};
export const getOurStory = async () => ourStory;
export const getFaq = async () => {
  // Return local FAQ data only (no backend fetch)
  return { items: faqs };
};
export const getCountdown = async () => countdown;

export async function getCoupons() {
  // Coupons can be stored in Prisma or local data
  return [];
}

// Cable Builder Functions
// Import local Cable Builder data
import cableCustomizerData from "./cable-customizer-data";

export async function getCableSeries() {
  // Return cable series from local data
  return cableCustomizerData.cableSeries || [];
}

export async function getCableProducts() {
  return getProductsByType("cable").map(convertProductToFrontendFormat);
}

export async function getConnectorProducts() {
  return getProductsByType("connector").map(convertProductToFrontendFormat);
}

export async function getCableTypes() {
  // Return cable types from local data
  return cableCustomizerData.cableTypes || [];
}

export async function getCableTypesBySeries(seriesSlug: string) {
  // Filter cable types by series slug
  const allTypes = cableCustomizerData.cableTypes || [];
  return allTypes.filter((type) => type.series === seriesSlug);
}

export async function getConnectors() {
  // Return connectors from local data
  return cableCustomizerData.connectors || [];
}

// Image builder - maintains compatibility with image objects
export function imageBuilder(source: any) {
  // Return an object with url() method for compatibility
  return {
    url: () => {
      // If source is already a URL string, return it
      if (typeof source === 'string') {
        return source;
      }
      // If source is an object with asset, return the URL
      if (source?.asset?.url) {
        return source.asset.url;
      }
      // If source is an object with url, return it
      if (source?.url) {
        return source.url;
      }
      // If source is an object with image property (local data format)
      if (source?.image) {
        return source.image;
      }
      // Default fallback
      return source || '';
    },
    width: (w?: number) => imageBuilder(source),
    height: (h?: number) => imageBuilder(source),
    fit: (f?: string) => imageBuilder(source),
    auto: (a?: string) => imageBuilder(source),
  };
}

