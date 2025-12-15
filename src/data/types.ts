// Type definitions for local data files
// These match the Sanity schema structure but use local data

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
  image?: string;
  order?: number;
  isActive?: boolean;
}

export interface Connector {
  id: string;
  name: string;
  slug: string;
  image: string;
  pricing: Array<{
    cableType: {
      id: string;
      name: string;
    };
    price: number;
  }>;
  order?: number;
  isActive?: boolean;
}

export interface Product {
  id: string;
  _id?: string; // For compatibility
  name: string;
  slug: string;
  productType: ProductType;
  category?: {
    id: string;
    name: string;
    slug: string;
    _id?: string;
    title?: string;
  };
  
  // Pricing
  price?: number;
  discountedPrice?: number;
  connectorPrice?: number;
  gainOptions?: Array<{
    gain: string;
    price: number;
  }>;
  lengthOptions?: Array<{
    length: string;
    price: number;
  }>;
  
  // Cable-specific
  cableSeries?: {
    id: string;
    name: string;
    slug: string;
    _id?: string;
  };
  cableType?: {
    id: string;
    name: string;
    slug: string;
    _id?: string;
    pricePerFoot?: number;
    series?: {
      id: string;
      name: string;
      _id?: string;
    };
  };
  connectorA?: {
    id: string;
    name: string;
    slug: string;
    image?: string;
    _id?: string;
  };
  connectorB?: {
    id: string;
    name: string;
    slug: string;
    image?: string;
    _id?: string;
  };
  
  // Images
  thumbnails?: Array<{
    image: string;
    color?: string;
  }>;
  previewImages?: Array<{
    image: string;
    color?: string;
  }>;
  cableImage?: string;
  connectorImage?: string;
  datasheetImage?: string;
  datasheetPdf?: string;
  datasheetPdfUrl?: string;
  
  // Details
  sku?: string;
  tags?: string[];
  description?: any;
  shortDescription?: string;
  specifications?: any;
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
  
  // Reviews (from Prisma)
  reviews?: Array<{
    id: string;
    name: string;
    email: string;
    comment: string;
  }>;
}

export interface Category {
  id: string;
  _id?: string; // For compatibility
  title: string;
  slug: string;
  image?: string;
  description?: string;
  parent?: {
    id: string;
    title: string;
    slug: string;
    _id?: string;
  };
  subcategories?: Category[];
  productCount?: number;
  postCount?: number;
}

export interface HeroBanner {
  id: string;
  title?: string;
  subtitle?: string;
  image: string;
  link?: string;
  buttonText?: string;
  order?: number;
  brandName?: string;
  card?: {
    image?: string;
    title?: string;
    description?: string;
  };
}

export interface HeroIntroduction {
  id: string;
  title?: string;
  description?: any;
  image?: string;
}

export interface ProudPartners {
  id: string;
  title?: string;
  partners?: Array<{
    name: string;
    logo: string;
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
    image: string;
    imagePosition?: "left" | "right";
  }>;
}

export interface OurStory {
  id: string;
  title?: string;
  content?: any;
  images?: string[];
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  order?: number;
}

export interface Countdown {
  id: string;
  title?: string;
  endDate?: string;
  enabled?: boolean;
}

