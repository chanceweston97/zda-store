"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ButtonArrowHomepage } from "@/components/Common/ButtonArrowHomepage";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const HEADER_OFFSET = 80;
const NUMBER_HEIGHT = 20; // Approximate height of number section (14px font + line height)
const NUMBER_MARGIN = 50; // Margin below number
const CARD_HEIGHT = 450;
const GAP = 50;

export default function HeroScrollItems() {
  const containerRef = useRef<HTMLDivElement>(null);
  const card1Ref = useRef<HTMLDivElement>(null);
  const card2Ref = useRef<HTMLDivElement>(null);
  const card3Ref = useRef<HTMLDivElement>(null);
  const card4Ref = useRef<HTMLDivElement>(null);
  const dotsRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

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
            className="p-4 sm:p-6 lg:p-8 xl:p-[30px_50px] flex flex-col md:flex-row gap-5 md:gap-10"
            style={{
              minHeight: CARD_HEIGHT,
              height: 'auto',
              background: "#F1F6FF",
              borderRadius: 10,
              transition: "box-shadow 0.3s",
              overflow: "hidden",
              position: "relative",
              marginBottom: '400px',
            }}
          >
            {/* Left Content Section */}
            <div style={{ flex: 1 }}>
              <div>
                <div style={{ fontSize: 16, color: "#457B9D", marginBottom: 0 }}>01/04</div>
                <h3 className="text-3xl sm:text-4xl lg:text-5xl" style={{ fontSize: 'clamp(32px, 5vw, 48px)', marginTop: '10px', marginBottom: 0 }}>Antennas</h3>
              </div>
              <p style={{ 
                maxWidth: '100%', 
                width: '100%',
                color: '#000',
                fontFamily: 'Satoshi',
                fontSize: '18px',
                fontStyle: 'normal',
                fontWeight: 400,
                lineHeight: '28px',
                margin: 0,
                marginTop: '100px'
              }}>
                Directional and omnidirectional options engineered for reliable coverage from VHF/UHF to LTE/5G sub-6 GHz. ZDA Communications provides field ready builds with verified VSWR for clean links in real-world conditions.
              </p>
              <Link
                href="/shop?category=antennas"
                className="btn filled group relative inline-flex items-center justify-center rounded-[10px] border text-[14px] sm:text-[16px] font-medium transition-all duration-300 ease-in-out w-full sm:w-auto"
                style={{
                  fontFamily: 'Satoshi, sans-serif',
                  padding: '10px 20px',
                  paddingRight: '20px',
                  cursor: 'pointer',
                  maxWidth: '600px',
                  borderColor: '#2958A4',
                  borderWidth: '1px',
                  backgroundColor: 'transparent',
                  color: '#2958A4',
                  textDecoration: 'none',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '10px',
                  marginTop: '30px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.paddingRight = 'calc(20px + 11px)';
                  e.currentTarget.style.backgroundColor = '#2958A4';
                  e.currentTarget.style.color = '#FFFFFF';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.paddingRight = '20px';
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = '#2958A4';
                }}
              >
                <ButtonArrowHomepage />
                <span className="transition-transform duration-300 ease-in-out group-hover:translate-x-[11px]">Explore Antennas</span>
              </Link>
            </div>
            {/* Right Image Section */}
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ width: "100%", height: "100%", minHeight: "300px", background: "#E0E7FF", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", color: "#6B7280" }}>
                <span>Antenna Image</span>
              </div>
            </div>
          </div>

          {/* Card 2 */}
          <div
            ref={card2Ref}
            className="p-4 sm:p-6 lg:p-8 xl:p-[30px_50px] flex flex-col md:flex-row gap-5 md:gap-10"
            style={{
              minHeight: CARD_HEIGHT,
              height: 'auto',
              background: "#F1F6FF",
              borderRadius: 10,
              transition: "box-shadow 0.3s",
              overflow: "hidden",
              position: "relative",
              marginBottom: '400px',
            }}
          >
            {/* Left Content Section */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontSize: 16, color: "#457B9D", marginBottom: 0 }}>02/04</div>
                <h3 className="text-3xl sm:text-4xl lg:text-5xl" style={{ fontSize: 'clamp(32px, 5vw, 48px)', marginTop: '10px', marginBottom: 0 }}>Cables</h3>
              </div>
              <p style={{ 
                maxWidth: '100%', 
                width: '100%',
                color: '#000',
                fontFamily: 'Satoshi',
                fontSize: '18px',
                fontStyle: 'normal',
                fontWeight: 400,
                lineHeight: '28px',
                margin: 0,
                marginTop: '100px'
              }}>
                Low-loss 50-ohm assemblies cut to length with precise terminations for minimal attenuation and maximum durability. Any length, assembled in the United States.
              </p>
              <Link
                href="/shop?category=cables"
                className="btn filled group relative inline-flex items-center justify-center rounded-[10px] border text-[14px] sm:text-[16px] font-medium transition-all duration-300 ease-in-out w-full sm:w-auto"
                style={{
                  fontFamily: 'Satoshi, sans-serif',
                  padding: '10px 20px',
                  paddingRight: '20px',
                  cursor: 'pointer',
                  maxWidth: '600px',
                  borderColor: '#2958A4',
                  borderWidth: '1px',
                  backgroundColor: 'transparent',
                  color: '#2958A4',
                  textDecoration: 'none',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '10px',
                  marginTop: '30px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.paddingRight = 'calc(20px + 11px)';
                  e.currentTarget.style.backgroundColor = '#2958A4';
                  e.currentTarget.style.color = '#FFFFFF';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.paddingRight = '20px';
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = '#2958A4';
                }}
              >
                <ButtonArrowHomepage />
                <span className="transition-transform duration-300 ease-in-out group-hover:translate-x-[11px]">Explore Cables</span>
              </Link>
            </div>
            {/* Right Image Section */}
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ width: "100%", height: "100%", minHeight: "300px", background: "#E0E7FF", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", color: "#6B7280" }}>
                <span>Cable Image</span>
              </div>
            </div>
          </div>

          {/* Card 3 */}
          <div
            ref={card3Ref}
            className="p-4 sm:p-6 lg:p-8 xl:p-[30px_50px] flex flex-col md:flex-row gap-5 md:gap-10"
            style={{
              minHeight: CARD_HEIGHT,
              height: 'auto',
              background: "#F1F6FF",
              borderRadius: 10,
              transition: "box-shadow 0.3s",
              overflow: "hidden",
              position: "relative",
              marginBottom: '400px',
            }}
          >
            {/* Left Content Section */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontSize: 16, color: "#457B9D", marginBottom: 0 }}>03/04</div>
                <h3 className="text-3xl sm:text-4xl lg:text-5xl" style={{ fontSize: 'clamp(32px, 5vw, 48px)', marginTop: '10px', marginBottom: 0 }}>Connectors & Accessories</h3>
              </div>
              <p style={{ 
                maxWidth: '100%', 
                width: '100%',
                color: '#000',
                fontFamily: 'Satoshi',
                fontSize: '18px',
                fontStyle: 'normal',
                fontWeight: 400,
                lineHeight: '28px',
                margin: 0,
                marginTop: '100px'
              }}>
                Industry-standard RF connectors, adapters, and couplers for secure, low-resistance joins across your network. Available in N, SMA, TNC, and more.<br></br><br></br> For radios and signal boosters, reach out to a product expert.
              </p>
              <Link
                href="/shop?category=connectors"
                className="btn filled group relative inline-flex items-center justify-center rounded-[10px] border text-[14px] sm:text-[16px] font-medium transition-all duration-300 ease-in-out w-full sm:w-auto"
                style={{
                  fontFamily: 'Satoshi, sans-serif',
                  padding: '10px 20px',
                  paddingRight: '20px',
                  cursor: 'pointer',
                  maxWidth: '600px',
                  borderColor: '#2958A4',
                  borderWidth: '1px',
                  backgroundColor: 'transparent',
                  color: '#2958A4',
                  textDecoration: 'none',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '10px',
                  marginTop: '30px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.paddingRight = 'calc(20px + 11px)';
                  e.currentTarget.style.backgroundColor = '#2958A4';
                  e.currentTarget.style.color = '#FFFFFF';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.paddingRight = '20px';
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = '#2958A4';
                }}
              >
                <ButtonArrowHomepage />
                <span className="transition-transform duration-300 ease-in-out group-hover:translate-x-[11px]">Explore Connectors</span>
              </Link>
            </div>
            {/* Right Image Section */}
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ width: "100%", height: "100%", minHeight: "300px", background: "#E0E7FF", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", color: "#6B7280" }}>
                <span>Connector Image</span>
              </div>
            </div>
          </div>

          {/* Card 4 - NOT sticky */}
          <div
            ref={card4Ref}
            className="p-4 sm:p-6 lg:p-8 xl:p-[30px_50px] flex flex-col md:flex-row gap-5 md:gap-10"
            style={{
              minHeight: CARD_HEIGHT,
              height: 'auto',
              background: "#F1F6FF",
              borderRadius: 10,
              position: "relative",
              zIndex: 4, // Highest z-index so it's always visible
            }}
          >
            {/* Left Content Section */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontSize: 16, color: "#457B9D", marginBottom: 0 }}>04/04</div>
                <h3 className="text-3xl sm:text-4xl lg:text-5xl" style={{ fontSize: 'clamp(32px, 5vw, 48px)', marginTop: '10px', marginBottom: 0 }}>Manufacturing</h3>
              </div>
              <p style={{ 
                maxWidth: '100%', 
                width: '100%',
                color: '#000',
                fontFamily: 'Satoshi',
                fontSize: '18px',
                fontStyle: 'normal',
                fontWeight: 400,
                lineHeight: '28px',
                margin: 0,
                marginTop: '100px'
              }}>
                Industry-standard RF connectors, adapters, and couplers for secure, low-resistance joins across your network. Available in N, SMA, TNC, and more. For radios and signal boosters, reach out to a product expert.
              </p>
              <Link
                href="/contact"
                className="btn filled group relative inline-flex items-center justify-center rounded-[10px] border text-[14px] sm:text-[16px] font-medium transition-all duration-300 ease-in-out w-full sm:w-auto"
                style={{
                  fontFamily: 'Satoshi, sans-serif',
                  padding: '10px 20px',
                  paddingRight: '20px',
                  cursor: 'pointer',
                  maxWidth: '600px',
                  borderColor: '#2958A4',
                  borderWidth: '1px',
                  backgroundColor: 'transparent',
                  color: '#2958A4',
                  textDecoration: 'none',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '10px',
                  marginTop: '30px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.paddingRight = 'calc(20px + 11px)';
                  e.currentTarget.style.backgroundColor = '#2958A4';
                  e.currentTarget.style.color = '#FFFFFF';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.paddingRight = '20px';
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = '#2958A4';
                }}
              >
                <ButtonArrowHomepage />
                <span className="transition-transform duration-300 ease-in-out group-hover:translate-x-[11px]">Explore Manufacturing</span>
              </Link>
            </div>
            {/* Right Image Section */}
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ width: "100%", height: "100%", minHeight: "300px", background: "#E0E7FF", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", color: "#6B7280" }}>
                <span>Manufacturing Image</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
