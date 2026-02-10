/** Production fallback; never use localhost in sitemap or canonical URLs */
const PRODUCTION_BASE = "https://www.zdacomm.com";

/**
 * Base URL for canonical, sitemap, and Open Graph. Strips localhost and
 * comma-separated values so Google only sees production URLs.
 */
function getSiteBaseUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL || PRODUCTION_BASE;
  const first = raw.split(",")[0].trim();
  if (!first || first.includes("localhost")) return PRODUCTION_BASE;
  return first.replace(/\/$/, "");
}

export const SITE_BASE_URL = getSiteBaseUrl();

/** OG image: ZDA logo (used across all main pages for social sharing) */
export const DEFAULT_OG_IMAGE = `${SITE_BASE_URL}/images/logo/logo.png`;
