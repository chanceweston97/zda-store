import { MetadataRoute } from "next";
import { SITE_BASE_URL } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  const base = SITE_BASE_URL.replace(/\/$/, "");
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${base}/sitemap.xml`,
  };
}
