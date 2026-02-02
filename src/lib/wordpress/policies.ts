/**
 * Fetch Policies from WordPress REST API (admin.zdacomm.com/wp-json/wp/v2/policies).
 * Returns title, date (modified), intro_section and contents (HTML) from the first published post.
 * Falls back to terms_and_conditions endpoint if policies returns empty.
 */

const WP_REST_BASE =
  process.env.NEXT_PUBLIC_WP_REST_URL ||
  (process.env.NEXT_PUBLIC_WC_SITE_URL
    ? `${process.env.NEXT_PUBLIC_WC_SITE_URL.replace(/\/+$/, "")}/wp-json/wp/v2`
    : "https://admin.zdacomm.com/wp-json/wp/v2");

export type PoliciesAcf = {
  intro_section?: string;
  contents?: string;
};

export type PoliciesRaw = {
  id: number;
  modified?: string;
  modified_gmt?: string;
  date?: string;
  date_gmt?: string;
  title?: { rendered?: string };
  acf?: PoliciesAcf;
};

export type PoliciesResult = {
  introSection: string;
  contents: string;
  modified?: string;
  title?: string;
};

async function fetchFromEndpoint(endpoint: string): Promise<PoliciesResult | null> {
  const res = await fetch(`${WP_REST_BASE}/${endpoint}`, {
    next: { revalidate: 300 },
  });
  if (!res.ok) return null;
  const list = await res.json();
  const item: PoliciesRaw | undefined = Array.isArray(list) ? list[0] : list;
  if (!item?.acf) return null;
  return {
    introSection: item.acf.intro_section ?? "",
    contents: item.acf.contents ?? "",
    modified: item.modified ?? item.modified_gmt ?? item.date ?? item.date_gmt,
    title: item.title?.rendered,
  };
}

/**
 * Fetch policies from WordPress (tries /policies, then /terms_and_conditions).
 * Returns title, modified date, intro and contents HTML.
 */
export async function getPoliciesFromWordPress(): Promise<PoliciesResult | null> {
  try {
    const data = await fetchFromEndpoint("policies");
    if (data) return data;
    return fetchFromEndpoint("terms_and_conditions");
  } catch (error) {
    console.error("[getPoliciesFromWordPress] Error:", error);
    return null;
  }
}
