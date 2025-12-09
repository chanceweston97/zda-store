"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import LocalizedClientLink from "@modules/common/components/localized-client-link";
import type { HeroBanner } from "@/data/types";

interface HeroStaticProps {
  bannerData?: HeroBanner[] | null;
}

export default function HeroStatic({ bannerData }: HeroStaticProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Use first banner or default
  const banner = bannerData && bannerData.length > 0 ? bannerData[0] : {
    title: "FFFField-tested antennas and cabling built to improve signal where it counts.",
    image: "/images/hero/banner.webp",
    buttonText: "All Products",
    link: "/store",
    brandName: "ZDA Communications",
    card: {
      image: "/images/products/antenna.png",
      title: "Precision & Performance",
      description: "Empowering connectivity with engineered reliability and real world results",
    },
  };

  const title = banner.title || "Field-tested antennas and cabling built to improve signal where it counts.";
  const backgroundImage = banner.image || "/images/hero/banner.webp";
  const brandName = banner.brandName || "ZDA Communications";
  const card = banner.card || {
    image: "/images/products/antenna.png",
    title: "Precision & Performance",
    description: "Empowering connectivity with engineered reliability and real world results",
  };
  
  const buttons = [
    { text: banner.buttonText || "All Products", link: banner.link || "/store" },
    { text: "Cable Customizer", link: "/cable-customizer" },
  ];

  return (
    <section className="relative w-full h-[640px] md:h-[800px] rounded-2xl overflow-hidden mb-8">
      <Image
        src={backgroundImage}
        alt="Hero"
        fill
        priority
        className="object-cover brightness-50"
      />
      <div className="absolute inset-0 bg-black/40" />
      
      {/* LEFT TEXT + BUTTONS */}
      <div className="absolute left-6 sm:left-8 lg:left-10 z-10 max-w-[900px] xl:max-w-[1000px]">
        <h1 
          className={`text-white text-[36px] xl:text-[72px] lg:text-[60px] font-medium leading-[1.1] tracking-[-2.88px] mt-[50px] md:text-[50px] transition-all duration-1000 ease-out ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          {title}
        </h1>
        <div 
          className={`flex flex-col mt-5 gap-3 mb-3 transition-all duration-1000 ease-out delay-300 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          {buttons.map((button, index) => (
            <LocalizedClientLink
              key={index}
              href={button.link}
              className="inline-flex items-center justify-center rounded-full border border-transparent bg-[#2958A4] text-white text-sm font-medium px-6 py-3 transition-colors hover:border-[#2958A4] hover:bg-white hover:text-[#2958A4] w-[186px]"
            >
              {button.text}
            </LocalizedClientLink>
          ))}
        </div>
      </div>

      {/* BOTTOM SECTION: Brand Name (Left) + Card (Right) */}
      <div className="absolute bottom-0 left-0 right-0 z-10 flex items-end justify-between px-6 sm:px-8 lg:px-10">
        {/* BOTTOM-LEFT BRAND NAME */}
        <div className="flex-shrink-0">
          <p className="text-white text-[50px] sm:text-[60px] lg:text-[70px] xl:text-[100px] font-light tracking-tight">
            {brandName}
          </p>
        </div>

        {/* BOTTOM-RIGHT CARD (hidden on mobile for cleaner layout) */}
        <div 
          className={`hidden md:block flex-shrink-0 transition-all duration-1000 ease-out delay-200 ${
            isVisible 
              ? 'opacity-100 translate-x-0' 
              : 'opacity-0 translate-x-8'
          }`}
        >
          <div className="bg-white/20 backdrop-blur-md rounded-2xl p-4 w-60 lg:w-[240px] xl:w-[292px] mb-8">
            <div className="relative w-full h-[250px] rounded-lg overflow-hidden mb-3">
              <Image
                src={card.image || "/images/products/antenna.png"}
                alt={card.title || "Precision & Performance"}
                fill
                className="object-contain"
              />
            </div>

            <h3 
              className={`text-white text-2xl transition-all duration-700 text-center ease-out delay-300 ${
                isVisible 
                  ? 'opacity-100 translate-y-0' 
                  : 'opacity-0 translate-y-4'
              }`}
            >
              {card.title || "Precision & Performance"}
            </h3>

            <p 
              className={`text-white/80 text-[18px] mt-1 leading-relaxed transition-all duration-700 text-center ease-out delay-500 ${
                isVisible 
                  ? 'opacity-100 translate-y-0' 
                  : 'opacity-0 translate-y-4'
              }`}
            >
              {card.description || "Empowering connectivity with engineered reliability and real world results"}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

