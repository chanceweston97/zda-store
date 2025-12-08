// Type definitions for local data files
// These match the Sanity schema structure

export type ProductType = "antenna" | "cable" | "connector";

export interface CableSeries {
  id: string;
  name: string;
  slug: string;
  order?: number;
}

export interface CableType {
  id: string;
  name: string;
  slug: string;
  series?: {
    id: string;
    name: string;
    slug: string;
  };
  pricePerFoot?: number;
  image?: string; // Local image path
  order?: number;
  isActive?: boolean;
  category?: {
    id: string;
    name: string;
    slug: string;
  };
  sku?: string;
  lengthOptions?: Array<{
    length: string; // e.g., "10 ft", "25 ft"
  }>;
  quantity?: number;
  description?: any; // Rich text content
  specifications?: any; // Rich text content
}

export interface Connector {
  id: string;
  name: string;
  slug: string;
  image: string; // Local image path
  pricing: Array<{
    cableType: {
      id: string;
      name: string;
      slug: string;
    };
    price: number;
  }>;
  order?: number;
  isActive?: boolean;
  category?: {
    id: string;
    name: string;
    slug: string;
  };
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  productType: ProductType;
  category?: {
    id: string;
    name: string;
    slug: string;
  };
  
  // Pricing
  price?: number; // Default price (for antenna)
  discountedPrice?: number;
  connectorPrice?: number; // For connector products
  gainOptions?: Array<{
    gain: string; // e.g., "6", "8", "12"
    price: number;
  }>;
  lengthOptions?: Array<{
    length: string; // e.g., "10", "25", "50"
    price: number;
  }>;
  
  // Cable-specific
  cableSeries?: {
    id: string;
    name: string;
    slug: string;
  };
  cableType?: {
    id: string;
    name: string;
    slug: string;
  };
  connectorA?: {
    id: string;
    name: string;
    slug: string;
    image?: string;
  };
  connectorB?: {
    id: string;
    name: string;
    slug: string;
    image?: string;
  };
  
  // Images
  thumbnails?: Array<{
    image: string; // Local image path
    color?: string;
  }>;
  previewImages?: Array<{
    image: string; // Local image path
    color?: string;
  }>;
  cableImage?: string; // For cable products
  connectorImage?: string; // For connector products
  datasheetImage?: string;
  datasheetPdf?: string;
  
  // Details
  sku?: string;
  tags?: string[];
  description?: any; // Rich text/PortableText
  shortDescription?: string;
  specifications?: any; // Rich text
  features?: string[];
  applications?: string[];
  featureTitle?: string;
  
  // Status
  status?: boolean;
  inStock?: boolean;
  quantity?: number;
  publishedAt?: string;
  displayOrder?: number;
  isActive?: boolean;
}

export interface Category {
  id: string;
  title: string;
  slug: string;
  image?: string; // Local image path
  description?: string;
  parent?: {
    id: string;
    title: string;
    slug: string;
  };
}

export interface HeroBanner {
  id: string;
  title?: string;
  subtitle?: string;
  image: string; // Local image path
  link?: string;
  buttonText?: string;
  order?: number;
  brandName?: string; // Brand name at bottom left (e.g., "ZDA Communications")
  card?: {
    image?: string; // Card image
    title?: string; // Card title (e.g., "Precision & Performance")
    description?: string; // Card description
  };
}

export interface HeroIntroduction {
  id: string;
  title?: string;
  description?: any; // Rich text
  image?: string;
}

export interface ProudPartners {
  id: string;
  title?: string;
  partners?: Array<{
    name: string;
    logo: string; // Local image path
    link?: string;
  }>;
}

export interface WhatWeOffer {
  id: string;
  title?: string;
  headerButton?: {
    text: string;
    link: string;
  };
  offerItems?: Array<{
    title: string;
    tags?: string[];
    description: string;
    button: {
      text: string;
      link: string;
    };
    image: string; // Local image path
    imagePosition?: "left" | "right";
  }>;
}

export interface OurStory {
  id: string;
  title?: string;
  content?: any; // Rich text
  images?: string[]; // Local image paths
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  order?: number;
}


