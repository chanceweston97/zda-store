import { MetadataRoute } from "next";
import { SITE_BASE_URL } from "@/lib/seo";
import {
  getCategoriesWithSubcategories,
  getAllProducts,
} from "@/lib/data/unified-data";

const RESERVED_CATEGORY_SLUGS = new Set([
  "terms-and-conditions",
  "privacy-policy",
  "site-map",
  "sitemap",
]);

function getCategorySlug(cat: any): string | null {
  const slug = cat?.slug?.current ?? cat?.slug ?? cat?.handle;
  return typeof slug === "string" && !RESERVED_CATEGORY_SLUGS.has(slug)
    ? slug
    : null;
}

function getProductSlug(p: any): string | null {
  const slug = (p as any)?.slug?.current ?? (p as any)?.slug ?? (p as any)?.handle;
  return typeof slug === "string" ? slug : null;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = SITE_BASE_URL.replace(/\/$/, "");

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: base, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${base}/company`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/contact`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/solutions`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/products`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/catalog`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/cable-builder`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/privacy-policy`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/terms-and-conditions`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/blogs/blog-grid`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
  ];

  let categoryUrls: MetadataRoute.Sitemap = [];
  let productUrls: MetadataRoute.Sitemap = [];

  try {
    const categories = await getCategoriesWithSubcategories();
    const slugs = new Set<string>();
    for (const cat of categories || []) {
      const slug = getCategorySlug(cat);
      if (slug && !slugs.has(slug)) {
        slugs.add(slug);
        categoryUrls.push({
          url: `${base}/categories/${slug}`,
          lastModified: new Date(),
          changeFrequency: "weekly" as const,
          priority: 0.8,
        });
      }
    }
  } catch (e) {
    console.warn("[sitemap] Failed to fetch categories:", e);
  }

  try {
    const products = await getAllProducts();
    for (const p of products || []) {
      const slug = getProductSlug(p);
      if (slug) {
        productUrls.push({
          url: `${base}/products/${slug}`,
          lastModified: new Date(),
          changeFrequency: "weekly" as const,
          priority: 0.7,
        });
      }
    }
  } catch (e) {
    console.warn("[sitemap] Failed to fetch products:", e);
  }

  return [...staticRoutes, ...categoryUrls, ...productUrls];
}
