import { getHeroBanners, getHeroIntroduction, getProudPartners, getWhatWeOffer } from "../../../../lib/data/local-data";
import HeroStatic from "./HeroStatic";
import HeroIntroduction from "./HeroIntroduction";
import ProudPartners from "./ProudPartners";
import WhatWeOffer from "./WhatWeOffer";
import XetaWaveReseller from "./XetaWaveReseller";

const Hero = async () => {
  const bannerData = await getHeroBanners();
  const introductionData = await getHeroIntroduction();
  const partnersData = await getProudPartners();
  const whatWeOfferData = await getWhatWeOffer();

  return (
    <section className="overflow-hidden pt-6">
      <div className="max-w-[1340px] w-full mx-auto px-4 sm:px-6 xl:px-0">
        <div className="flex flex-col xl:flex-row gap-5">
          <div className="w-full">
            <div className="relative z-1 rounded-[10px]">
              <HeroStatic bannerData={bannerData} />
              <HeroIntroduction introductionData={introductionData} />
              <ProudPartners partnersData={partnersData} />
              <WhatWeOffer whatWeOfferData={whatWeOfferData} />
              <XetaWaveReseller />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;

