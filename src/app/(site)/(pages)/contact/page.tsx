import Contact from "@/components/Contact";
import { DEFAULT_OG_IMAGE } from "@/lib/seo";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact a Product Expert | Quotes, NET 30 & Tax-Exempt",
  description:
    "Contact ZDA Communications to request a quote or speak with a product expert. Business purchasing support available for NET 30 terms and tax-exempt pricing.",
  openGraph: {
    title: "Contact an Expert | ZDA Communications",
    description:
      "Reach our team for quotes, product guidance, and business purchasing support including NET 30 and tax-exempt pricing.",
    images: [{ url: DEFAULT_OG_IMAGE }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact an Expert | ZDA Communications",
    description:
      "Reach our team for quotes, product guidance, and business purchasing support including NET 30 and tax-exempt pricing.",
    images: [DEFAULT_OG_IMAGE],
  },
};

const ContactPage = async () => {
  return (
    <main id="top">
      <Contact />
    </main>
  );
};

export default ContactPage;
