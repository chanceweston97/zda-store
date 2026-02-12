"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const SOLUTIONS_CARD_ID_PREFIX = "solutions-card";

const HEADER_OFFSET = 80; // 1st item header top = menu header bottom line
const STAGGER_STEP_PX = 10; // 2nd +10px, 3rd +20px, 4th +30px, 5th +40px from header bottom
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
  // Mobile: all cards stick to header bottom (no extra top gap).
  // Desktop: slight stagger (10px step) for stacked effect.
  const pinStepPx = isMobile ? 0 : STAGGER_STEP_PX;
  const lastCardPinTop = HEADER_OFFSET + (itemCount - 1) * pinStepPx;

  // Scroll to card when landing page links with hash (e.g. /solutions#solutions-card-0)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const hash = window.location.hash?.slice(1);
    if (!hash || !hash.startsWith(SOLUTIONS_CARD_ID_PREFIX)) return;
    const scrollToCard = () => {
      const el = document.getElementById(hash);
      if (el) {
        const index = parseInt(hash.replace(SOLUTIONS_CARD_ID_PREFIX + "-", ""), 10);
        const isMobileNow = window.matchMedia("(max-width: 767px)").matches;
        const scrollOffset = HEADER_OFFSET + (isMobileNow ? 0 : index * STAGGER_STEP_PX);
        const run = () => {
          ScrollTrigger.refresh();
          requestAnimationFrame(() => {
            const y = el.getBoundingClientRect().top + window.scrollY - scrollOffset;
            window.scrollTo({ top: Math.max(0, y), behavior: "smooth" });
          });
        };
        if (typeof requestIdleCallback !== "undefined") {
          requestIdleCallback(run, { timeout: 800 });
        } else {
          requestAnimationFrame(run);
        }
      }
    };
    // Wait for layout/ScrollTrigger to be ready
    const timer = setTimeout(scrollToCard, 600);
    return () => clearTimeout(timer);
  }, []);

  // Same effect as Company: kill all, create pins for dots + cards 1 to N-1, last card just tracks index
  useEffect(() => {
    if (!refsReady) return;
    ScrollTrigger.getAll().forEach((t) => t.kill());

    const cards = cardRefs.current.filter(Boolean) as HTMLDivElement[];
    if (!containerRef.current || cards.length !== itemCount) return;

    // Cards 1 to N-1: sticky pin — mobile all at header bottom; desktop staggered
    for (let i = 0; i < itemCount - 1; i++) {
      const cardPinTop = HEADER_OFFSET + i * pinStepPx;
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
          if (!isMobile && cards[i]) cards[i].style.boxShadow = "0 20px 50px rgba(0,0,0,0.12)";
        },
        onEnterBack: () => {
          if (!isMobile && cards[i]) cards[i].style.boxShadow = "0 20px 50px rgba(0,0,0,0.12)";
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
    });

    const doRefresh = () => ScrollTrigger.refresh();
    if (typeof requestIdleCallback !== "undefined") {
      requestIdleCallback(doRefresh, { timeout: 500 });
    } else {
      requestAnimationFrame(doRefresh);
    }

    return () => {
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, [refsReady, itemCount, lastCardPinTop, stagger, isMobile]);

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
            .solutions-card-sticky-gap { margin-bottom: 280px; }
            .solutions-container-bottom { padding-bottom: 0; }
            @media (min-width: 768px) {
              .solutions-card-label {
                color: #457B9D;
                font-size: 16px;
                font-family: Satoshi, sans-serif;
                font-weight: 400;
                line-height: 20px;
                word-wrap: break-word;
              }
              .solutions-card-title {
                color: black;
                font-size: 40px;
                font-family: Satoshi, sans-serif;
                font-weight: 400;
                line-height: 46px;
                word-wrap: break-word;
              }
              .solutions-card-desc {
                color: #383838;
                font-size: 18px;
                font-family: Satoshi, sans-serif;
                font-weight: 400;
                line-height: 28px;
                word-wrap: break-word;
                padding-right: 2.5rem;
              }
              .solutions-card-content { gap: 50px; }
              .solutions-card-title-block { flex-direction: column; gap: 10px; }
              .solutions-card-desc-scroll {
                max-height: min(400px, calc(100vh - 280px));
                overflow-y: auto;
                overflow-x: hidden;
              }
            }
            @media (min-width: 768px) {
              .solutions-card-item-mobile { padding: 0 !important; }
              .solutions-card-last { margin-bottom: 0 !important; }
            }
            @media (max-width: 767px) {
              .solutions-card-item-mobile {
                /* remove top padding only */
                padding: 0 10px 60px 10px !important;
              }
              .solutions-card-sticky-gap { margin-bottom: 220px; }
              .solutions-card-last { margin-bottom: 0 !important; }
              .solutions-card-label {
                color: #457B9D;
                font-size: clamp(13px, 1.8vw, 15px) !important;
                font-family: Satoshi, sans-serif;
                font-weight: 400;
                line-height: 1.3 !important;
                letter-spacing: -0.12px;
                padding-top: 10px !important;
                padding-bottom: 10px !important;
              }
              .solutions-card-title { font-size: 16px !important; line-height: 1.2 !important; letter-spacing: -0.15px !important; }
              .solutions-card-desc { font-size: 14px !important; line-height: 1.35 !important; letter-spacing: -0.05px !important; }
              .solutions-card-image-wrap {
                width: 100% !important;
                aspect-ratio: 1 / 1;
                height: auto !important;
                min-height: 0 !important;
              }
            }
                      `,
        }}
      />
    <div
      className="mx-auto w-full max-w-[1340px] py-12 sm:py-16 md:py-12"
      style={{ paddingBottom: "max(3rem, env(safe-area-inset-bottom, 0px) + 2rem)" }}
    >
      <div className="flex flex-col md:flex-row items-start">
        {/* Cards */}
        <div
          ref={containerRef}
          className="w-full md:flex-1 solutions-container-bottom solutions-cards-container"
        >
          {SOLUTIONS_ITEMS.map((item, index) => (
            <div
              key={index}
              id={`${SOLUTIONS_CARD_ID_PREFIX}-${index}`}
              ref={(el) => {
                cardRefs.current[index] = el;
              }}
              className={`solutions-card-item flex flex-col md:flex-row md:justify-between md:items-center md:gap-5 bg-white solutions-card-item-mobile solutions-card-sticky-gap ${index === itemCount - 1 ? "solutions-card-last" : ""}`}
              style={{
                minHeight: CARD_HEIGHT,
                height: "auto",
                transition: "box-shadow 0.3s",
                overflow: "hidden",
                position: "relative",
                borderRadius: "10px",
                ...(index === itemCount - 1 ? { zIndex: itemCount } : {}),
              }}
            >
              {/* Left Image Section - condensed on mobile only */}
              <div
                className="w-full md:w-[550px] md:shrink-0"
                style={{ display: "flex", alignItems: "center", justifyContent: "center" }}
              >
<div
                className="solutions-card-image-wrap h-[160px] md:h-[550px] md:w-[550px] md:shrink-0"
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
                    className="object-cover object-center"
                    style={{ borderRadius: "10px" }}
                    sizes="(max-width: 768px) 100vw, 550px"
                  />
                </div>
              </div>
              {/* Right Content Section - scrollable when content is long (e.g. Wildlife Tracking) */}
              <div
                className="w-full md:w-[750px] md:shrink-0 md:min-h-0 solutions-card-content flex flex-col gap-2 sm:gap-6"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "flex-start",
                  background: "#FFF",
                  overflow: "visible",
                  minHeight: 0,
                  flex: "1 1 auto",
                }}
              >
                <div className="solutions-card-title-block flex flex-col sm:gap-2.5 md:gap-[10px]">
                  <div className="solutions-card-label">
                    {item.label}
                  </div>
                  <h3 className="solutions-card-title" style={{ margin: 0 }}>
                    {item.title}
                  </h3>
                </div>
                <div className="solutions-card-desc-scroll md:flex-1 md:min-h-0">
                  <p className="solutions-card-desc whitespace-pre-line" style={{ margin: 0 }}>
                    {item.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
    </>
  );
}
