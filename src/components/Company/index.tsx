import ProudPartners from "../Home/Hero/ProudPartners";
import WorkWithUs from "../Home/Hero/WorkWithUs";
import FaqSection from "../Home/Faq";
import Newsletter from "../Common/Newsletter";
import { getProudPartners, getFaq, getOurStory } from "@/lib/data/shop-utils";
import { AnimatedWhatWeFocusOn, AnimatedLetsWorkTogether } from "../OurStory/AnimatedSections";
import CompanyHero from "./CompanyHero";
import CompanyIntro from "./CompanyIntro";
import CompanyScrollItems from "./CompanyScrollItems";
import ExploreMore from "./ExploreMore";

export default async function Company() {
  const partnersData = await getProudPartners();
  const faqData = await getFaq();
  const ourStoryData = await getOurStory();

  return (
    <main className="overflow-hidden">
      {/* Company Hero Section */}
      <CompanyHero />

      {/* Company Intro Section */}
      <CompanyIntro />

      {/* Company Scroll Items Section */}
      <CompanyScrollItems />

      {/* Work With Us Section */}
      <WorkWithUs />

      {/* What We Focus On Section */}

      {/* Let's Work Together Section */}

      {/* Proud Partners Section */}
      <div style={{ marginTop: '50px' }}>
        <ProudPartners partnersData={partnersData} />
      </div>

      {/* Explore More Section */}
      <div style={{ marginTop: '50px' }}>
        <ExploreMore />
      </div>

      {/* FAQ Section */}
      <FaqSection faqData={faqData} />

      {/* Newsletter Section */}
      <Newsletter />
    </main>
  );
}
