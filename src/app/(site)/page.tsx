import Newsletter from "@/components/Common/Newsletter";
import ExploreMore from "@/components/Company/ExploreMore";
import Hero from "@/components/Home/Hero";
import WorkWithUs from "@/components/Home/Hero/WorkWithUs";
import { DEFAULT_OG_IMAGE } from "@/lib/seo";
import type { Metadata } from "next";

/** Fetch at runtime so Cloudflare doesn’t block WordPress at build time. */
export const dynamic = "force-dynamic";
export const revalidate = 300;

const SEO_TITLE = "Industrial-Grade RF Solutions | ZDA Communications";
const SEO_DESCRIPTION =
  "Industrial-grade antennas, coaxial cable assemblies, and RF components engineered for reliable wireless connectivity across DAS, public safety, utilities, and infrastructure.";
const OG_TITLE = "Industrial-Grade RF Solutions | ZDA Communications";
const OG_DESCRIPTION =
  "Engineered RF hardware for reliable connectivity—antennas, cabling, and RF components supporting enterprise, public safety, utilities, and private wireless networks.";

export const metadata: Metadata = {
  title: SEO_TITLE,
  description: SEO_DESCRIPTION,
  openGraph: {
    title: OG_TITLE,
    description: OG_DESCRIPTION,
    images: [{ url: DEFAULT_OG_IMAGE }],
  },
  twitter: {
    card: "summary_large_image",
    title: OG_TITLE,
    description: OG_DESCRIPTION,
    images: [DEFAULT_OG_IMAGE],
  },
};

export default async function HomePage() {
  return (
    <main>
      <Hero />
      <WorkWithUs />
      <ExploreMore />

      <Newsletter />
    </main>
  );
}
