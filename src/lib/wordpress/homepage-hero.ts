/**
 * Fetch homepage hero from WordPress REST API (admin.zdacomm.com/wp-json/wp/v2/homepage_hero).
 * Resolves ACF image IDs to media URLs and returns normalized banner data + SEO meta.
 */

const WP_REST_BASE =
  process.env.NEXT_PUBLIC_WP_REST_URL ||
  (process.env.NEXT_PUBLIC_WC_SITE_URL
    ? `${process.env.NEXT_PUBLIC_WC_SITE_URL.replace(/\/+$/, "")}/wp-json/wp/v2`
    : "https://admin.zdacomm.com/wp-json/wp/v2");

export type HomepageHeroAcf = {
  hero_title?: string;
  brand_text?: string;
  background_image?: number;
  background_image_alt_text?: string;
  primary_button?: { title?: string; url?: string; target?: string };
  secondary_button?: { title?: string; url?: string; target?: string };
  hero_product_image?: number;
  product_card_title?: string;
  product_card_description?: string;
  meta_title?: string;
  meta_description?: string;
  og_image?: string | number;
  og_title?: string;
  og_description?: string;
};

export type HomepageHeroRaw = {
  id: number;
  acf?: HomepageHeroAcf;
};

/** Normalized banner shape for HeroStatic (matches getHeroBanners) */
export type HomepageHeroBanner = {
  _id?: string;
  name?: string;
  isActive?: boolean;
  backgroundImage?: string;
  backgroundImageAlt?: string;
  title?: string;
  buttons?: Array<{ text: string; link: string }>;
  brandName?: string;
  card?: {
    image?: string;
    title?: string;
    description?: string;
  };
};

/** SEO meta from homepage_hero ACF */
export type HomepageHeroSeo = {
  metaTitle?: string;
  metaDescription?: string;
  ogImage?: string;
  ogTitle?: string;
  ogDescription?: string;
};

export type HomepageHeroResult = {
  banner: HomepageHeroBanner | null;
  seo: HomepageHeroSeo | null;
};

async function fetchMediaUrl(mediaId: number): Promise<string | null> {
  try {
    const res = await fetch(`${WP_REST_BASE}/media/${mediaId}`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json?.source_url ?? null;
  } catch {
    return null;
  }
}

/**
 * Fetch homepage hero from WordPress REST API and return normalized banner + SEO.
 * Resolves background_image and hero_product_image IDs to URLs.
 */
export async function getHomepageHeroFromWordPress(): Promise<HomepageHeroResult> {
  try {
    const res = await fetch(`${WP_REST_BASE}/homepage_hero`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) {
      console.warn("[getHomepageHeroFromWordPress] HTTP error:", res.status, res.statusText);
      return { banner: null, seo: null };
    }
    const list = await res.json();
    const item: HomepageHeroRaw | undefined = Array.isArray(list) ? list[0] : list;
    if (!item?.acf) {
      return { banner: null, seo: null };
    }

    const acf = item.acf;
    const backgroundImageId = acf.background_image;
    const productImageId = acf.hero_product_image;

    const [backgroundImageUrl, productImageUrl] = await Promise.all([
      backgroundImageId ? fetchMediaUrl(backgroundImageId) : Promise.resolve(null),
      productImageId ? fetchMediaUrl(productImageId) : Promise.resolve(null),
    ]);

    const primary = acf.primary_button;
    const secondary = acf.secondary_button;
    const buttons: Array<{ text: string; link: string }> = [];
    if (primary?.title && primary?.url) {
      buttons.push({ text: primary.title, link: primary.url });
    }
    if (secondary?.title && secondary?.url) {
      buttons.push({ text: secondary.title, link: secondary.url });
    }

    const banner: HomepageHeroBanner = {
      _id: String(item.id),
      title: acf.hero_title?.trim() || undefined,
      brandName: acf.brand_text?.trim() || undefined,
      backgroundImage: backgroundImageUrl ?? undefined,
      backgroundImageAlt: acf.background_image_alt_text?.trim() || undefined,
      buttons: buttons.length ? buttons : undefined,
      card:
        acf.product_card_title || acf.product_card_description || productImageUrl
          ? {
              title: acf.product_card_title?.trim(),
              description: acf.product_card_description?.trim(),
              image: productImageUrl ?? undefined,
            }
          : undefined,
    };

    let ogImageUrl: string | null = null;
    if (acf.og_image) {
      if (typeof acf.og_image === "string" && acf.og_image.startsWith("http")) {
        ogImageUrl = acf.og_image;
      } else if (typeof acf.og_image === "number") {
        ogImageUrl = await fetchMediaUrl(acf.og_image);
      }
    }

    const seo: HomepageHeroSeo = {
      metaTitle: acf.meta_title?.trim() || undefined,
      metaDescription: acf.meta_description?.trim() || undefined,
      ogImage: ogImageUrl ?? undefined,
      ogTitle: acf.og_title?.trim() || undefined,
      ogDescription: acf.og_description?.trim() || undefined,
    };

    return { banner, seo };
  } catch (error) {
    console.error("[getHomepageHeroFromWordPress] Error:", error);
    return { banner: null, seo: null };
  }
}
