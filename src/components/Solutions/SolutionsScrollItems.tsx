"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const HEADER_OFFSET = 80;
const NUMBER_HEIGHT = 20;
const NUMBER_MARGIN = 50;
const CARD_HEIGHT = 470;
const IMAGE_SIZE = 470;
/** Below this width: stacked layout, no pinning, centered image. 768–1024px = same as mobile. */
const MOBILE_BREAKPOINT = 1025;

const SOLUTIONS_ITEMS = [
  {
    label: "Indoor Antenna Solutions",
    title: "In-Building Wireless and DAS",
    description:
      "ZDA Communications supports in-building wireless integrators with core ceiling and low-profile antennas, low-loss coaxial cable assemblies, and the RF components needed to build clean signal paths across multi-band coverage requirements, including 700/800 MHz through CBRS and 5G sub-6.\n\nIn venues, stadiums, and campuses performance depends on a consistent RF chain from headend equipment and remote units to every antenna endpoint across seating bowls, concourses, and suites. ZDA supplies the antennas that connect to and feed RUs, along with electrically verified, build-to-spec cabling that is cut to length and properly terminated, helping integrators standardize antenna drops, reduce rework during commissioning, and keep coverage repeatable as density and band requirements expand.",
    image: "/images/solutions/in-building.jpg",
  },
  {
    label: "VHF/UHF and 700/800 MHz",
    title: "Public Safety & ERRCS",
    description:
      "ZDA Communications supports ERRCS integrators with antennas, low-loss coaxial cable assemblies, and RF components built around the bands most commonly required for emergency responder radio coverage, including UHF 700/800 MHz and, when specified, VHF/UHF allocations.\n\nWe understand the importance of coverage reliability when lives are on the line, which is why we focus on the RF fundamentals that impact acceptance and long-term performance. ZDA supplies electrically verified coaxial cable assemblies cut to length with install-ready terminations, along with donor and in-building antenna options and RF interconnect hardware designed to maintain stable signal paths from headend to endpoint.",
    image: "/images/solutions/Public-Safety.jpg",
  },
  {
    label: "Remote Telemetry and Industrial Networks",
    title: "Utilities, SCADA & Industrial",
    description:
      "ZDA Communications supplies rugged antennas, low-loss coaxial cable assemblies, and RF components for SCADA, telemetry, and industrial networks operating across VHF, UHF, and 902–928 MHz ISM. Built for remote sites and harsh environments, our solutions help integrators maintain reliable links and repeatable installations across distributed assets.\n\nIn partnership with XetaWave, we help integrators source the complete RF link, combining proven radios with deployment-ready antennas, install-ready coax assemblies, and the interconnect hardware needed to bring sites online with clean, consistent performance.",
    image: "/images/solutions/Utilities.jpg",
  },
  {
    label: "166/433/2400 MHz Tracking Networks",
    title: "Wildlife Tracking",
    description:
      "ZDA Communications supports wildlife tracking networks with antennas used across 166 MHz, 433 MHz, and 2.4 GHz architectures, including high-gain directional antennas for tower and gateway sites and omnidirectional antennas for receiver nodes and distributed field stations.\n\nProven in the field, ZDA Communications is proud to support the Motus Wildlife Tracking System community by supplying antennas, cables, and RF components within the 166/433/2400 MHz frequency bands used in tracking infrastructure. Our hardware helps teams extend coverage, maintain reliable link performance, and keep receiver stations consistent across distributed deployments that advance wildlife research and conservation.",
    image: "/images/solutions/wildlife-tracking.jpg",
  },
  {
    label: "Private Cellular and Fixed Wireless Networks",
    title: "Private LTE/5G & Infrastructure",
    description:
      "ZDA Communications supports private wireless integrators with antennas and RF interconnect for CBRS, 4G LTE, and 5G sub-6 deployments. We supply wideband antennas, low-loss coax assemblies, and modern connector interfaces including 4.3-10, N-Type, BNC, SMA, and other terminations to keep builds consistent as sites scale.\n\n Integrators can source antennas, cabling, and interconnect from ZDA alongside SureCall booster hardware to maintain a consistent RF path and simplify deployment across enterprise facilities.",
    image: "/images/solutions/private-lte.jpg",
  },
];

