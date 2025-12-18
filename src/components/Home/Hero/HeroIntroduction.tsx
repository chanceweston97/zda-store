"use client";

// components/Sections/NetworkIntro.tsx
import Link from "next/link";
import Image from "next/image";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { imageBuilder } from "@/lib/data/shop-utils";

interface HeroIntroductionData {
  _id?: string;
  name?: string;
  isActive?: boolean;
  title?: string;
  description?: string;
  buttons?: Array<{
    text: string;
    link: string;
  }>;
  image?: any;
}

interface HeroIntroductionProps {
  introductionData?: HeroIntroductionData | null;
}

export default function HeroIntroduction({ introductionData }: HeroIntroductionProps) {
  const titleRef = useScrollAnimation({ threshold: 0.2 });
  const textRef = useScrollAnimation({ threshold: 0.2 });
  const buttonsRef = useScrollAnimation({ threshold: 0.2 });
  const imageRef = useScrollAnimation({ threshold: 0.2 });

  // Fallback values if no data from Sanity
  const title = introductionData?.title || "Enabling Wireless Networks Since 2008";
  const description = introductionData?.description || "At ZDA Communications, we care about one thing above all: reliable wireless performance. We design and supply industrial-grade antennas, cabling, and RF accessories—plus practical tools like custom cable builds—that help homes, enterprises, and field teams achieve clear, consistent connectivity. From fixed sites to mobile deployments, our hardware is engineered for uptime, verified for low VSWR, and built to stand up to real-world conditions so your network stays steady when it matters.";
  const buttons = introductionData?.buttons || [
    { text: "More About Us", link: "/about" },
    { text: "Explore Products", link: "/shop" },
  ];
  const imageUrl = introductionData?.image
    ? imageBuilder(introductionData.image).url()
    : "/images/hero/Xetawave-1.webp";

  return (
    <section className="w-full flex flex-col lg:flex-row justify-between gap-8 lg:gap-7 py-12 lg:pb-0">
      {/* LEFT CONTENT */}
      <div className="max-w-2xl d-flex flex-col justify-center">
        {/* Heading */}
        <h2 
          ref={titleRef.ref}
          className={`text-[#2958A4] text-[40px] font-medium leading-[76px] tracking-[-2.4px] transition-all duration-1000 ease-out ${
            titleRef.isVisible 
              ? 'opacity-100 translate-y-0' 
              : 'opacity-0 translate-y-8'
          }`}
        >
          {title}
        </h2>

        {/* Paragraph */}
        <p 
          ref={textRef.ref}
          className={`mt-6 text-[#4F6866] text-[18px] font-normal leading-7 tracking-[-0.36px] transition-all duration-1000 ease-out delay-200 ${
            textRef.isVisible 
              ? 'opacity-100 translate-y-0' 
              : 'opacity-0 translate-y-8'
          }`}
        >
          {description}
        </p>

        {/* Buttons */}
        <div 
          ref={buttonsRef.ref}
          className={`mt-8 flex flex-wrap gap-4 transition-all duration-1000 ease-out delay-400 ${
            buttonsRef.isVisible 
              ? 'opacity-100 translate-y-0' 
              : 'opacity-0 translate-y-8'
          }`}
        >
          {buttons.map((button, index) => (
            <Link
              key={index}
              href={button.link}
              className="inline-flex items-center rounded-full border border-transparent bg-[#2958A4] text-white text-sm font-medium px-6 py-3 transition-colors hover:border-[#2958A4] hover:bg-white hover:text-[#2958A4]"
            >
              {button.text}
            </Link>
          ))}
        </div>

      </div>

      {/* RIGHT IMAGE */}
      <div 
        ref={imageRef.ref}
        className={`shrink-0 mx-auto lg:mx-0 transition-all duration-1000 ease-out delay-300 ${
          imageRef.isVisible 
            ? 'opacity-100 translate-x-0 scale-100' 
            : 'opacity-0 translate-x-8 scale-95'
        }`}
      >
        <Image
          src={imageUrl}
          alt={title}
          width={645}
          height={447}
          className="w-[645px] h-[447px] object-contain shrink-0"
        />
      </div>
    </section>
  );
}
