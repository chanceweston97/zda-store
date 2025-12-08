// Local Data Reading Utilities
// These functions read from local TypeScript data files instead of Sanity

import { cableSeries, cableTypes, connectors } from "../../data/cable-customizer";
import type {
  Product,
  Category,
  CableSeries,
  CableType,
  Connector,
  HeroBanner,
  HeroIntroduction,
  ProudPartners,
  WhatWeOffer,
  OurStory,
  FAQ,
} from "../../data/types";

// Cable Customizer Data
export function getCableSeries(): CableSeries[] {
  return cableSeries;
}

export function getCableTypes(): CableType[] {
  return cableTypes;
}

export function getConnectors(): Connector[] {
  return connectors;
}

export function getCableTypeBySlug(slug: string): CableType | undefined {
  return cableTypes.find((type: CableType) => type.slug === slug);
}

export function getConnectorBySlug(slug: string): Connector | undefined {
  return connectors.find((connector: Connector) => connector.slug === slug);
}

export function getCableTypesBySeries(seriesSlug: string): CableType[] {
  return cableTypes.filter(
    (type: CableType) => type.series?.slug === seriesSlug && type.isActive !== false
  );
}

export function getConnectorPrice(
  connectorSlug: string,
  cableTypeSlug: string
): number | null {
  const connector = getConnectorBySlug(connectorSlug);
  if (!connector) return null;

  const pricing = connector.pricing.find(
    (p: { cableType: { slug: string }; price: number }) => p.cableType.slug === cableTypeSlug
  );
  return pricing?.price ?? null;
}

// Products Data (to be populated)
// These will read from data/products/ files
export async function getAllProducts(): Promise<Product[]> {
  // TODO: Import from data/products/index.ts
  // For now, return empty array
  return [];
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  // TODO: Import from data/products/index.ts and find by slug
  return null;
}

export async function getProductsByCategory(
  categorySlug: string
): Promise<Product[]> {
  // TODO: Filter products by category
  return [];
}

// Categories Data (to be populated)
export async function getAllCategories(): Promise<Category[]> {
  // TODO: Import from data/categories/index.ts
  return [];
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  // TODO: Import from data/categories/index.ts and find by slug
  return null;
}

// Content Data
import { heroBanners } from "../../data/content/hero-banners";
import { heroIntroduction } from "../../data/content/hero-introduction";
import { proudPartners } from "../../data/content/proud-partners";
import { whatWeOffer } from "../../data/content/what-we-offer";
import { faqs } from "../../data/content/faq";

export async function getHeroBanners(): Promise<HeroBanner[]> {
  return heroBanners;
}

export async function getHeroIntroduction(): Promise<HeroIntroduction | null> {
  return heroIntroduction;
}

export async function getProudPartners(): Promise<ProudPartners | null> {
  return proudPartners;
}

export async function getWhatWeOffer(): Promise<WhatWeOffer | null> {
  return whatWeOffer;
}

export async function getOurStory(): Promise<OurStory | null> {
  // TODO: Import from data/content/our-story.ts
  return null;
}

export async function getFAQ(): Promise<FAQ[]> {
  return faqs;
}

