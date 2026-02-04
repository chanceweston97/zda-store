"use client";

import Image from "next/image";
import Link from "next/link";
import { imageBuilder } from "@/lib/data/shop-utils";

interface HeroProps {
  slider: {
    image?: any;                         // CMS image object
    headline?: string;                   // large text
    subheadline?: string;                // "ZDA Communications"
    overlayImageUrl?: string;            // small image on right
    overlayTitle?: string;               // title inside small card
    overlayQuote?: string;               // text inside small card
  };
}

export default function Hero({ slider }: HeroProps) {
  const bgSrc =
    slider?.image ? imageBuilder(slider.image).url()! : "/no-image";

  const cardImg =
    slider?.overlayImageUrl ?? "/no-image";

  return (
    <section className="relative w-full rounded-2xl overflow-hidden max-h-[560px]">

      {/* ✅ Background */}
      <Image
        src={bgSrc}
        alt="Hero"
        fill
        priority
        className="object-cover"
      />

      {/* ✅ Soft gradient left → right so text is readable */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/45 via-black/25 to-transparent" />

      {/* ✅ Content left */}
      <div className="absolute z-10 left-6 sm:left-10 lg:left-16 top-1/2 -translate-y-1/2 max-w-[760px]">

        <h1 className="text-white font-semibold leading-tight text-[28px] sm:text-[40px] lg:text-[50px] tracking-tight">
          {(() => {
            const headline = slider?.headline ?? "Industrial-grade RF solutions for reliable wireless connectivity.";
            const sloganPhrase = " for reliable wireless connectivity";
            const idx = headline.indexOf(sloganPhrase);
            if (idx !== -1) {
              const first = headline.slice(0, idx).trim();
              const second = "for reliable wireless connectivity" + headline.slice(idx + sloganPhrase.length).trim();
              return (
                <>
                  {first}
                  <br />
                  {second || "for reliable wireless connectivity."}
                </>
              );
            }
            return headline;
          })()}
        </h1>

        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            href="/products"
            prefetch={false}
            className="inline-flex items-center rounded-full bg-[#2958A4] hover:bg-[#1F4480] text-white text-sm font-medium px-6 py-2.5"
          >
            All Products
          </Link>

          <Link
            href="/custom-cable"
            className="inline-flex items-center rounded-full bg-white/20 hover:bg-white/30 text-white text-sm font-medium px-6 py-2.5 backdrop-blur"
          >
            Cable Builder
          </Link>
        </div>

        <p className="mt-6 text-white/90 text-3xl sm:text-5xl font-light">
          {slider?.subheadline ?? "ZDA Communications"}
        </p>
      </div>

      {/* ✅ Small right card */}
      <aside className="absolute z-10 right-4 sm:right-6 bottom-4 sm:bottom-6 w-[260px] rounded-xl bg-white/70 backdrop-blur-md shadow-md overflow-hidden">
        <div className="relative w-full h-[120px]">
          <Image
            src={cardImg}
            alt="Card Img"
            fill
            className="object-cover"
          />
        </div>
        <div className="p-3">
          <h3 className="text-sm font-semibold">
            {slider?.overlayTitle ?? "Precision & Performance"}
          </h3>
          <p className="mt-1 text-xs text-gray-700">
            {slider?.overlayQuote ??
              `"Unlock your potential with expert coaching and world-class facilities."`}
          </p>
        </div>
      </aside>
    </section>
  );
}
