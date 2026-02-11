import type { MetadataRoute } from "next";
import { SITE_BASE_URL } from "@/lib/seo";

/**
 * Clean robots.txt (single User-agent block).
 * Disable Cloudflare’s “Auto-generated robots.txt” so this Next.js version is served.
 */
export default function robots(): MetadataRoute.Robots {
  const base = SITE_BASE_URL.replace(/\/$/, "");
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: `${base}/sitemap.xml`,
  };
}