export default function SolutionsScrollItems() {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const dotsRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== "undefined" && window.innerWidth < MOBILE_BREAKPOINT
  );

  const itemCount = SOLUTIONS_ITEMS.length;
  const lastCardPinTop =
    HEADER_OFFSET + (itemCount - 1) * (NUMBER_HEIGHT + NUMBER_MARGIN);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    if (!isMobile || cardRefs.current.length !== itemCount) return;
    const cards = cardRefs.current.filter(Boolean) as HTMLDivElement[];
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const index = cards.indexOf(entry.target as HTMLDivElement);
          if (index >= 0) setActiveIndex(index);
        });
      },
      { root: null, rootMargin: "-20% 0px -60% 0px", threshold: 0 }
    );
    cards.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, [isMobile, itemCount]);

  useEffect(() => {
    ScrollTrigger.getAll().forEach((t) => t.kill());

    const cards = cardRefs.current.filter(Boolean) as HTMLDivElement[];
    if (!containerRef.current || cards.length !== itemCount) return;

    const width = typeof window !== "undefined" ? window.innerWidth : 0;
    if (width < MOBILE_BREAKPOINT) {
      cards.forEach((card) => {
        if (!card) return;
        gsap.set(card, { clearProps: "all" });
        card.style.marginBottom = "";
        card.style.minHeight = "";
        card.style.boxShadow = "none";
        card.style.position = "";
        card.style.top = "";
        card.style.left = "";
        card.style.width = "";
      });
      ScrollTrigger.refresh();
      return;
    }
    if (!dotsRef.current) return;

    // Pin dots with first card (desktop only, ≥1024px)
    ScrollTrigger.create({
      trigger: cards[0],
      start: `top ${HEADER_OFFSET}px`,
      endTrigger: cards[itemCount - 1],
      end: `top ${lastCardPinTop}px`,
      pin: dotsRef.current,
      pinSpacing: false,
    });

    // Cards 1 to N-1: sticky pin (desktop only)
    for (let i = 0; i < itemCount - 1; i++) {
      const cardPinTop = HEADER_OFFSET + i * (NUMBER_HEIGHT + NUMBER_MARGIN);
      gsap.set(cards[i], { zIndex: i + 1 });
      ScrollTrigger.create({
        trigger: cards[i],
        start: `top ${cardPinTop}px`,
        endTrigger: cards[itemCount - 1],
        end: `top ${lastCardPinTop}px`,
        pin: true,
        pinSpacing: false,
        anticipatePin: 1,
        onEnter: () => {
          setActiveIndex(i);
          if (cards[i]) cards[i].style.boxShadow = "0 20px 50px rgba(0,0,0,0.12)";
        },
        onEnterBack: () => {
          setActiveIndex(i);
          if (cards[i]) cards[i].style.boxShadow = "0 20px 50px rgba(0,0,0,0.12)";
        },
        onLeave: () => {
          if (cards[i]) cards[i].style.boxShadow = "none";
        },
        onLeaveBack: () => {
          if (cards[i]) cards[i].style.boxShadow = "none";
        },
      });
    }

    gsap.set(cards[itemCount - 1], { zIndex: itemCount });
    ScrollTrigger.create({
      trigger: cards[itemCount - 1],
      start: `top ${lastCardPinTop}px`,
      onEnter: () => setActiveIndex(itemCount - 1),
      onEnterBack: () => setActiveIndex(itemCount - 1),
    });

    ScrollTrigger.refresh();

    return () => {
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, [itemCount, lastCardPinTop, isMobile]);

  return (
    <div className="mx-auto max-w-[1340px] px-4 sm:px-6 xl:px-0 py-12 sm:py-16 lg:py-12">
      <div className="flex flex-col lg:flex-row gap-6 lg:gap-12 xl:gap-[50px] items-start">
        {/* Dots - Horizontal below 1024px (no ref), column + pinned on desktop (ref for GSAP) */}
        <div
          className="flex lg:hidden flex-row justify-center gap-2 mb-4 shrink-0"
          aria-hidden
        >
          {SOLUTIONS_ITEMS.map((_, index) => (
            <div
              key={index}
              style={{
                width: activeIndex === index ? 24 : 8,
                height: 8,
                borderRadius: 4,
                background: activeIndex === index ? "#2958A4" : "#CBD5E1",
                transition: "0.3s",
              }}
            />
          ))}
        </div>
        <div
          ref={dotsRef}
          className="hidden lg:flex"
          style={{
            flexDirection: "column",
            gap: 12,
            alignSelf: "flex-start",
            marginTop: `${CARD_HEIGHT * (2 / 3)}px`,
          }}
        >
          {SOLUTIONS_ITEMS.map((_, index) => (
            <div
              key={index}
              style={{
                width: 8,
                height: activeIndex === index ? 40 : 8,
                borderRadius: 4,
                background: activeIndex === index ? "#2958A4" : "#CBD5E1",
                transition: "0.3s",
              }}
            />
          ))}
        </div>

        {/* Cards – under 1024px: flex-col + gap-14, no border, no sticky; desktop: gap-0 for pin layout */}
        <div
          ref={containerRef}
          className="w-full lg:flex-1 flex flex-col gap-14 lg:gap-0"
        >
          {SOLUTIONS_ITEMS.map((item, index) => (
            <div
              key={index}
              ref={(el) => {
                cardRefs.current[index] = el;
              }}
              className="flex flex-col lg:flex-row overflow-hidden rounded-[10px] lg:rounded-none static lg:relative"
              style={{
                minHeight: isMobile ? undefined : CARD_HEIGHT,
                height: "auto",
                transition: "box-shadow 0.3s",
                overflow: "hidden",
                marginBottom:
                  isMobile ? 0 : index < itemCount - 1 ? "400px" : 0,
              }}
            >
              {/* Left: Image – centered below 1024px, no border; fixed size on desktop */}
              <div
                className="w-full flex justify-center lg:justify-start lg:shrink-0"
                style={{
                  display: "flex",
                  alignItems: "center",
                  width: "100%",
                  maxWidth: IMAGE_SIZE,
                }}
              >
                <div
                  className="w-full max-w-[min(100%,360px)] sm:max-w-[min(100%,420px)] aspect-square lg:max-w-none lg:w-[470px] lg:min-w-[470px] lg:h-[470px] lg:min-h-[450px] lg:aspect-auto relative overflow-hidden rounded-[10px]"
                >
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    className="object-cover object-center rounded-[10px]"
                    sizes="(max-width: 1024px) 100vw, 550px"
                  />
                </div>
              </div>
              {/* Right: Content – below 1024px: label + title centered, description left */}
              <div
                className="w-full lg:flex-1 lg:shrink-0 flex flex-col justify-center"
                style={{
                  padding: "clamp(16px, 4vw, 30px)",
                  background: "#FFF",
                }}
              >
                <div className="text-center lg:text-left">
                  <div
                    style={{
                      color: "#457B9D",
                      fontFamily: "Satoshi, sans-serif",
                      fontSize: "clamp(14px, 2vw, 16px)",
                      fontStyle: "normal",
                      fontWeight: 400,
                      lineHeight: "clamp(24px, 4vw, 46px)",
                      letterSpacing: "-0.32px",
                      marginBottom: "20px",
                    }}
                  >
                    {item.label}
                  </div>
                  <h3
                    style={{
                      color: "#000",
                      fontFamily: "Satoshi, sans-serif",
                      fontSize: "clamp(32px, 5vw, 40px)",
                      fontStyle: "normal",
                      fontWeight: 400,
                      lineHeight: "clamp(38px, 5vw, 46px)",
                      letterSpacing: "-0.96px",
                      margin: 0,
                      marginBottom: "30px",
                    }}
                  >
                    {item.title}
                  </h3>
                </div>
                <p
                  className="whitespace-pre-line text-left"
                  style={{
                    width: "100%",
                    color: "#383838",
                    fontFamily: "Satoshi, sans-serif",
                    fontSize: "clamp(14px, 3.5vw, 18px)",
                    fontStyle: "normal",
                    fontWeight: 400,
                    lineHeight: "clamp(22px, 4vw, 28px)",
                    wordWrap: "break-word",
                    margin: 0,
                  }}
                >
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
