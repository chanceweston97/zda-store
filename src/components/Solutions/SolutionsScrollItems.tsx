"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const SOLUTIONS_CARD_ID_PREFIX = "solutions-card";

const HEADER_OFFSET = 80;
const NUMBER_HEIGHT = 16;
const NUMBER_MARGIN = 36;
const CARD_HEIGHT = 360;
const STAGGER_DESKTOP = NUMBER_HEIGHT + NUMBER_MARGIN; // 52px - header overlap when stacked
const STAGGER_MOBILE = 24; // smaller overlap on mobile

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

  const itemCount = SOLUTIONS_ITEMS.length;

  // Run ScrollTrigger setup after refs from .map() are attached (Company uses fixed refs so refs are ready immediately)
  const [refsReady, setRefsReady] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setRefsReady(true));
    return () => cancelAnimationFrame(id);
  }, []);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const handler = () => setIsMobile(mq.matches);
    handler();
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  const stagger = isMobile ? STAGGER_MOBILE : STAGGER_DESKTOP;
  const lastCardPinTop = HEADER_OFFSET + (itemCount - 1) * stagger;

  // Scroll to card when landing page links with hash (e.g. /solutions#solutions-card-0)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const hash = window.location.hash?.slice(1);
    if (!hash || !hash.startsWith(SOLUTIONS_CARD_ID_PREFIX)) return;
    const timer = setTimeout(() => {
      const el = document.getElementById(hash);
      if (el) {
        const y = el.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET;
        window.scrollTo({ top: Math.max(0, y), behavior: "smooth" });
      }
    }, 400);
    return () => clearTimeout(timer);
  }, []);

  // Same effect as Company: kill all, create pins for dots + cards 1 to N-1, last card just tracks index
  useEffect(() => {
    if (!refsReady) return;
    ScrollTrigger.getAll().forEach((t) => t.kill());

    const cards = cardRefs.current.filter(Boolean) as HTMLDivElement[];
    if (!containerRef.current || !dotsRef.current || cards.length !== itemCount) return;

    // Pin dots with first card (same as Company)
    ScrollTrigger.create({
      trigger: cards[0],
      start: `top ${HEADER_OFFSET}px`,
      endTrigger: cards[itemCount - 1],
      end: `top ${lastCardPinTop}px`,
      pin: dotsRef.current,
      pinSpacing: false,
    });

    // Cards 1 to N-1: sticky pin (same as Company)
    for (let i = 0; i < itemCount - 1; i++) {
      const cardPinTop = HEADER_OFFSET + i * stagger;
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

    // Last card: NOT sticky, just tracks active index (same as Company card 3)
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
  }, [refsReady, itemCount, lastCardPinTop, stagger]);

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
            .solutions-card-sticky-gap { margin-bottom: 280px; }
            .solutions-last-card-gap { margin-bottom: 0; }
            .solutions-container-bottom { padding-bottom: 0; }
            @media (max-width: 767px) {
              .solutions-card-title { font-size: 16px !important; line-height: 1.2 !important; letter-spacing: -0.15px !important; }
              .solutions-card-desc { font-size: 14px !important; line-height: 1.35 !important; letter-spacing: -0.05px !important; }
              .solutions-card-sticky-gap { margin-bottom: 220px; }
            }
          `,
        }}
      />
    <div
      className="mx-auto max-w-[1340px] px-4 sm:px-6 xl:px-0 py-12 sm:py-16 md:py-12"
      style={{ paddingBottom: "max(3rem, env(safe-area-inset-bottom, 0px) + 2rem)" }}
    >
      <div className="flex flex-col md:flex-row gap-6 md:gap-12 xl:gap-[50px] items-start">
        {/* Dots - Hidden on mobile (same as Company) */}
        <div
          ref={dotsRef}
          className="hidden md:flex"
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

        {/* Cards - same structure as Company; extra bottom padding so card content is not cut off by toolbar/URL bar */}
        <div
          ref={containerRef}
          className="w-full md:flex-1 solutions-container-bottom"
        >
          {SOLUTIONS_ITEMS.map((item, index) => (
            <div
              key={index}
              id={`${SOLUTIONS_CARD_ID_PREFIX}-${index}`}
              ref={(el) => {
                cardRefs.current[index] = el;
              }}
              className={`flex flex-col md:flex-row ${index < itemCount - 1 ? "solutions-card-sticky-gap" : "solutions-last-card-gap"}`}
              style={{
                minHeight: CARD_HEIGHT,
                height: "auto",
                transition: "box-shadow 0.3s",
                overflow: "hidden",
                position: "relative",
                ...(index < itemCount - 1
                  ? {}
                  : { zIndex: itemCount }),
              }}
            >
              {/* Left Image Section - condensed on mobile only */}
              <div
                className="w-full md:w-[40%] md:shrink-0"
                style={{ display: "flex", alignItems: "stretch" }}
              >
                <div
                  className="h-[160px] md:h-full md:min-h-[300px]"
                  style={{
                    width: "100%",
                    position: "relative",
                    overflow: "hidden",
                    borderRadius: "10px",
                  }}
                >
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    className="object-cover"
                    style={{ borderRadius: "10px" }}
                    sizes="(max-width: 768px) 100vw, 40vw"
                  />
                </div>
              </div>
              {/* Right Content Section */}
              <div
                className="w-full md:w-[60%] md:shrink-0 md:min-h-0"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "flex-start",
                  padding: "clamp(20px, 4vw, 44px)",
                  background: "#FFF",
                  overflow: "visible",
                }}
              >
                <div
                  style={{
                    color: "#457B9D",
                    fontFamily: "Satoshi, sans-serif",
                    fontSize: "clamp(13px, 1.8vw, 15px)",
                    fontStyle: "normal",
                    fontWeight: 400,
                    lineHeight: "1.3",
                    letterSpacing: "-0.12px",
                    marginBottom: "10px",
                  }}
                >
                  {item.label}
                </div>
                <h3
                  className="solutions-card-title"
                  style={{
                    color: "#000",
                    fontFamily: "Satoshi, sans-serif",
                    fontSize: "clamp(26px, 4.2vw, 40px)",
                    fontStyle: "normal",
                    fontWeight: 400,
                    lineHeight: "1.18",
                    letterSpacing: "-0.4px",
                    margin: 0,
                    marginBottom: "14px",
                  }}
                >
                  {item.title}
                </h3>
                <p
                  className="solutions-card-desc whitespace-pre-line"
                  style={{
                    color: "#383838",
                    fontFamily: "Satoshi, sans-serif",
                    fontSize: "clamp(14px, 1.8vw, 16px)",
                    fontStyle: "normal",
                    fontWeight: 400,
                    lineHeight: "clamp(22px, 2.6vw, 26px)",
                    letterSpacing: "-0.1px",
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
    </>
  );
}
