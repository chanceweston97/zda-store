"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ButtonArrowHomepage } from "@/components/Common/ButtonArrowHomepage";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { HomeOfferingItem } from "@/lib/wordpress/home-offering-items";

gsap.registerPlugin(ScrollTrigger);

const HEADER_OFFSET = 80;
const NUMBER_HEIGHT = 20;
const NUMBER_MARGIN = 50;
const CARD_HEIGHT = 450;
const GAP = 50;

// Button URLs link to Solutions page and scroll to the matching card (solutions-card-0..4; card 3 = Wildlife, card 4 = Private LTE)
const FALLBACK_ITEMS: HomeOfferingItem[] = [
  { title: "In-Building Wireless and DAS", description: "Indoor antennas and RF components engineered for active and passive DAS deployments across enterprise, public venue, and public safety environments.", button: { title: "Explore DAS Solutions", url: "/solutions#solutions-card-0" }, image: null },
  { title: "Public Safety & ERRCS", description: "RF solutions supporting VHF, UHF, and 700/800 MHz public safety communications where coverage reliability and code compliance are critical.", button: { title: "Explore Public Safety Solutions", url: "/solutions#solutions-card-1" }, image: null },
  { title: "Utilities, SCADA & Industrial", description: "Directional and omnidirectional antennas designed for long-range, low-noise communications in utility, telemetry, and industrial control networks.", button: { title: "Explore Industrial Solutions", url: "/solutions#solutions-card-2" }, image: null },
  { title: "Private LTE/5G & Infrastructure", description: "RF solutions supporting private LTE, private 5G, and fixed wireless deployments where controlled coverage and system reliability are critical.", button: { title: "Explore Private Wireless", url: "/solutions#solutions-card-4" }, image: null },
];

interface HeroScrollItemsProps {
  items?: HomeOfferingItem[] | null;
}

