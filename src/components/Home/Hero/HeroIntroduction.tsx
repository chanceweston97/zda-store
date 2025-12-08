"use client";

import Image from "next/image";
import LocalizedClientLink from "@modules/common/components/localized-client-link";
import type { HeroIntroduction } from "@/data/types";

interface HeroIntroductionProps {
  introductionData?: HeroIntroduction | null;
}

export default function HeroIntroduction({ introductionData }: HeroIntroductionProps) {
  const title = introductionData?.title || "Enabling Wireless Networks Since 2008";
  const description = typeof introductionData?.description === 'string' 
    ? introductionData.description 
    : "At ZDA Communications, we care about one thing above all: reliable wireless performance. We design and supply industrial-grade antennas, cabling, and RF accessories—plus practical tools like custom cable builds—that help homes, enterprises, and field teams achieve clear, consistent connectivity. From fixed sites to mobile deployments, our hardware is engineered for uptime, verified for low VSWR, and built to stand up to real-world conditions so your network stays steady when it matters.";
  const imageUrl = introductionData?.image || "/images/hero/wireless.png";

  return (
    <section className="w-full flex flex-col lg:flex-row justify-between items-center gap-8 lg:gap-12 py-12 lg:py-16">
      <div className="flex-1 max-w-2xl">
        <h2 className="text-[#2958A4] text-[40px] font-medium leading-tight tracking-[-2.4px]">
          {title}
        </h2>
        <p className="mt-6 text-[#4F6866] text-[18px] font-normal leading-7 tracking-[-0.36px]">
          {description}
        </p>
        <div className="mt-8 flex flex-wrap gap-4">
          <LocalizedClientLink
            href="/our-story"
            className="inline-flex items-center rounded-full border border-transparent bg-[#2958A4] text-white text-sm font-medium px-6 py-3 transition-colors hover:border-[#2958A4] hover:bg-white hover:text-[#2958A4]"
          >
            More About Us
          </LocalizedClientLink>
          <LocalizedClientLink
            href="/store"
            className="inline-flex items-center rounded-full border border-transparent bg-[#2958A4] text-white text-sm font-medium px-6 py-3 transition-colors hover:border-[#2958A4] hover:bg-white hover:text-[#2958A4]"
          >
            Explore Products
          </LocalizedClientLink>
        </div>
      </div>
      <div className="flex-shrink-0 w-full lg:w-auto">
        <Image
          src={imageUrl}
          alt={title}
          width={645}
          height={447}
          className="w-full max-w-[645px] h-auto object-contain mx-auto lg:mx-0"
        />
      </div>
    </section>
  );
}

