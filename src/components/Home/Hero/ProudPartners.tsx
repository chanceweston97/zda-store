"use client";

import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, FreeMode } from "swiper/modules";
import "swiper/css";
import "swiper/css/free-mode";
import type { ProudPartners } from "@/data/types";

interface ProudPartnersProps {
  partnersData?: ProudPartners | null;
}

export default function ProudPartners({ partnersData }: ProudPartnersProps) {
  const title = partnersData?.title || "Proud Suppliers Of";
  const partners = partnersData?.partners || [
    { name: "IWT", logo: "/images/partners/iwt.svg" },
    { name: "XetaWave", logo: "/images/partners/xetawave.svg" },
    { name: "APS", logo: "/images/partners/aps.svg" },
    { name: "Motus", logo: "/images/partners/motus.png" },
    { name: "ABC", logo: "/images/partners/abc.svg" },
    { name: "Rancho", logo: "/images/partners/rancho.png" },
  ];

  return (
    <section className="w-full py-12 sm:pt-0">
      <div className="mx-auto max-w-[1340px] px-4 sm:px-6 xl:px-0">
        {/* Heading */}
        <h2 className="text-[#2958A4] text-[40px] font-medium text-center mb-8">
          {title}
        </h2>

        {/* Carousel */}
        <div className="mt-8">
          <Swiper
            modules={[Autoplay, FreeMode]}
            loop={true}
            freeMode={true}
            autoplay={{
              delay: 0,
              disableOnInteraction: false,
              pauseOnMouseEnter: true,
            }}
            speed={4500}
            slidesPerView={2}
            spaceBetween={24}
            breakpoints={{
              640: {
                slidesPerView: 3,
                spaceBetween: 28,
              },
              768: {
                slidesPerView: 4,
                spaceBetween: 32,
              },
              1024: {
                slidesPerView: 5,
                spaceBetween: 36,
              },
              1280: {
                slidesPerView: 6,
                spaceBetween: 40,
              },
            }}
            className="!overflow-hidden"
            aria-label="Brand partners carousel"
          >
            {/* Duplicate partners for seamless loop */}
            {[...partners, ...partners].map((partner, i) => (
              <SwiperSlide key={`${partner.name}-${i}`}>
                <div className="flex items-center justify-center h-20">
                  <Image
                    src={partner.logo}
                    alt={partner.name}
                    width={180}
                    height={56}
                    className="h-14 w-auto object-contain opacity-70 hover:opacity-100 transition-opacity"
                    priority={i < partners.length}
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