export default function HeroScrollItems({ items }: HeroScrollItemsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const card1Ref = useRef<HTMLDivElement>(null);
  const card2Ref = useRef<HTMLDivElement>(null);
  const card3Ref = useRef<HTMLDivElement>(null);
  const card4Ref = useRef<HTMLDivElement>(null);
  const dotsRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const displayItems = useMemo(() => {
    return [0, 1, 2, 3].map((i) => items?.[i] ?? FALLBACK_ITEMS[i]);
  }, [items]);

  useEffect(() => {
    ScrollTrigger.getAll().forEach(t => t.kill());

    if (!containerRef.current || !card1Ref.current || !card2Ref.current || !card3Ref.current || !card4Ref.current) return;

    // Calculate pin positions: each card pins just below previous number with 10px margin
    const card1PinTop = HEADER_OFFSET;
    const card2PinTop = HEADER_OFFSET + NUMBER_HEIGHT + NUMBER_MARGIN;
    const card3PinTop = HEADER_OFFSET + 2 * (NUMBER_HEIGHT + NUMBER_MARGIN);
    const card4PinTop = HEADER_OFFSET + 3 * (NUMBER_HEIGHT + NUMBER_MARGIN);

    // Pin dots with first card
    ScrollTrigger.create({
      trigger: card1Ref.current,
      start: `top ${card1PinTop}px`,
      endTrigger: card4Ref.current,
      end: `top ${card4PinTop}px`,
      pin: dotsRef.current,
      pinSpacing: false,
    });

    // Card 1: pins at header, unpins when card 4 reaches
    // Lower z-index so it gets covered by newer cards
    gsap.set(card1Ref.current, { zIndex: 1 });
    ScrollTrigger.create({
      trigger: card1Ref.current,
      start: `top ${card1PinTop}px`,
      endTrigger: card4Ref.current,
      end: `top ${card4PinTop}px`,
      pin: true,
      pinSpacing: false,
      anticipatePin: 1,
      onEnter: () => {
        setActiveIndex(0);
        if (card1Ref.current) {
          card1Ref.current.style.boxShadow = "0 20px 50px rgba(0,0,0,0.12)";
        }
      },
      onEnterBack: () => {
        setActiveIndex(0);
        if (card1Ref.current) {
          card1Ref.current.style.boxShadow = "0 20px 50px rgba(0,0,0,0.12)";
        }
      },
      onLeave: () => {
        if (card1Ref.current) {
          card1Ref.current.style.boxShadow = "none";
        }
      },
      onLeaveBack: () => {
        if (card1Ref.current) {
          card1Ref.current.style.boxShadow = "none";
        }
      },
    });

    // Card 2: pins under card 1's number (with 10px margin), unpins when card 4 reaches
    // Higher z-index so it covers card 1
    gsap.set(card2Ref.current, { zIndex: 2 });
    ScrollTrigger.create({
      trigger: card2Ref.current,
      start: `top ${card2PinTop}px`,
      endTrigger: card4Ref.current,
      end: `top ${card4PinTop}px`,
      pin: true,
      pinSpacing: false,
      anticipatePin: 1,
      onEnter: () => {
        setActiveIndex(1);
        if (card2Ref.current) {
          card2Ref.current.style.boxShadow = "0 20px 50px rgba(0,0,0,0.12)";
        }
      },
      onEnterBack: () => {
        setActiveIndex(1);
        if (card2Ref.current) {
          card2Ref.current.style.boxShadow = "0 20px 50px rgba(0,0,0,0.12)";
        }
      },
      onLeave: () => {
        if (card2Ref.current) {
          card2Ref.current.style.boxShadow = "none";
        }
      },
      onLeaveBack: () => {
        if (card2Ref.current) {
          card2Ref.current.style.boxShadow = "none";
        }
      },
    });

    // Card 3: pins under card 2's number (with 10px margin), unpins when card 4 reaches
    // Highest z-index so it covers card 1 and 2
    gsap.set(card3Ref.current, { zIndex: 3 });
    ScrollTrigger.create({
      trigger: card3Ref.current,
      start: `top ${card3PinTop}px`,
      endTrigger: card4Ref.current,
      end: `top ${card4PinTop}px`,
      pin: true,
      pinSpacing: false,
      anticipatePin: 1,
      onEnter: () => {
        setActiveIndex(2);
        if (card3Ref.current) {
          card3Ref.current.style.boxShadow = "0 20px 50px rgba(0,0,0,0.12)";
        }
      },
      onEnterBack: () => {
        setActiveIndex(2);
        if (card3Ref.current) {
          card3Ref.current.style.boxShadow = "0 20px 50px rgba(0,0,0,0.12)";
        }
      },
      onLeave: () => {
        if (card3Ref.current) {
          card3Ref.current.style.boxShadow = "none";
        }
      },
      onLeaveBack: () => {
        if (card3Ref.current) {
          card3Ref.current.style.boxShadow = "none";
        }
      },
    });

    // Card 4: NOT sticky, just tracks active index when it reaches
    ScrollTrigger.create({
      trigger: card4Ref.current,
      start: `top ${card4PinTop}px`,
      onEnter: () => setActiveIndex(3),
      onEnterBack: () => setActiveIndex(3),
    });

    ScrollTrigger.refresh();

    return () => {
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, []);

  return (
    <div className="mx-auto max-w-[1340px] px-4 sm:px-6 xl:px-0">
      <div
        className="flex flex-col md:flex-row gap-6 md:gap-12 xl:gap-[50px] items-start"
      >
        {/* Dots - Hidden on mobile */}
        <div
          ref={dotsRef}
          className="hidden md:flex"
          style={{
            flexDirection: "column",
            gap: 12,
            alignSelf: "flex-start",
            marginTop: `${CARD_HEIGHT * 2 / 3}px`, // Position at 1/3 of first item height
          }}
        >
          <div
            style={{
              width: 8,
              height: activeIndex === 0 ? 40 : 8,
              borderRadius: 4,
              background: activeIndex === 0 ? "#2958A4" : "#CBD5E1",
              transition: "0.3s",
            }}
          />
          <div
            style={{
              width: 8,
              height: activeIndex === 1 ? 40 : 8,
              borderRadius: 4,
              background: activeIndex === 1 ? "#2958A4" : "#CBD5E1",
              transition: "0.3s",
            }}
          />
          <div
            style={{
              width: 8,
              height: activeIndex === 2 ? 40 : 8,
              borderRadius: 4,
              background: activeIndex === 2 ? "#2958A4" : "#CBD5E1",
              transition: "0.3s",
            }}
          />
          <div
            style={{
              width: 8,
              height: activeIndex === 3 ? 40 : 8,
              borderRadius: 4,
              background: activeIndex === 3 ? "#2958A4" : "#CBD5E1",
              transition: "0.3s",
            }}
          />
        </div>

        {/* Cards */}
        <div ref={containerRef} className="w-full md:flex-1">
          {/* Card 1 */}
          <div
            ref={card1Ref}
            className="p-4 sm:p-6 lg:p-8 xl:p-[30px_50px] flex flex-col md:flex-row gap-0 md:gap-10"
            style={{
              minHeight: CARD_HEIGHT,
              height: "auto",
              background: "#F1F6FF",
              borderRadius: 10,
              transition: "box-shadow 0.3s",
              overflow: "hidden",
              position: "relative",
              marginBottom: "400px",
            }}
          >
            <div className="order-2 md:order-1" style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontSize: 16, color: "#457B9D", marginBottom: 0 }}>01/04</div>
                <h3 className="text-3xl sm:text-4xl lg:text-5xl" style={{ fontSize: "46px", marginTop: "10px", marginBottom: 0, whiteSpace: "nowrap", textOverflow: "ellipsis" }}>{displayItems[0].title}</h3>
              </div>
              <p
                className="mt-0 md:mt-[92px]"
                style={{
                  fontFamily: "Satoshi, sans-serif",
                  color: "#000",
                  fontSize: "18px",
                  fontStyle: "normal",
                  fontWeight: 400,
                  lineHeight: "28px",
                  width: "565px",
                  maxWidth: "100%",
                  marginBottom: 0,
                }}
              >
                {displayItems[0].description}
              </p>
              <Link
                href={displayItems[0].button.url}
                prefetch={false}
                className="btn group relative inline-flex items-center justify-center rounded-[10px] border-1 border-[#2958A4] bg-transparent text-[#2958A4] text-[14px] sm:text-[16px] font-medium transition-all duration-300 ease-in-out hover:bg-[#2958A4] hover:text-white hover:border-[#2958A4] w-full"
                style={{
                  fontFamily: "Satoshi, sans-serif",
                  padding: "10px 30px",
                  paddingRight: "30px",
                  cursor: "pointer",
                  maxWidth: "600px",
                  marginTop: "30px",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.paddingRight = "calc(30px + 17px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.paddingRight = "30px";
                }}
              >
                <ButtonArrowHomepage />
                <p className="transition-transform duration-300 ease-in-out group-hover:translate-x-[11px] m-0">{displayItems[0].button.title}</p>
              </Link>
            </div>
            <div className="order-1 md:order-2 w-full max-w-[360px] flex-shrink-0 flex items-center justify-center" style={{ aspectRatio: "1/1" }}>
              <div className="w-full h-full bg-[#E0E7FF] rounded-lg flex items-center justify-center text-[#6B7280] relative overflow-hidden" style={{ aspectRatio: "1/1" }}>
                {displayItems[0].image ? <Image src={displayItems[0].image} alt={displayItems[0].title} fill className="object-cover" sizes="(max-width: 768px) 100vw, 360px" /> : <span>Antenna Image</span>}
              </div>
            </div>
          </div>

          {/* Card 2 */}
          <div
            ref={card2Ref}
            className="p-4 sm:p-6 lg:p-8 xl:p-[30px_50px] flex flex-col md:flex-row gap-0 md:gap-10"
            style={{
              minHeight: CARD_HEIGHT,
              height: "auto",
              background: "#F1F6FF",
              borderRadius: 10,
              transition: "box-shadow 0.3s",
              overflow: "hidden",
              position: "relative",
              marginBottom: "400px",
            }}
          >
            <div className="order-2 md:order-1" style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontSize: 16, color: "#457B9D", marginBottom: 0 }}>02/04</div>
                <h3 className="text-3xl sm:text-4xl lg:text-5xl" style={{ fontSize: "46px", marginTop: "10px", marginBottom: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{displayItems[1].title}</h3>
              </div>
              <p
                className="mt-0 md:mt-[92px]"
                style={{
                  fontFamily: "Satoshi, sans-serif",
                  color: "#000",
                  fontSize: "18px",
                  fontStyle: "normal",
                  fontWeight: 400,
                  lineHeight: "28px",
                  width: "565px",
                  maxWidth: "100%",
                  marginBottom: 0,
                }}
              >
                {displayItems[1].description}
              </p>
              <Link
                href={displayItems[1].button.url}
                prefetch={false}
                className="btn group relative inline-flex items-center justify-center rounded-[10px] border-1 border-[#2958A4] bg-transparent text-[#2958A4] text-[14px] sm:text-[16px] font-medium transition-all duration-300 ease-in-out hover:bg-[#2958A4] hover:text-white hover:border-[#2958A4] w-full"
                style={{
                  fontFamily: "Satoshi, sans-serif",
                  padding: "10px 30px",
                  paddingRight: "30px",
                  cursor: "pointer",
                  maxWidth: "600px",
                  marginTop: "30px",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.paddingRight = "calc(30px + 17px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.paddingRight = "30px";
                }}
              >
                <ButtonArrowHomepage />
                <p className="transition-transform duration-300 ease-in-out group-hover:translate-x-[11px] m-0">{displayItems[1].button.title}</p>
              </Link>
            </div>
            <div className="order-1 md:order-2 w-full max-w-[360px] flex-shrink-0 flex items-center justify-center" style={{ aspectRatio: "1/1" }}>
              <div className="w-full h-full bg-[#E0E7FF] rounded-lg flex items-center justify-center text-[#6B7280] relative overflow-hidden" style={{ aspectRatio: "1/1" }}>
                {displayItems[1].image ? <Image src={displayItems[1].image} alt={displayItems[1].title} fill className="object-cover" sizes="(max-width: 768px) 100vw, 360px" /> : <span>Cable Image</span>}
              </div>
            </div>
          </div>

          {/* Card 3 */}
          <div
            ref={card3Ref}
            className="p-4 sm:p-6 lg:p-8 xl:p-[30px_50px] flex flex-col md:flex-row gap-0 md:gap-10"
            style={{
              minHeight: CARD_HEIGHT,
              height: "auto",
              background: "#F1F6FF",
              borderRadius: 10,
              transition: "box-shadow 0.3s",
              overflow: "hidden",
              position: "relative",
              marginBottom: "400px",
            }}
          >
            <div className="order-2 md:order-1" style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontSize: 16, color: "#457B9D", marginBottom: 0 }}>03/04</div>
                <h3 className="text-3xl sm:text-4xl lg:text-5xl" style={{ fontSize: "46px", marginTop: "10px", marginBottom: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{displayItems[2].title}</h3>
              </div>
              <p
                className="mt-0 md:mt-[92px]"
                style={{
                  fontFamily: "Satoshi, sans-serif",
                  color: "#000",
                  fontSize: "18px",
                  fontStyle: "normal",
                  fontWeight: 400,
                  lineHeight: "28px",
                  width: "565px",
                  maxWidth: "100%",
                  marginBottom: 0,
                }}
              >
                {displayItems[2].description}
              </p>
              <Link
                href={displayItems[2].button.url}
                prefetch={false}
                className="btn group relative inline-flex items-center justify-center rounded-[10px] border-1 border-[#2958A4] bg-transparent text-[#2958A4] text-[14px] sm:text-[16px] font-medium transition-all duration-300 ease-in-out hover:bg-[#2958A4] hover:text-white hover:border-[#2958A4] w-full"
                style={{
                  fontFamily: "Satoshi, sans-serif",
                  padding: "10px 30px",
                  paddingRight: "30px",
                  cursor: "pointer",
                  maxWidth: "600px",
                  marginTop: "30px",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.paddingRight = "calc(30px + 17px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.paddingRight = "30px";
                }}
              >
                <ButtonArrowHomepage />
                <p className="transition-transform duration-300 ease-in-out group-hover:translate-x-[11px] m-0">{displayItems[2].button.title}</p>
              </Link>
            </div>
            <div className="order-1 md:order-2 w-full max-w-[360px] flex-shrink-0 flex items-center justify-center" style={{ aspectRatio: "1/1" }}>
              <div className="w-full h-full bg-[#E0E7FF] rounded-lg flex items-center justify-center text-[#6B7280] relative overflow-hidden" style={{ aspectRatio: "1/1" }}>
                {displayItems[2].image ? <Image src={displayItems[2].image} alt={displayItems[2].title} fill className="object-cover" sizes="(max-width: 768px) 100vw, 360px" /> : <span>Connector Image</span>}
              </div>
            </div>
          </div>

          {/* Card 4 - NOT sticky */}
          <div
            ref={card4Ref}
            className="p-4 sm:p-6 lg:p-8 xl:p-[30px_50px] flex flex-col md:flex-row gap-0 md:gap-10"
            style={{
              minHeight: CARD_HEIGHT,
              height: "auto",
              background: "#F1F6FF",
              borderRadius: 10,
              position: "relative",
              zIndex: 4,
            }}
          >
            <div className="order-2 md:order-1" style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontSize: 16, color: "#457B9D", marginBottom: 0 }}>04/04</div>
                <h3 className="text-3xl sm:text-4xl lg:text-5xl" style={{ fontSize: "46px", marginTop: "10px", marginBottom: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{displayItems[3].title}</h3>
              </div>
              <p
                className="mt-0 md:mt-[92px]"
                style={{
                  fontFamily: "Satoshi, sans-serif",
                  color: "#000",
                  fontSize: "18px",
                  fontStyle: "normal",
                  fontWeight: 400,
                  lineHeight: "28px",
                  width: "565px",
                  maxWidth: "100%",
                  marginBottom: 0,
                }}
              >
                {displayItems[3].description}
              </p>
              <Link
                href={displayItems[3].button.url}
                className="btn group relative inline-flex items-center justify-center rounded-[10px] border-1 border-[#2958A4] bg-transparent text-[#2958A4] text-[14px] sm:text-[16px] font-medium transition-all duration-300 ease-in-out hover:bg-[#2958A4] hover:text-white hover:border-[#2958A4] w-full"
                style={{
                  fontFamily: "Satoshi, sans-serif",
                  padding: "10px 30px",
                  paddingRight: "30px",
                  cursor: "pointer",
                  maxWidth: "600px",
                  marginTop: "30px",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.paddingRight = "calc(30px + 17px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.paddingRight = "30px";
                }}
              >
                <ButtonArrowHomepage />
                <p className="transition-transform duration-300 ease-in-out group-hover:translate-x-[11px] m-0">{displayItems[3].button.title}</p>
              </Link>
            </div>
            <div className="order-1 md:order-2 w-full max-w-[360px] flex-shrink-0 flex items-center justify-center" style={{ aspectRatio: "1/1" }}>
              <div className="w-full h-full bg-[#E0E7FF] rounded-lg flex items-center justify-center text-[#6B7280] relative overflow-hidden" style={{ aspectRatio: "1/1" }}>
                {displayItems[3].image ? <Image src={displayItems[3].image} alt={displayItems[3].title} fill className="object-cover" sizes="(max-width: 768px) 100vw, 360px" /> : <span>Manufacturing Image</span>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
