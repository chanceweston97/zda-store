"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ButtonArrowHomepage } from "@/components/Common/ButtonArrowHomepage";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const HEADER_OFFSET = 80;
const STAGGER_STEP_PX = 10; // same as Solutions: 10px between card pin positions
const NUMBER_HEIGHT = 20;
const NUMBER_MARGIN = 50;
const CARD_HEIGHT = 450;
const GAP = 50;
const STICKY_GAP_MOBILE = 220; // margin below pinned cards on mobile (match Solutions)

const items = [
  {
    number: "01/03",
    title: "Engineered RF Connectivity",
    label: "Our Focus",
    description: "ZDA Communications is a manufacturer and supplier of RF connectivity solutions supporting industrial, public safety, utility, and infrastructure-grade wireless networks. We specialize in the RF path, supplying antennas, RF coaxial cable assemblies, and RF components that enable reliable signal transmission, predictable coverage, and long-term system performance in demanding real-world environments. Our products are engineered to integrate seamlessly into professional 50-ohm systems, supporting fixed infrastructure, distributed antenna systems (DAS), land mobile radio (LMR), private LTE/5G, and telemetry networks.",
    image: "/images/company/cable.png",
    link: "/categories/antennas",
    linkText: "Explore Antennas"
  },
  {
    number: "02/03",
    title: "A Proven Track Record",
    label: "Founded in 2008",
    description: "Founded in 2008, ZDA Communications has grown by supporting real-world wireless deployments where reliability matters. Our products are deployed across industrial facilities, utilities, public safety systems, environmental monitoring networks, and infrastructure environments where consistent performance is essential. We work closely with integrators, engineers, and system designers to address RF challenges encountered in complex installations.",
    image: "/images/company/antenna.png",
    link: "/categories/cables",
    linkText: "Explore Cables"
  },
  {
    number: "03/03",
    title: "Built-to-spec with Verified Performance",
    label: "Reliable Results",
    description: "ZDA Communications maintains a manufacturing and assembly process centered on build-to-spec execution, electrical consistency, and documented quality verification. All outgoing RF products are electrically verified using Anritsu RF test instrumentation to confirm critical performance parameters such as VSWR and impedance stability. This standards-driven approach ensures repeatable RF performance, protects connected radio equipment, and supports compliance with stated specifications across both catalog and build-to-order solutions.",
    image: "/images/company/manufacture.jpg",
    link: "/contact",
    linkText: "Explore Manufacturing"
  }
];

