import ProudPartners from "../Home/Hero/ProudPartners";
import WorkWithUsSection from "../AboutUs/WorkWithUs";
import FaqSection from "../Home/Faq";
import Newsletter from "../Common/Newsletter";
import { getProudPartners, getFaq, getOurStory } from "@/lib/data/shop-utils";
import { AnimatedHeroSection, AnimatedWhatWeFocusOn, AnimatedLetsWorkTogether } from "./AnimatedSections";

export default async function OurStory() {
  const partnersData = await getProudPartners();
  const faqData = await getFaq();
  const ourStoryData = await getOurStory();

  return (
    <main className="overflow-hidden">
      {/* Our Story Section */}
      <AnimatedHeroSection heroData={ourStoryData?.heroSection} />

      {/* What We Focus On Section */}
      <AnimatedWhatWeFocusOn focusData={ourStoryData?.whatWeFocusOn} />

      {/* Let's Work Together Section */}
      <AnimatedLetsWorkTogether workData={ourStoryData?.letsWorkTogether} />

      {/* Proud Partners Section */}
      <ProudPartners partnersData={partnersData} />

      {/* Work With Us Section */}
        <WorkWithUsSection />

      {/* FAQ Section */}
        <FaqSection faqData={faqData} />

      {/* Newsletter Section */}
          <Newsletter />
    </main>
  );
}

