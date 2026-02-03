"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { imageBuilder } from "@/lib/data/shop-utils";
import { ButtonArrowHomepage } from "@/components/Common/ButtonArrowHomepage";

interface HeroBannerData {
  _id?: string;
  name?: string;
  isActive?: boolean;
  backgroundImage?: any;
  backgroundImageAlt?: string;
  title?: string;
  buttons?: Array<{
    text: string;
    link: string;
  }>;
  brandName?: string;
  card?: {
    image?: any;
    title?: string;
    description?: string;
  };
}

interface HeroStaticProps {
  bannerData?: HeroBannerData | null;
}

export default function HeroStatic({ bannerData }: HeroStaticProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger animation after component mounts
    setIsVisible(true);
  }, []);

  // Fallback values if no CMS data is provided
  const backgroundImage = bannerData?.backgroundImage
    ? imageBuilder(bannerData.backgroundImage).url()
    : "/images/hero/banner.webp";
  
  const title = bannerData?.title || "Industrial-grade RF solutions for reliable wireless connectivity.";
  const brandName = bannerData?.brandName || "ZDA Communications";
  const buttons = bannerData?.buttons || [
    { text: "All Products", link: "/products" },
    { text: "Cable Builder", link: "/cable-builder" },
  ];
  const card = bannerData?.card;

  // Parse title to handle <br> tags
  const renderTitle = () => {
    if (title.includes("<br")) {
      const parts = title.split(/<br\s*\/?>/i);
      return parts.map((part, index) => (
        <span key={index}>
          {part}
          {index < parts.length - 1 && <br />}
        </span>
      ));
    }
    return title;
  };

  return (
    <section className="relative w-full h-[600px] rounded-[10px] overflow-hidden">
      {/* Background */}
      <Image
        src={backgroundImage}
        alt={bannerData?.backgroundImageAlt || "Hero"}
        fill
        priority
        className="object-cover brightness-50"
      />

      {/* Dark overlay similar to screenshot */}
      <div className="absolute inset-0 bg-black/40 bg-linear-to-t from-black/50 via-black/20 to-transparent" />

      {/* LEFT TEXT + BUTTONS */}
      <div className="absolute left-6 sm:left-8 lg:left-10 z-10 max-w-[1136px]">
        <h1 
          className={`transition-all duration-1000 ease-out mt-[30px] sm:mt-[40px] md:mt-[50px] text-[40px] sm:text-[50px] ${
            isVisible 
              ? 'opacity-100 translate-y-0' 
              : 'opacity-0 translate-y-8'
          }`}
          style={{
            color: '#FFF',
            fontFamily: 'Satoshi, sans-serif',
            fontStyle: 'normal',
            fontWeight: 400,
            lineHeight: '60px',
            letterSpacing: '-2px',
          }}
        >
          {renderTitle()}
        </h1>

        <div 
          className={`flex flex-col mt-5 gap-3 mb-3 transition-all duration-1000 ease-out delay-300 ${
            isVisible 
              ? 'opacity-100 translate-y-0' 
              : 'opacity-0 translate-y-8'
          }`}
        >
          {buttons.map((button, index) => (
            <Link
              key={index}
              href={button.link}
              className="btn filled group relative inline-flex items-center justify-center rounded-[10px] border border-transparent bg-[#2958A4] text-white text-sm font-medium transition-all duration-300 ease-in-out hover:bg-[#214683] hover:active"
              style={{ 
                fontFamily: 'Satoshi, sans-serif',
                display: 'flex',
                width: '195px',
                padding: '10px 20px',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '10px',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.paddingRight = 'calc(20px + 11px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.paddingRight = '20px';
              }}
            >
              <ButtonArrowHomepage />
              <p className="transition-transform duration-300 ease-in-out group-hover:translate-x-[11px] m-0">{button.text}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* BOTTOM-LEFT BRAND NAME */}
      <BrandNameAnimation brandName={brandName} />

      {/* BOTTOM-RIGHT CARD (hidden on mobile for cleaner layout) */}
      <CardAnimation card={card} />
    </section>
  );
}

function BrandNameAnimation({ brandName }: { brandName: string }) {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.2 });

  return (
    <div 
      ref={ref}
      className={`absolute bottom-0 left-6 sm:left-8 lg:left-10 z-10 transition-all duration-1000 ease-out ${
        isVisible 
          ? 'opacity-100 translate-x-0' 
          : 'opacity-0 -translate-x-8'
      }`}
    >
      <p className="text-white text-[48px] sm:text-[40px] md:text-[50px] lg:text-[60px] xl:text-[70px] 2xl:text-[100px] font-light tracking-tight">
        {brandName}
      </p>
    </div>
  );
}

function CardAnimation({ card }: { card?: { image?: any; title?: string; description?: string } }) {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.2 });
  const cardImage = card?.image
    ? imageBuilder(card.image).url()
    : "/images/hero/hero-antenna.webp";
  const cardTitle = card?.title || "Precision & Performance";
  const cardDescription = card?.description || "Empowering connectivity with engineered reliability and real world results";

  return (
    <div 
      ref={ref}
      className={`hidden md:block absolute bottom-8 right-6 sm:right-10 lg:right-10 xl:right-12 z-10 transition-all duration-1000 ease-out delay-200 ${
        isVisible 
          ? 'opacity-100 translate-x-0' 
          : 'opacity-0 translate-x-8'
      }`}
    >
      <div className="bg-white/20 backdrop-blur-md rounded-2xl p-4 w-60 lg:w-[240px] xl:w-[292px] xs:mb-12">
        <div className="relative w-full h-[250px] rounded-lg overflow-hidden mb-3">
          <Image
            src={cardImage}
            alt={cardTitle}
            fill
            className="rounded-lg object-cover"
          />
        </div>

        <h3 
          className={`text-white text-2xl transition-all duration-700 text-center ease-out delay-300 ${
            isVisible 
              ? 'opacity-100 translate-y-0' 
              : 'opacity-0 translate-y-4'
          }`}
        >
          {cardTitle}
        </h3>

        <p 
          className={`text-white/80 text-[18px] mt-1 leading-relaxed transition-all duration-700 text-center ease-out delay-500 ${
            isVisible 
              ? 'opacity-100 translate-y-0' 
              : 'opacity-0 translate-y-4'
          }`}
        >
          {cardDescription}
        </p>
      </div>
    </div>
  );
}
