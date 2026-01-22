"use client";

// components/Sections/NetworkIntro.tsx
import Link from "next/link";
import Image from "next/image";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { imageBuilder } from "@/lib/data/shop-utils";
import { ButtonArrowHomepage } from "@/components/Common/ButtonArrowHomepage";

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

  // Fallback values if no CMS data is provided
  const title = introductionData?.title || "Enabling wireless networks since 2008";
  const description = introductionData?.description || "At ZDA Communications, we care about one thing above all: reliable wireless performance. We design and supply industrial-grade antennas, cabling, and RF accessories that help homes, enterprises, and field teams achieve clear, consistent connectivity. ";
  const buttons = (introductionData?.buttons || [
    { text: "More About Us", link: "/about" },
    { text: "Explore Products", link: "/products" },
  ]).filter(button => button.text !== "More About Us").map(button => 
    button.text === "Explore Products" 
      ? { ...button, text: "Discover our Products" }
      : button
  );
  const imageUrl = introductionData?.image
    ? imageBuilder(introductionData.image).url()
    : "/images/cable-customizer/hero-cable.png";

  // Split title for styling - "Enabling wireless networks" in black, "since 2008" in blue
  const titleLower = title.toLowerCase();
  let mainTitle = "Enabling wireless networks";
  let yearPart = "since 2008";
  
  if (titleLower.includes("since 2008")) {
    const index = titleLower.indexOf("since 2008");
    mainTitle = title.substring(0, index).trim();
    yearPart = title.substring(index).trim();
  } else {
    // Fallback: use the full title as main title if pattern not found
    mainTitle = title;
    yearPart = "";
  }

  // Split description into two paragraphs
  const splitDescription = (desc: string) => {
    // Split at the period after "reliable wireless performance"
    const firstSentenceEnd = desc.indexOf("reliable wireless performance.");
    if (firstSentenceEnd !== -1) {
      const firstParagraph = desc.substring(0, firstSentenceEnd + "reliable wireless performance.".length).trim();
      const secondParagraph = desc.substring(firstSentenceEnd + "reliable wireless performance.".length).trim();
      return [firstParagraph, secondParagraph];
    }
    // Fallback: try to split at any period
    const periodIndex = desc.indexOf(". ");
    if (periodIndex !== -1) {
      return [
        desc.substring(0, periodIndex + 1).trim(),
        desc.substring(periodIndex + 2).trim()
      ];
    }
    return [desc, ""];
  };

  const [firstParagraph, secondParagraph] = splitDescription(description);

  return (
    <section 
      className="w-full max-w-[1340px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 pb-8 sm:pb-12 lg:pb-16 flex flex-col gap-6 sm:gap-8 lg:gap-10 mb-8 sm:mb-12 lg:mb-16"
      style={{
        borderRadius: '10px',
        background: 'radial-gradient(145.54% 145.5% at 49.33% -2.63%, #FDFDFD 30.35%, #F1F6FF 100%)',
        paddingTop: '22px'
      }}
    >
      {/* Content Row: Image and Text/Buttons */}
        {/* Heading - Top Left */}
        <h2 
          ref={titleRef.ref}
          className={`transition-all duration-1000 ease-out mb-5 md:mb-[30px] ${
            titleRef.isVisible 
              ? 'opacity-100 translate-y-0' 
              : 'opacity-0 translate-y-8'
          }`}
        >
          <span style={{
            color: '#000',
            fontFamily: 'Satoshi',
            fontSize: '50px',
            fontStyle: 'normal',
            fontWeight: 400,
            lineHeight: '50px',
            letterSpacing: '-2px'
          }}>{mainTitle}</span>
          {yearPart && <span style={{
            color: '#2958A4',
            fontFamily: 'Satoshi',
            fontSize: '50px',
            fontStyle: 'normal',
            fontWeight: 400,
            lineHeight: '50px',
            letterSpacing: '-2px'
          }}> {yearPart}</span>}
        </h2>

        {/* Bottom Row: Image on Left, Text/Button on Right */}
        <div className="flex flex-col md:flex-row items-center md:items-center" style={{ flex: 1, gap: '20px' }}>
          {/* LEFT IMAGE */}
          <div 
            ref={imageRef.ref}
            className={`w-full lg:w-auto shrink-0 flex items-center justify-center transition-all duration-1000 ease-out delay-300 ${
              imageRef.isVisible 
                ? 'opacity-100 translate-x-0 scale-100' 
                : 'opacity-0 translate-x-8 scale-95'
            }`}
          >
            <Image
              src={imageUrl}
              alt={title}
              width={647}
              height={178}
              className="object-contain"
              style={{
                width: '647px',
                height: '178px',
                maxWidth: '100%',
                aspectRatio: '647/178'
              }}
            />
          </div>

          {/* RIGHT CONTENT */}
          <div className="w-full md:w-auto" style={{ display: 'flex', flexDirection: 'column', gap: '25px', marginLeft: 'auto', width: '482px', maxWidth: '100%' }}>
          {/* Paragraphs */}
          <div 
            ref={textRef.ref}
            className={`transition-all duration-1000 ease-out delay-200 ${
              textRef.isVisible 
                ? 'opacity-100 translate-y-0' 
                : 'opacity-0 translate-y-8'
            }`}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              height: 'auto',
              minHeight: '168px'
            }}
          >
            <p className="text-[16px] md:text-[18px]" style={{
              color: '#383838',
              fontFamily: 'Satoshi',
              fontStyle: 'normal',
              fontWeight: 400,
              lineHeight: '28px',
              letterSpacing: '-0.36px',
              margin: 0
            }}>{firstParagraph}</p>
            {secondParagraph && <p className="text-[16px] md:text-[18px]" style={{
              color: '#383838',
              fontFamily: 'Satoshi',
              fontStyle: 'normal',
              fontWeight: 400,
              lineHeight: '28px',
              letterSpacing: '-0.36px',
              margin: 0
            }}>{secondParagraph}</p>}
          </div>

          {/* Buttons */}
          <div 
            ref={buttonsRef.ref}
            className={`transition-all duration-1000 ease-out delay-400 ${
              buttonsRef.isVisible 
                ? 'opacity-100 translate-y-0' 
                : 'opacity-0 translate-y-8'
            }`}
            style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}
          >
            {buttons.map((button, index) => (
              <Link
                key={index}
                href={button.link}
                className="btn filled group relative inline-flex items-center justify-center rounded-[10px] border border-transparent bg-[#2958A4] text-white text-[14px] sm:text-[16px] font-medium transition-all duration-300 ease-in-out hover:bg-[#214683]"
                style={{ 
                  fontFamily: 'Satoshi, sans-serif',
                  padding: '10px 30px',
                  paddingRight: '30px',
                  cursor: 'pointer',
                  width: '252px',
                  minWidth: '252px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.paddingRight = 'calc(30px + 17px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.paddingRight = '30px';
                }}
              >
                <ButtonArrowHomepage />
                <p className="transition-transform duration-300 ease-in-out group-hover:translate-x-[11px] m-0">{button.text}</p>
              </Link>
            ))}
          </div>
          </div>
        </div>
    </section>
  );
}
