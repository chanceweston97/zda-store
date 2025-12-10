"use client";

import Image from "next/image";
import LocalizedClientLink from "@modules/common/components/localized-client-link";
import type { WhatWeOffer } from "@/data/types";

interface WhatWeOfferProps {
  whatWeOfferData?: WhatWeOffer | null;
}

export default function WhatWeOffer({ whatWeOfferData }: WhatWeOfferProps) {
  const title = whatWeOfferData?.title || "What We Offer";
  const headerButton = whatWeOfferData?.headerButton || {
    text: "Explore Products",
    link: "/store",
  };

  // Default offer items if no data
  const defaultItems = [
    {
      title: "Antennas",
      tags: ["Yagi", "Omnidirectional", "Grid Parabolic", "Rubber Ducky"],
      description: "Directional and omnidirectional options engineered for reliable coverage—from VHF/UHF to LTE/5G sub-6 GHz. Field-ready builds with verified VSWR for clean links in real-world conditions.",
      button: { text: "Explore Antennas", link: "/store?category=antennas" },
      image: "/images/products/antenna.png",
      imagePosition: "right" as const,
    },
    {
      title: "Coaxial Cables",
      tags: ["LMR/RG Cables", "Any Length", "Standard Connectors", "Bulk Spools"],
      description: "Low-loss 50-ohm assemblies cut to length with precise terminations for minimal attenuation and maximum durability. Any length, assembled in the United States.",
      button: { text: "Explore Cables", link: "/products/cables" },
      image: "/images/products/cable.png",
      imagePosition: "left" as const,
    },
    {
      title: "Connectors & Accessories",
      tags: ["Connectors", "Surge Arrestors", "Splitters", "Attenuators"],
      description: "Industry-standard RF connectors, adapters, and couplers for secure, low-resistance joins across your network. Available in N, SMA, TNC, and more.",
      button: { text: "Explore Accessories", link: "/products/connectors" },
      image: "/images/products/antenna.png",
      imagePosition: "right" as const,
    },
  ];

  const offerItems = whatWeOfferData?.offerItems || defaultItems;

  return (
    <section className="bg-[#F4F4F4] lg:p-[50px] flex items-center gap-2.5 rounded-[20px]">
      <div className="mx-auto w-full max-w-[1340px] px-4 sm:px-6 xl:px-0">
        {/* HEADER */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between items-center py-5">
          <h2 className="text-[#2958A4] text-[40px] lg:text-[60px] font-medium leading-[76px] tracking-[-1.2px]">
            {title}
          </h2>

          <LocalizedClientLink
            href={headerButton.link}
            className="inline-flex items-center rounded-full border border-transparent bg-[#2958A4] text-white text-sm font-medium px-6 py-3 transition-colors hover:border-[#2958A4] hover:bg-white hover:text-[#2958A4]"
          >
            {headerButton.text}
          </LocalizedClientLink>
        </div>

        {/* OFFER ITEMS */}
        {offerItems.map((item, index) => {
          const isImageLeft = item.imagePosition === "left";

          return (
            <div
              key={index}
              className={`flex flex-col gap-6 lg:flex-row justify-between ${index > 0 ? index === 1 ? '' : 'pt-5' : 'py-5'}`}
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

                      <LocalizedClientLink
                        href={item.button.link}
                        className="self-start inline-flex items-center rounded-full border border-transparent bg-[#2958A4] text-white text-sm font-medium px-6 py-3 transition-colors hover:border-[#2958A4] hover:bg-white hover:text-[#2958A4]"
                      >
                        {item.button.text}
                      </LocalizedClientLink>
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

