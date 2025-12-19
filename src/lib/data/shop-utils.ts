// Local data fetching utilities - replaces Sanity
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

// Convert local Product to Sanity-compatible format
function convertProductToSanityFormat(product: Product): any {
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

// Convert local Category to Sanity-compatible format
function convertCategoryToSanityFormat(category: Category): any {
  return {
    ...category,
    _id: category._id || category.id,
    slug: { current: category.slug, _type: "slug" },
    subcategories: category.subcategories?.map(convertCategoryToSanityFormat),
    parent: category.parent ? {
      ...category.parent,
      _id: category.parent._id || category.parent.id,
      slug: { current: category.parent.slug, _type: "slug" },
    } : null,
  };
}

export async function getCategories() {
  const categories = getAllCategoriesData();
  return categories.map(convertCategoryToSanityFormat);
}

export async function getCategoryBySlug(slug: string) {
  const category = getCategoryBySlugData(slug);
  return category ? convertCategoryToSanityFormat(category) : null;
}

export async function getCategoriesWithSubcategories() {
  const categories = getCategoriesWithSubcategoriesData();
  return categories.map(convertCategoryToSanityFormat);
}

export async function getCategoryById(id: string) {
  const categories = getAllCategoriesData();
  const category = categories.find(c => c.id === id || c._id === id);
  return category ? convertCategoryToSanityFormat(category) : null;
}

export async function getAllProducts() {
  const products = getAllProductsData();
  return products.map(convertProductToSanityFormat);
}

export async function getProduct(slug: string) {
  const product = getProductBySlugData(slug);
  return product ? convertProductToSanityFormat(product) : null;
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
  
  return products.map(convertProductToSanityFormat);
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

// Get backend URL for CMS API
const getBackendUrl = () => {
  return process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || 
         process.env.MEDUSA_BACKEND_URL || 
         "http://localhost:9000";
};

export const getHeroBanners = async () => {
  try {
    const backendUrl = getBackendUrl();
    const response = await fetch(`${backendUrl}/store/cms`, { next: { revalidate: 60 } });
    if (response.ok) {
      const data = await response.json();
      if (data.heroes && data.heroes.length > 0) {
        return data.heroes;
      }
    }
  } catch (error) {
    console.error("Error fetching hero banners from Medusa:", error);
  }
  return heroBanners;
};

export const getHeroSliders = async () => await getHeroBanners(); // Alias

export const getHeroIntroduction = async () => {
  try {
    const backendUrl = getBackendUrl();
    const response = await fetch(`${backendUrl}/store/cms`, { next: { revalidate: 60 } });
    if (response.ok) {
      const data = await response.json();
      if (data.instructions) {
        return data.instructions;
      }
    }
  } catch (error) {
    console.error("Error fetching hero introduction from Medusa:", error);
  }
  return heroIntroduction;
};

export const getProudPartners = async () => {
  try {
    const backendUrl = getBackendUrl();
    const response = await fetch(`${backendUrl}/store/cms`, { next: { revalidate: 60 } });
    if (response.ok) {
      const data = await response.json();
      if (data.proudPartners && data.proudPartners.partners) {
        // Transform Medusa format to frontend format
        return {
          title: data.proudPartners.title || "Proud Suppliers Of",
          partners: data.proudPartners.partners.map((p: any) => ({
            name: p.name,
            logo: typeof p.logo === 'string' ? p.logo : p.logo,
          })),
          isActive: data.proudPartners.is_active,
        };
      }
    }
  } catch (error) {
    console.error("Error fetching proud partners from Medusa:", error);
  }
  // Fallback to default partners with local logos
  return {
    title: "Proud Suppliers Of",
    partners: [
      { name: "IWT", logo: "/images/hero/partners/iwt.svg" },
      { name: "xetawave", logo: "/images/hero/partners/xetawave.svg" },
      { name: "APS", logo: "/images/hero/partners/aps.svg" },
      { name: "ABC", logo: "/images/hero/partners/ab.svg" },
      { name: "Rancho", logo: "/images/hero/partners/rancho.webp" },
      { name: "Motus", logo: "/images/hero/partners/motus.png" },
    ],
    isActive: true,
  };
};

export const getWhatWeOffer = async () => {
  // Try to fetch from Medusa CMS API first
  try {
    const backendUrl = getBackendUrl();
    const response = await fetch(`${backendUrl}/store/cms`, { 
      next: { revalidate: 60 },
      cache: 'no-store' // Always fetch fresh data
    });
    
    if (response.ok) {
      const data = await response.json();
      if (data.whatWeOffer && data.whatWeOffer.offer_items && data.whatWeOffer.offer_items.length > 0) {
        // Transform Medusa format to frontend format
        return {
          title: data.whatWeOffer.title || "What We Offer",
          headerButton: {
            text: data.whatWeOffer.header_button_text || "Explore Products",
            link: data.whatWeOffer.header_button_link || "/shop",
          },
          offerItems: data.whatWeOffer.offer_items.map((item: any) => ({
            title: item.title,
            tags: item.tags || [],
            description: item.description,
            button: item.button || { text: "Explore", link: "/shop" },
            image: typeof item.image === 'string' ? item.image : (item.image?.url || "/images/hero/wireless.png"),
            imagePosition: item.imagePosition || item.image_position || "right",
          })),
          isActive: data.whatWeOffer.is_active !== false,
        };
      }
    }
  } catch (error) {
    console.error("Error fetching what we offer from Medusa:", error);
  }
  
  // Fallback to local data
  return whatWeOffer;
};
export const getOurStory = async () => ourStory;
export const getFaq = async () => {
  try {
    const backendUrl = getBackendUrl();
    const response = await fetch(`${backendUrl}/store/cms`, { next: { revalidate: 60 } });
    if (response.ok) {
      const data = await response.json();
      if (data.faq && data.faq.items) {
        return { items: data.faq.items };
      }
    }
  } catch (error) {
    console.error("Error fetching FAQ from Medusa:", error);
  }
  return { items: faqs };
};
export const getCountdown = async () => countdown;

export async function getCoupons() {
  // Coupons can be stored in Prisma or local data
  return [];
}

// Cable Customizer Functions
export async function getCableSeries() {
  // Import from cable-customizer data if available
  return [];
}

export async function getCableProducts() {
  return getProductsByType("cable").map(convertProductToSanityFormat);
}

export async function getConnectorProducts() {
  return getProductsByType("connector").map(convertProductToSanityFormat);
}

export async function getCableTypes() {
  // Import from cable-customizer data if available
  return [];
}

export async function getCableTypesBySeries(seriesSlug: string) {
  // Import from cable-customizer data if available
  return [];
}

export async function getConnectors() {
  // Import from cable-customizer data if available
  return [];
}

// Image builder - maintains compatibility with Sanity image format
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

