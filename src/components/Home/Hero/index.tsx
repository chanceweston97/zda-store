import { getHeroBanners, getHeroIntroduction, getHomeOfferingItems } from "@/lib/data/shop-utils";
import HeroStatic from "./HeroStatic";
import HeroIntroduction from "./HeroIntroduction";
import HeroBackbone from "./HeroBackbone";
import HeroScrollItemsLazy from "./HeroScrollItemsLazy";
import XetaWaveReseller from "./XetaWaveReseller";

const Hero = async () => {
  const bannerData = await getHeroBanners();
  const introductionData = await getHeroIntroduction();
  const offeringItems = await getHomeOfferingItems();

  return (
    <section className="overflow-hidden pt-[56px]">
      <div className="max-w-[1340px] w-full mx-auto px-4 sm:px-6 xl:px-0 pt-6">
        <div className="flex flex-col xl:flex-row gap-5">
          <div className="w-full">
            <div className="relative z-1 rounded-[10px]">
              <HeroStatic bannerData={bannerData} />
              {/* <HeroFeature /> */}
              <div style={{ marginTop: '50px' }}>
                <HeroIntroduction introductionData={introductionData} />
              </div>
              <div style={{ marginTop: '50px' }}>
                <HeroBackbone />
              </div>
              <div style={{ marginTop: '50px' }}>
                <HeroScrollItemsLazy items={offeringItems} />
              </div>
              <div style={{ marginTop: '50px' }}>
                <XetaWaveReseller />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* <!-- Hero features --> */}

      <div className="relative z-1 rounded-[10px]">
      </div>
    </section>
  );
};

export default Hero;
