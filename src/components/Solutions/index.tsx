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

      {/* Explore More Section */}
      <div style={{ marginTop: "50px" }}>
        <ExploreMore />
      </div>

      {/* Newsletter Section */}
      <Newsletter />
    </main>
  );
}
