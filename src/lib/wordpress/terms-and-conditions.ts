/**
 * Fetch Terms and Conditions from WordPress REST API (admin.zdacomm.com/wp-json/wp/v2/terms_and_conditions).
 * Returns intro_section and contents (HTML) from the first published post.
 */

const WP_REST_BASE =
  process.env.NEXT_PUBLIC_WP_REST_URL ||
  (process.env.NEXT_PUBLIC_WC_SITE_URL
    ? `${process.env.NEXT_PUBLIC_WC_SITE_URL.replace(/\/+$/, "")}/wp-json/wp/v2`
    : "https://admin.zdacomm.com/wp-json/wp/v2");

export type TermsAndConditionsAcf = {
  intro_section?: string;
  contents?: string;
};

export type TermsAndConditionsRaw = {
  id: number;
  modified?: string;
  modified_gmt?: string;
  title?: { rendered?: string };
  acf?: TermsAndConditionsAcf;
};

export type TermsAndConditionsResult = {
  introSection: string;
  contents: string;
  modified?: string;
  title?: string;
};

/**
 * Fetch terms_and_conditions from WordPress REST API.
 * Returns intro and full contents HTML from the first item.
 */
export async function getTermsAndConditionsFromWordPress(): Promise<TermsAndConditionsResult | null> {
  try {
    const res = await fetch(`${WP_REST_BASE}/terms_and_conditions`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) {
      console.warn("[getTermsAndConditionsFromWordPress] HTTP error:", res.status, res.statusText);
      return null;
    }
    const list = await res.json();
    const item: TermsAndConditionsRaw | undefined = Array.isArray(list) ? list[0] : list;
    if (!item?.acf) return null;

    return {
      introSection: item.acf.intro_section ?? "",
      contents: item.acf.contents ?? "",
      modified: item.modified ?? item.modified_gmt,
      title: item.title?.rendered,
    };
  } catch (error) {
    console.error("[getTermsAndConditionsFromWordPress] Error:", error);
    return null;
  }
}
