"use client";

import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, FreeMode } from "swiper/modules";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { imageBuilder } from "@/lib/data/shop-utils";
import "swiper/css";
import "swiper/css/free-mode";

type Brand = { name: string; logo: string };

const defaultBrands: Brand[] = [
  { name: "IWT", logo: "/images/hero/partners/iwt.svg" },
  { name: "xetawave", logo: "/images/hero/partners/xetawave.svg" },
  { name: "APS", logo: "/images/hero/partners/aps.svg" },
  { name: "Motus", logo: "/images/hero/partners/motus.png" },
  { name: "abc", logo: "/images/hero/partners/abc.png" },
  { name: "rancho", logo: "/images/hero/partners/rancho.webp" },
];

interface ProudPartnersData {
  _id?: string;
  name?: string;
  isActive?: boolean;
  title?: string;
  partners?: Array<{
    name: string;
    logo: any;
  }>;
}

interface ProudPartnersProps {
  partnersData?: ProudPartnersData | null;
}

export default function ProudPartners({ partnersData }: ProudPartnersProps) {
  const titleRef = useScrollAnimation({ threshold: 0.2 });
  const carouselRef = useScrollAnimation({ threshold: 0.2 });

  // Fallback values if no data from CMS
  const title = partnersData?.title || "Proud Suppliers Of";
  const partners = partnersData?.partners?.map((partner) => ({
    name: partner.name,
    // If logo is already a string URL, use it directly; otherwise use imageBuilder
    logo: typeof partner.logo === 'string' 
      ? partner.logo 
      : (partner.logo ? imageBuilder(partner.logo).url() : "/images/hero/partners/motus.svg"),
  })) || defaultBrands;

  return (
    <section className="w-full py-12 sm:pt-0">
      <div className="mx-auto max-w-[1340px]">
        {/* Heading */}
        <h2 
          ref={titleRef.ref}
          className={`text-[#000] font-satoshi text-[40px] lg:text-[56px] font-normal leading-[76px] tracking-[-2.24px] text-center transition-all duration-1000 ease-out ${
            titleRef.isVisible 
              ? 'opacity-100 translate-y-0' 
              : 'opacity-0 translate-y-8'
          }`}
        >
          {title}
        </h2>

        {/* Carousel */}
        <div 
          ref={carouselRef.ref}
          className={`mt-8 transition-all duration-1000 ease-out delay-300 ${
            carouselRef.isVisible 
              ? 'opacity-100 translate-y-0' 
              : 'opacity-0 translate-y-8'
          }`}
        >
          <Swiper
            modules={[Autoplay, FreeMode]}
            loop
            freeMode
            autoplay={{ delay: 0, disableOnInteraction: false, pauseOnMouseEnter: true }}
            speed={4500}                 // smooth continuous scroll
            slidesPerView={2}
            spaceBetween={24}
            breakpoints={{
              640: { slidesPerView: 3, spaceBetween: 28 },
              768: { slidesPerView: 4, spaceBetween: 32 },
              1024:{ slidesPerView: 5, spaceBetween: 36 },
            }}
            className="!overflow-hidden"
            aria-label="Brand partners carousel"
          >
            {/* duplicate once to ensure seamless loop */}
            {[...partners, ...partners].map((b, i) => (
              <SwiperSlide key={`${b.name}-${i}`}>
                <div className="flex items-center justify-center">
                  <Image
                    src={b.logo}
                    alt={b.name}
                    width={180}
                    height={56}
                    className="h-14 w-auto object-contain"
                    priority={i < 5}
                  />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </section>
  );
}
