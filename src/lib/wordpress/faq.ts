/**
 * Fetch FAQs from WordPress headless via WPGraphQL (admin.zdacomm.com/graphql).
 * Maps fAQs.nodes to { question, answer, order } for the FAQ section.
 */

const FAQ_GRAPHQL_QUERY = `
  query GetFaqs {
    fAQs(first: 20) {
      nodes {
        id
        title
        faqFields {
          question
          answer
        }
      }
    }
  }
`;

export type FaqItemFromWordPress = {
  question: string;
  answer: string;
  order: number;
};

export type FaqDataFromWordPress = {
  title?: string;
  contactButton?: { text: string; link: string };
  items: FaqItemFromWordPress[];
};

const GRAPHQL_URL =
  process.env.NEXT_PUBLIC_WP_GRAPHQL_URL ||
  (process.env.NEXT_PUBLIC_WC_SITE_URL
    ? `${process.env.NEXT_PUBLIC_WC_SITE_URL.replace(/\/+$/, "")}/graphql`
    : "https://admin.zdacomm.com/graphql");

/** Parse order from WordPress title e.g. "Q6" -> 6, "Q1" -> 1 */
function parseOrderFromTitle(title: string | null | undefined): number {
  if (!title || typeof title !== "string") return 0;
  const match = title.trim().match(/^Q(\d+)$/i);
  return match ? parseInt(match[1], 10) : 0;
}

/**
 * Fetch FAQs from WordPress GraphQL and return items in display order (Q1, Q2, ...).
 */
export async function getFaqFromWordPress(): Promise<FaqDataFromWordPress | null> {
  try {
    const res = await fetch(GRAPHQL_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: FAQ_GRAPHQL_QUERY }),
      next: { revalidate: 300 }, // 5 min cache
    });

    if (!res.ok) {
      console.warn("[getFaqFromWordPress] HTTP error:", res.status, res.statusText);
      return null;
    }

    const json = await res.json();
    const nodes = json?.data?.fAQs?.nodes;

    if (!Array.isArray(nodes) || nodes.length === 0) {
      return null;
    }

    const items: FaqItemFromWordPress[] = nodes
      .map((node: any) => {
        const question = node?.faqFields?.question ?? "";
        const answer = node?.faqFields?.answer ?? "";
        const order = parseOrderFromTitle(node?.title) || 0;
        if (!question && !answer) return null;
        return { question, answer, order };
      })
      .filter(Boolean) as FaqItemFromWordPress[];

    // Sort by order ascending (Q1, Q2, Q3, ...)
    items.sort((a, b) => a.order - b.order);

    return {
      title: "Frequently Asked Questions",
      contactButton: { text: "Contact Us", link: "/contact" },
      items,
    };
  } catch (error) {
    console.error("[getFaqFromWordPress] Error:", error);
    return null;
  }
}
