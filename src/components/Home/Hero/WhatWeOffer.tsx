"use client";

import Image from "next/image";
import Link from "next/link";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { imageBuilder } from "@/lib/data/shop-utils";
import { ButtonArrowHomepage } from "@/components/Common/ButtonArrowHomepage";

interface WhatWeOfferData {
  _id?: string;
  name?: string;
  isActive?: boolean;
  title?: string;
  headerButton?: {
    text: string;
    link: string;
  };
  offerItems?: Array<{
    title: string;
    tags?: string[];
    description: string;
    button: {
      text: string;
      link: string;
    };
    image: any;
    imagePosition?: "left" | "right";
  }>;
}

interface WhatWeOfferProps {
  whatWeOfferData?: WhatWeOfferData | null;
}

export default function WhatWeOffer({ whatWeOfferData }: WhatWeOfferProps) {
    const headerRef = useScrollAnimation({ threshold: 0.2 });
    const firstRowRef = useScrollAnimation({ threshold: 0.2 });
    const secondRowRef = useScrollAnimation({ threshold: 0.2 });
    const thirdRowRef = useScrollAnimation({ threshold: 0.2 });

    // Fallback values if no data from CMS
    const title = whatWeOfferData?.title || "What We Offer";
    const headerButton = whatWeOfferData?.headerButton || {
        text: "Explore Products",
        link: "/products",
    };

    // Default offer items if no data
    const defaultItems = [
        {
            title: "Antennas",
            tags: ["Yagi", "Omnidirectional", "Grid Parabolic", "Rubber Ducky"],
            description: "Directional and omnidirectional options engineered for reliable coverage—from VHF/UHF to LTE/5G sub-6 GHz. Field-ready builds with verified VSWR for clean links in real-world conditions.",
            button: { text: "Explore Antennas", link: "/categories/antennas" },
            image: "/images/hero/what-we-offer/antennas.webp",
            imagePosition: "right" as const,
        },
        {
            title: "Coaxial Cables",
            tags: ["LMR/RG Cables", "Any Length", "Standard Connectors", "Bulk Spools"],
            description: "Low-loss 50-ohm assemblies cut to length with precise terminations for minimal attenuation and maximum durability. Any length, assembled in the United States.",
            button: { text: "Explore Cables", link: "/categories/cables" },
            image: "/images/hero/what-we-offer/cables.webp",
            imagePosition: "left" as const,
        },
        {
            title: "Connectors & Accessories",
            tags: ["Connectors", "Surge Arrestors", "Splitters", "Attenuators"],
            description: "Industry-standard RF connectors, adapters, and couplers for secure, low-resistance joins across your network. Available in N, SMA, TNC, and more.",
            button: { text: "Explore Accessories", link: "/categories/connectors" },
            image: "/images/hero/what-we-offer/connectors.webp",
            imagePosition: "right" as const,
        },
    ];

    const offerItems = whatWeOfferData?.offerItems?.map((item) => ({
        ...item,
        // If image is already a string URL, use it directly; otherwise use imageBuilder
        image: typeof item.image === 'string' 
            ? item.image 
            : (item.image ? imageBuilder(item.image).url() : "/images/hero/wireless.png"),
        imagePosition: item.imagePosition || "right",
    })) || defaultItems;

    const rowRefs = [firstRowRef, secondRowRef, thirdRowRef];

    return (
        <section className="bg-[#F4F4F4] lg:p-[50px] flex items-center gap-2.5 rounded-[20px]">
            <div className="mx-auto w-full max-w-[1340px] px-4 sm:px-6">

                {/* HEADER */}
                <div 
                    ref={headerRef.ref}
                    className={`flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between items-center transition-all duration-1000 ease-out ${
                        headerRef.isVisible 
                            ? 'opacity-100 translate-y-0' 
                            : 'opacity-0 translate-y-8'
                    }`}
                >
                    <h2 className="text-[#2958A4] text-[40px] lg:text-[60px] font-medium leading-[76px] tracking-[-1.2px]">
                        {title}
                    </h2>

                    <Link
                        href={headerButton.link}
                        className="btn filled group relative inline-flex items-center justify-center rounded-[10px] border border-transparent bg-[#2958A4] text-white text-[16px] font-medium transition-all duration-300 ease-in-out hover:bg-[#214683] hover:active"
                        style={{ 
                          fontFamily: 'Satoshi, sans-serif',
                          padding: '10px 30px',
                          paddingRight: '30px',
                          minWidth: 'fit-content'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.paddingRight = 'calc(30px + 17px)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.paddingRight = '30px';
                        }}
                    >
                        <ButtonArrowHomepage />
                        <p className="transition-transform duration-300 ease-in-out group-hover:translate-x-[11px] m-0">{headerButton.text}</p>
                    </Link>
                </div>

                {/* OFFER ITEMS */}
                {offerItems.map((item, index) => {
                    const rowRef = rowRefs[index] || firstRowRef;
                    const isImageLeft = item.imagePosition === "left";
                    const delay = 200 + (index * 100);

                    return (
                        <div 
                            key={index}
                            ref={rowRef.ref}
                            className={`flex flex-col gap-6 lg:flex-row justify-between ${index > 0 ? index === 1 ? '' : 'pt-5' : 'py-5'} transition-all duration-1000 ease-out ${
                                rowRef.isVisible 
                                    ? 'opacity-100 translate-y-0' 
                                    : 'opacity-0 translate-y-8'
                            }`}
                            style={{ transitionDelay: `${delay}ms` }}
                        >
                            {/* CARD */}
                            <div className={`w-full lg:max-w-[890px] order-1 ${isImageLeft ? 'lg:order-2' : 'lg:order-1'}`}>
                                <div className="rounded-[20px] bg-white px-8 py-8 shadow-sm lg:min-h-[412px] flex flex-col justify-between">
                                    <h3 className="text-[#2958A4] text-[40px] lg:text-[56px] font-medium mb-6">
                                        {item.title}
                                    </h3>

                                    <div className="flex flex-col sm:flex-row sm:items-end gap-10">
                                        {/* TAGS - 1x1 Grid (single column, vertically stacked) */}
                                        {item.tags && item.tags.length > 0 && (
                                            <div className="flex flex-col gap-3 w-auto">
                                                {item.tags.map((tag, tagIndex) => (
                                                    <span
                                                        key={tagIndex}
                                                        className="inline-flex items-center px-5 py-2.5 rounded-full border border-white bg-[#F4F4F4] text-[#2958A4] text-[16px] font-medium w-fit"
                                                    >
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        )}

                                        <div className="flex flex-col max-w-[400px]">
                                            <p className="text-[#383838] text-[18px] font-normal leading-7 mb-8">
                                                {item.description}
                                            </p>

                                            <Link
                                                href={item.button.link}
                                                className="btn filled group relative self-start inline-flex items-center justify-center rounded-[10px] border text-[16px] font-medium transition-all duration-300 ease-in-out"
                                                style={{ 
                                                  fontFamily: 'Satoshi, sans-serif',
                                                  padding: '10px 30px',
                                                  paddingRight: '30px',
                                                  minWidth: 'fit-content',
                                                  borderColor: '#2958A4',
                                                  backgroundColor: 'transparent',
                                                  color: '#2958A4'
                                                }}
                                                onMouseEnter={(e) => {
                                                  e.currentTarget.style.paddingRight = 'calc(30px + 11px)';
                                                  e.currentTarget.style.backgroundColor = '#2958A4';
                                                  e.currentTarget.style.color = '#FFFFFF';
                                                }}
                                                onMouseLeave={(e) => {
                                                  e.currentTarget.style.paddingRight = '30px';
                                                  e.currentTarget.style.backgroundColor = 'transparent';
                                                  e.currentTarget.style.color = '#2958A4';
                                                }}
                                            >
                                                <ButtonArrowHomepage />
                                                <p className="transition-transform duration-300 ease-in-out group-hover:translate-x-[11px] m-0">{item.button.text}</p>
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* IMAGE */}
                            <div className={`w-full lg:max-w-[423px] order-2 ${isImageLeft ? 'lg:order-1' : 'lg:order-2'}`}>
                                <div className="relative h-full min-h-[380px] lg:min-h-[412px] rounded-[20px] overflow-hidden bg-gray-200">
                                    <Image
                                        src={item.image}
                                        alt={item.title}
                                        fill
                                        className="object-cover"
                                        priority={index < 2}
                                    />
                                </div>
                            </div>
                        </div>
                    );
                })}

            </div>
        </section>
    );
}