export default function CompanyScrollItems() {
  const containerRef = useRef<HTMLDivElement>(null);
  const card1Ref = useRef<HTMLDivElement>(null);
  const card2Ref = useRef<HTMLDivElement>(null);
  const card3Ref = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    ScrollTrigger.getAll().forEach(t => t.kill());

    if (!containerRef.current || !card1Ref.current || !card2Ref.current || !card3Ref.current) return;

    // Mobile: all cards stick to header bottom (no extra top gap).
    // Desktop: slight stagger (10px step) for stacked effect.
    const pinStepPx = isMobile ? 0 : STAGGER_STEP_PX;
    const card1PinTop = HEADER_OFFSET;
    const card2PinTop = HEADER_OFFSET + pinStepPx;
    const card3PinTop = HEADER_OFFSET + 2 * pinStepPx;

    // Card 1: pins at header, unpins when card 3 reaches
    gsap.set(card1Ref.current, { zIndex: 1 });
    ScrollTrigger.create({
      trigger: card1Ref.current,
      start: `top ${card1PinTop}px`,
      endTrigger: card3Ref.current,
      end: `top ${card3PinTop}px`,
      pin: true,
      pinSpacing: false,
      anticipatePin: 1,
      onEnter: () => {
        if (!isMobile && card1Ref.current) {
          card1Ref.current.style.boxShadow = "0 20px 50px rgba(0,0,0,0.12)";
        }
      },
      onEnterBack: () => {
        if (!isMobile && card1Ref.current) {
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

    // Card 2: pins under card 1's number, unpins when card 3 reaches
    gsap.set(card2Ref.current, { zIndex: 2 });
    ScrollTrigger.create({
      trigger: card2Ref.current,
      start: `top ${card2PinTop}px`,
      endTrigger: card3Ref.current,
      end: `top ${card3PinTop}px`,
      pin: true,
      pinSpacing: false,
      anticipatePin: 1,
      onEnter: () => {
        if (!isMobile && card2Ref.current) {
          card2Ref.current.style.boxShadow = "0 20px 50px rgba(0,0,0,0.12)";
        }
      },
      onEnterBack: () => {
        if (!isMobile && card2Ref.current) {
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

    const doRefresh = () => ScrollTrigger.refresh();
    if (typeof requestIdleCallback !== "undefined") {
      requestIdleCallback(doRefresh, { timeout: 500 });
    } else {
      requestAnimationFrame(doRefresh);
    }

    return () => {
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, [isMobile]);

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
            .company-card-title-block { display: flex; flex-direction: column; gap: 10px; }
            .company-card-sticky-gap { margin-bottom: 400px; }
            .company-card-last { margin-bottom: 0 !important; }
            @media (min-width: 768px) {
              .company-card-item-mobile { padding: 0 !important; }
              .company-card-last { margin-bottom: 0 !important; }
            }
            @media (max-width: 767px) {
              .company-card-item-mobile {
                /* remove top padding only */
                padding: 0 !important;
                padding-bottom: 60px !important;
              }
              .company-card-sticky-gap { margin-bottom: 220px; }
              .company-card-last { margin-bottom: 0 !important; }
              .company-card-label {
                color: #457B9D;
                font-size: clamp(13px, 1.8vw, 15px) !important;
                font-family: Satoshi, sans-serif;
                font-weight: 400;
                line-height: 1.3 !important;
                letter-spacing: -0.12px;
                padding-top: 10px !important;
                padding-bottom: 10px !important;
              }
              .company-card-title { font-size: 16px !important; line-height: 1.2 !important; letter-spacing: -0.15px !important; }
              .company-card-desc { font-size: 14px !important; line-height: 1.35 !important; letter-spacing: -0.05px !important; }
              .company-card-image-wrap {
                width: 100% !important;
                aspect-ratio: 1 / 1;
                height: auto !important;
                min-height: 0 !important;
              }
              .company-card-content-inner { padding: 0 !important; }
            }
          `,
        }}
      />
    <div className="mx-auto w-full max-w-[1340px] px-4 sm:px-6 xl:px-0 py-12 sm:py-16 md:py-12" style={{ paddingBottom: "max(3rem, env(safe-area-inset-bottom, 0px) + 2rem)" }}>
      <div
        className="flex flex-col md:flex-row items-start"
      >
        {/* Cards */}
        <div ref={containerRef} className="w-full md:flex-1">
          {/* Card 1 */}
          <div
            ref={card1Ref}
            className="company-card-item-mobile company-card-sticky-gap flex flex-col md:flex-row bg-white"
            style={{
              minHeight: CARD_HEIGHT,
              height: 'auto',
              transition: "box-shadow 0.3s",
              overflow: "hidden",
              position: "relative",
              borderRadius: "10px",
            }}
          >
            {/* Left Image Section */}
            <div className="w-full md:w-[40%] md:shrink-0" style={{ display: "flex", alignItems: "stretch" }}>
              <div className="company-card-image-wrap" style={{ width: "100%", height: "100%", minHeight: "300px", position: "relative", overflow: "hidden", borderRadius: "10px" }}>
                <Image
                  src={items[0].image}
                  alt={items[0].title}
                  fill
                  className="object-cover"
                  style={{ borderRadius: "10px" }}
                />
              </div>
            </div>
            {/* Right Content Section - 10px gap between label and title (match Solutions) */}
            <div className="company-card-content-inner w-full md:w-[60%] md:shrink-0 md:min-h-0" style={{ 
              display: "flex", 
              flexDirection: "column", 
              justifyContent: "flex-start",
              padding: 'clamp(30px, 5vw, 60px)',
              background: '#FFF',
              overflow: 'visible'
            }}>
              <div className="company-card-title-block">
                <div className="company-card-label" style={{ 
                  color: '#457B9D',
                  fontFamily: 'Satoshi, sans-serif',
                  fontSize: 'clamp(14px, 2vw, 16px)',
                  fontStyle: 'normal',
                  fontWeight: 400,
                  lineHeight: '1.35',
                  letterSpacing: '-0.32px',
                  margin: 0
                }}>
                  {items[0].label}
                </div>
                <h3 className="company-card-title" style={{ 
                  color: '#000',
                  fontFamily: 'Satoshi, sans-serif',
                  fontSize: 'clamp(32px, 5vw, 48px)',
                  fontStyle: 'normal',
                  fontWeight: 400,
                  lineHeight: '1.2',
                  letterSpacing: '-0.96px',
                  margin: 0,
                  marginBottom: '20px'
                }}>
                  {items[0].title}
                </h3>
              </div>
              <p className="company-card-desc" style={{ 
                color: '#383838',
                fontFamily: 'Satoshi, sans-serif',
                fontSize: 'clamp(16px, 2vw, 18px)',
                fontStyle: 'normal',
                fontWeight: 400,
                lineHeight: 'clamp(24px, 3vw, 28px)',
                margin: 0
              }}>
                {items[0].description}
              </p>
            </div>
          </div>

          {/* Card 2 */}
          <div
            ref={card2Ref}
            className="company-card-item-mobile company-card-sticky-gap flex flex-col md:flex-row bg-white"
            style={{
              minHeight: CARD_HEIGHT,
              height: 'auto',
              transition: "box-shadow 0.3s",
              overflow: "hidden",
              position: "relative",
              borderRadius: "10px",
            }}
          >
            {/* Left Image Section */}
            <div className="w-full md:w-[40%] md:shrink-0" style={{ display: "flex", alignItems: "stretch" }}>
              <div className="company-card-image-wrap" style={{ width: "100%", height: "100%", minHeight: "300px", position: "relative", overflow: "hidden", borderRadius: "10px" }}>
                <Image
                  src={items[1].image}
                  alt={items[1].title}
                  fill
                  className="object-cover"
                  style={{ borderRadius: "10px" }}
                />
              </div>
            </div>
            {/* Right Content Section - 10px gap between label and title */}
            <div className="company-card-content-inner w-full md:w-[60%] md:shrink-0 md:min-h-0" style={{ 
              display: "flex", 
              flexDirection: "column", 
              justifyContent: "flex-start",
              padding: 'clamp(30px, 5vw, 60px)',
              background: '#FFF',
              overflow: 'visible'
            }}>
              <div className="company-card-title-block">
                {items[1].label && (
                  <div className="company-card-label" style={{ 
                    color: '#457B9D',
                    fontFamily: 'Satoshi, sans-serif',
                    fontSize: 'clamp(14px, 2vw, 16px)',
                    fontStyle: 'normal',
                    fontWeight: 400,
                    lineHeight: '1.35',
                    letterSpacing: '-0.32px',
                    margin: 0
                  }}>
                    {items[1].label}
                  </div>
                )}
                <h3 className="company-card-title" style={{ 
                  color: '#000',
                  fontFamily: 'Satoshi, sans-serif',
                  fontSize: 'clamp(32px, 5vw, 48px)',
                  fontStyle: 'normal',
                  fontWeight: 400,
                  lineHeight: '1.2',
                  letterSpacing: '-0.96px',
                  margin: 0,
                  marginBottom: '20px'
                }}>
                  {items[1].title}
                </h3>
              </div>
              <p className="company-card-desc" style={{ 
                color: '#383838',
                fontFamily: 'Satoshi, sans-serif',
                fontSize: 'clamp(16px, 2vw, 18px)',
                fontStyle: 'normal',
                fontWeight: 400,
                lineHeight: 'clamp(24px, 3vw, 28px)',
                margin: 0
              }}>
                {items[1].description}
              </p>
            </div>
          </div>

          {/* Card 3 - NOT sticky */}
          <div
            ref={card3Ref}
            className="company-card-item-mobile company-card-last flex flex-col md:flex-row bg-white"
            style={{
              minHeight: CARD_HEIGHT,
              height: 'auto',
              position: "relative",
              zIndex: 3,
              borderRadius: "10px",
              overflow: "hidden",
              transition: "box-shadow 0.3s",
            }}
          >
            {/* Left Image Section */}
            <div className="w-full md:w-[40%] md:shrink-0" style={{ display: "flex", alignItems: "stretch" }}>
              <div className="company-card-image-wrap" style={{ width: "100%", height: "100%", minHeight: "300px", position: "relative", overflow: "hidden", borderRadius: "10px" }}>
                <Image
                  src={items[2].image}
                  alt={items[2].title}
                  fill
                  className="object-cover"
                  style={{ borderRadius: "10px" }}
                />
              </div>
            </div>
            {/* Right Content Section - 10px gap between label and title */}
            <div className="company-card-content-inner w-full md:w-[60%] md:shrink-0 md:min-h-0" style={{ 
              display: "flex", 
              flexDirection: "column", 
              justifyContent: "flex-start",
              padding: 'clamp(30px, 5vw, 60px)',
              background: '#FFF',
              overflow: 'visible'
            }}>
              <div className="company-card-title-block">
                {items[2].label && (
                  <div className="company-card-label" style={{ 
                    color: '#457B9D',
                    fontFamily: 'Satoshi, sans-serif',
                    fontSize: 'clamp(14px, 2vw, 16px)',
                    fontStyle: 'normal',
                    fontWeight: 400,
                    lineHeight: '1.35',
                    letterSpacing: '-0.32px',
                    margin: 0
                  }}>
                    {items[2].label}
                  </div>
                )}
                <h3 className="company-card-title" style={{ 
                  color: '#000',
                  fontFamily: 'Satoshi, sans-serif',
                  fontSize: 'clamp(32px, 5vw, 48px)',
                  fontStyle: 'normal',
                  fontWeight: 400,
                  lineHeight: '1.2',
                  letterSpacing: '-0.96px',
                  margin: 0,
                  marginBottom: '20px'
                }}>
                  {items[2].title}
                </h3>
              </div>
              <p className="company-card-desc" style={{ 
                color: '#383838',
                fontFamily: 'Satoshi, sans-serif',
                fontSize: 'clamp(16px, 2vw, 18px)',
                fontStyle: 'normal',
                fontWeight: 400,
                lineHeight: 'clamp(24px, 3vw, 28px)',
                margin: 0
              }}>
                {items[2].description}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
