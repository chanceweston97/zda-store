import Newsletter from "@/components/Common/Newsletter";
import FaqSection from "@/components/Home/Faq";
import Hero from "@/components/Home/Hero";
import WorkWithUs from "@/components/Home/Hero/WorkWithUs";
import { getFaq } from "@/lib/data/shop-utils";
import { getHomepageHeroFromWordPress } from "@/lib/wordpress/homepage-hero";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const { seo } = await getHomepageHeroFromWordPress();
  const title = seo?.metaTitle || seo?.ogTitle || "ZDA Communications";
  const description = seo?.metaDescription || seo?.ogDescription || "ZDA Communications";
  const openGraphImages = seo?.ogImage ? [{ url: seo.ogImage }] : undefined;
  return {
    title,
    description,
    openGraph: {
      title: seo?.ogTitle || title,
      description: seo?.ogDescription || description,
      images: openGraphImages,
    },
    twitter: {
      card: "summary_large_image",
      title: seo?.ogTitle || title,
      description: seo?.ogDescription || description,
      images: seo?.ogImage ? [seo.ogImage] : undefined,
    },
  };
}

export default async function HomePage() {
  const faqData = await getFaq();

  return (
    <main>
      <Hero />
      <WorkWithUs />
      <FaqSection faqData={faqData} />

      <Newsletter />

    </main>
  );
}
