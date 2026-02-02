import ProudPartners from "../Home/Hero/ProudPartners";
import WorkWithUs from "../Home/Hero/WorkWithUs";
import Newsletter from "../Common/Newsletter";
import { getProudPartners } from "@/lib/data/shop-utils";
import SolutionsIntro from "./SolutionsIntro";
import CompanyScrollItems from "../Company/CompanyScrollItems";
import ExploreMore from "../Company/ExploreMore";

export default async function Solutions() {
  const partnersData = await getProudPartners();

  return (
    <main className="overflow-hidden">
      {/* No hero section - same content as Company otherwise */}

      {/* Company Intro Section */}
      <SolutionsIntro />

      {/* Company Scroll Items Section */}
      <CompanyScrollItems />

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
