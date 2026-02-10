import ProudPartners from "../Home/Hero/ProudPartners";
import WorkWithUs from "../Home/Hero/WorkWithUs";
import Newsletter from "../Common/Newsletter";
import { getProudPartners } from "@/lib/data/shop-utils";
import SolutionsHero from "./SolutionsHero";
import SolutionsIntro from "./SolutionsIntro";
import SolutionsScrollItems from "./SolutionsScrollItems";
import SolutionsFrequencyBands from "./SolutionsFrequencyBands";
import ExploreMore from "../Company/ExploreMore";

export default async function Solutions() {
  const partnersData = await getProudPartners();

  return (
    <main className="overflow-hidden">
      <style
        dangerouslySetInnerHTML={{
          __html: `
            .solutions-hero-section {
              margin-top: 40px !important;
              min-height: 220px !important;
              padding: 24px 20px !important;
            }
            .solutions-intro-section {
              padding-top: 24px !important;
              padding-bottom: 24px !important;
            }
          `,
        }}
      />
      {/* Hero: Industry solutions title + description (right) */}
      <SolutionsHero />

      {/* Solutions Intro Section */}
      <SolutionsIntro />

      {/* Industry solution items (In-Building, Public Safety, Utilities, Wildlife, Private LTE) */}
      <SolutionsScrollItems />

      {/* Frequency bands: Our RF infrastructure supports... */}
      <SolutionsFrequencyBands />

      {/* Work With Us Section */}
      <WorkWithUs />

      {/* Proud Partners Section */}
      <div style={{ marginTop: "50px" }}>
        <ProudPartners partnersData={partnersData} />
      </div>

      {/* Explore More Section - Products first on Solutions page */}
      <div style={{ marginTop: "50px" }}>
        <ExploreMore variant="solutionsPage" />
      </div>

      {/* Newsletter Section */}
      <Newsletter />
    </main>
  );
}
