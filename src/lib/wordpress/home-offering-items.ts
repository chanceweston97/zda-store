/**
 * Fetch home offering items from WordPress REST API (admin.zdacomm.com/wp-json/wp/v2/home_offering_items).
 * Resolves ACF image IDs to media URLs. Items are sorted by order (title.rendered "1","2","3","4").
 */

const WP_REST_BASE =
  process.env.NEXT_PUBLIC_WP_REST_URL ||
  (process.env.NEXT_PUBLIC_WC_SITE_URL
    ? `${process.env.NEXT_PUBLIC_WC_SITE_URL.replace(/\/+$/, "")}/wp-json/wp/v2`
    : "https://admin.zdacomm.com/wp-json/wp/v2");

export type HomeOfferingItemAcf = {
  title?: string;
  description?: string;
  button?: { title?: string; url?: string; target?: string };
  image?: number | string;
};

export type HomeOfferingItemRaw = {
  id: number;
  title?: { rendered?: string };
  acf?: HomeOfferingItemAcf;
};

/** Normalized item for HeroScrollItems cards */
export type HomeOfferingItem = {
  title: string;
  description: string;
  button: { title: string; url: string };
  image: string | null;
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
 * Fetch home_offering_items from WordPress REST API.
 * Resolves image IDs to URLs and sorts by display order (title.rendered 1,2,3,4).
 */
export async function getHomeOfferingItemsFromWordPress(): Promise<HomeOfferingItem[]> {
  try {
    const res = await fetch(`${WP_REST_BASE}/home_offering_items`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) {
      console.warn("[getHomeOfferingItemsFromWordPress] HTTP error:", res.status, res.statusText);
      return [];
    }
    const rawList: HomeOfferingItemRaw[] = await res.json();
    if (!Array.isArray(rawList) || rawList.length === 0) return [];

    // Sort by order: title.rendered is "1", "2", "3", "4"
    const sorted = [...rawList].sort((a, b) => {
      const orderA = parseInt(a.title?.rendered ?? "0", 10) || 999;
      const orderB = parseInt(b.title?.rendered ?? "0", 10) || 999;
      return orderA - orderB;
    });

    const imageIds = sorted
      .map((item) => item.acf?.image)
      .filter((v): v is number => typeof v === "number");
    const uniqueIds = [...new Set(imageIds)];
    const urlMap = new Map<number, string | null>();
    await Promise.all(
      uniqueIds.map(async (id) => {
        urlMap.set(id, await fetchMediaUrl(id));
      })
    );

    const items: HomeOfferingItem[] = sorted.map((item) => {
      const acf = item.acf;
      const imageId = acf?.image;
      const imageUrl =
        typeof imageId === "number" ? urlMap.get(imageId) ?? null : null;
      return {
        title: acf?.title?.trim() ?? "",
        description: (acf?.description ?? "").trim().replace(/\r\n/g, "\n"),
        button: {
          title: acf?.button?.title?.trim() ?? "Learn more",
          url: acf?.button?.url?.trim() ?? "#",
        },
        image: imageUrl,
      };
    });

    return items;
  } catch (error) {
    console.error("[getHomeOfferingItemsFromWordPress] Error:", error);
    return [];
  }
}
