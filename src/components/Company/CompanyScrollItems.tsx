"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ButtonArrowHomepage } from "@/components/Common/ButtonArrowHomepage";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const HEADER_OFFSET = 80;
const NUMBER_HEIGHT = 20;
const NUMBER_MARGIN = 50;
const CARD_HEIGHT = 450;
const GAP = 50;

const items = [
  {
    number: "01/03",
    title: "RF Connectivity Solutions",
    label: "Our Focus",
    description: "We focus on the RF path, delivering engineered antennas, cabling, and RF components that support reliable connectivity, signal integrity, and long-term system performance. Our solutions are designed to simplify deployment and help ensure wireless links remain stable in real-world environments.",
    image: "/images/company/cable.png",
    link: "/categories/antennas",
    linkText: "Explore Antennas"
  },
  {
    number: "02/03",
    title: "A Proven Track Record",
    label: "Founded in 2008",
    description: "Since 2008, ZDA Communications has focused on designing and supplying dependable RF connectivity solutions for real-world wireless systems. Built on practical engineering experience, our antennas, cabling, and RF components are developed to address performance challenges in demanding industrial, public safety, and infrastructure environments. With a long history of supporting critical deployments, we continue to refine and expand our RF product portfolio to meet evolving connectivity requirements.",
    image: "/images/company/antenna.png",
    link: "/categories/cables",
    linkText: "Explore Cables"
  },
  {
    number: "03/03",
    title: "Built-to-spec Manufacturing",
    label: "Reliable Results",
    description: "We believe our RF-focused approach and U.S.-based assembly position us to deliver dependable, build-to-spec connectivity solutions that address performance, reliability, and end-to-end signal integrity requirements. Our technically driven team brings deep industry experience supporting government, infrastructure, and mission-critical wireless deployments.",
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
  const dotsRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    ScrollTrigger.getAll().forEach(t => t.kill());

    if (!containerRef.current || !card1Ref.current || !card2Ref.current || !card3Ref.current) return;

    // Calculate pin positions
    const card1PinTop = HEADER_OFFSET;
    const card2PinTop = HEADER_OFFSET + NUMBER_HEIGHT + NUMBER_MARGIN;
    const card3PinTop = HEADER_OFFSET + 2 * (NUMBER_HEIGHT + NUMBER_MARGIN);

    // Pin dots with first card
    ScrollTrigger.create({
      trigger: card1Ref.current,
      start: `top ${card1PinTop}px`,
      endTrigger: card3Ref.current,
      end: `top ${card3PinTop}px`,
      pin: dotsRef.current,
      pinSpacing: false,
    });

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

    // Card 3: NOT sticky, just tracks active index when it reaches
    ScrollTrigger.create({
      trigger: card3Ref.current,
      start: `top ${card3PinTop}px`,
      onEnter: () => setActiveIndex(2),
      onEnterBack: () => setActiveIndex(2),
    });

    ScrollTrigger.refresh();

    return () => {
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, []);

  return (
    <div className="mx-auto max-w-[1340px] px-4 sm:px-6 xl:px-0 py-12 sm:py-16 md:py-12">
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
            marginTop: `${CARD_HEIGHT * 2 / 3}px`,
          }}
        >
          {items.map((_, index) => (
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

        {/* Cards */}
        <div ref={containerRef} className="w-full md:flex-1">
          {/* Card 1 */}
          <div
            ref={card1Ref}
            className="flex flex-col md:flex-row"
            style={{
              minHeight: CARD_HEIGHT,
              height: 'auto',
              transition: "box-shadow 0.3s",
              overflow: "hidden",
              position: "relative",
              marginBottom: '400px',
            }}
          >
            {/* Left Image Section */}
            <div className="w-full md:w-[40%] md:shrink-0" style={{ display: "flex", alignItems: "stretch" }}>
              <div style={{ width: "100%", height: "100%", minHeight: "300px", position: "relative", overflow: "hidden", borderRadius: "10px" }}>
                <Image
                  src={items[0].image}
                  alt={items[0].title}
                  fill
                  className="object-cover"
                  style={{ borderRadius: "10px" }}
                />
              </div>
            </div>
            {/* Right Content Section */}
            <div className="w-full md:w-[60%] md:shrink-0" style={{ 
              display: "flex", 
              flexDirection: "column", 
              justifyContent: "center",
              padding: 'clamp(30px, 5vw, 60px)',
              background: '#FFF'
            }}>
              <div style={{ 
                color: '#457B9D',
                fontFamily: 'Satoshi, sans-serif',
                fontSize: 'clamp(14px, 2vw, 16px)',
                fontStyle: 'normal',
                fontWeight: 400,
                lineHeight: 'clamp(24px, 4vw, 46px)',
                letterSpacing: '-0.32px',
                marginBottom: '20px'
              }}>
                {items[0].label}
              </div>
              <h3 style={{ 
                color: '#000',
                fontFamily: 'Satoshi, sans-serif',
                fontSize: 'clamp(32px, 5vw, 48px)',
                fontStyle: 'normal',
                fontWeight: 400,
                lineHeight: 'clamp(38px, 5vw, 46px)',
                letterSpacing: '-0.96px',
                margin: 0,
                marginBottom: '30px'
              }}>
                {items[0].title}
              </h3>
              <p style={{ 
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
            className="flex flex-col md:flex-row"
            style={{
              minHeight: CARD_HEIGHT,
              height: 'auto',
              transition: "box-shadow 0.3s",
              overflow: "hidden",
              position: "relative",
              marginBottom: '400px',
            }}
          >
            {/* Left Image Section */}
            <div className="w-full md:w-[40%] md:shrink-0" style={{ display: "flex", alignItems: "stretch" }}>
              <div style={{ width: "100%", height: "100%", minHeight: "300px", position: "relative", overflow: "hidden", borderRadius: "10px" }}>
                <Image
                  src={items[1].image}
                  alt={items[1].title}
                  fill
                  className="object-cover"
                  style={{ borderRadius: "10px" }}
                />
              </div>
            </div>
            {/* Right Content Section */}
            <div className="w-full md:w-[60%] md:shrink-0" style={{ 
              display: "flex", 
              flexDirection: "column", 
              justifyContent: "center",
              padding: 'clamp(30px, 5vw, 60px)',
              background: '#FFF'
            }}>
              {items[1].label && (
                <div style={{ 
                  color: '#457B9D',
                  fontFamily: 'Satoshi, sans-serif',
                  fontSize: 'clamp(14px, 2vw, 16px)',
                  fontStyle: 'normal',
                  fontWeight: 400,
                  lineHeight: 'clamp(24px, 4vw, 46px)',
                  letterSpacing: '-0.32px',
                  marginBottom: '20px'
                }}>
                  {items[1].label}
                </div>
              )}
              <h3 style={{ 
                color: '#000',
                fontFamily: 'Satoshi, sans-serif',
                fontSize: 'clamp(32px, 5vw, 48px)',
                fontStyle: 'normal',
                fontWeight: 400,
                lineHeight: 'clamp(38px, 5vw, 46px)',
                letterSpacing: '-0.96px',
                margin: 0,
                marginBottom: '30px'
              }}>
                {items[1].title}
              </h3>
              <p style={{ 
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
            className="flex flex-col md:flex-row"
            style={{
              minHeight: CARD_HEIGHT,
              height: 'auto',
              position: "relative",
              zIndex: 3,
            }}
          >
            {/* Left Image Section */}
            <div className="w-full md:w-[40%] md:shrink-0" style={{ display: "flex", alignItems: "stretch" }}>
              <div style={{ width: "100%", height: "100%", minHeight: "300px", position: "relative", overflow: "hidden", borderRadius: "10px" }}>
                <Image
                  src={items[2].image}
                  alt={items[2].title}
                  fill
                  className="object-cover"
                  style={{ borderRadius: "10px" }}
                />
              </div>
            </div>
            {/* Right Content Section */}
            <div className="w-full md:w-[60%] md:shrink-0" style={{ 
              display: "flex", 
              flexDirection: "column", 
              justifyContent: "center",
              padding: 'clamp(30px, 5vw, 60px)',
              background: '#FFF'
            }}>
              {items[2].label && (
                <div style={{ 
                  color: '#457B9D',
                  fontFamily: 'Satoshi, sans-serif',
                  fontSize: 'clamp(14px, 2vw, 16px)',
                  fontStyle: 'normal',
                  fontWeight: 400,
                  lineHeight: 'clamp(24px, 4vw, 46px)',
                  letterSpacing: '-0.32px',
                  marginBottom: '20px'
                }}>
                  {items[2].label}
                </div>
              )}
              <h3 style={{ 
                color: '#000',
                fontFamily: 'Satoshi, sans-serif',
                fontSize: 'clamp(32px, 5vw, 48px)',
                fontStyle: 'normal',
                fontWeight: 400,
                lineHeight: 'clamp(38px, 5vw, 46px)',
                letterSpacing: '-0.96px',
                margin: 0,
                marginBottom: '30px'
              }}>
                {items[2].title}
              </h3>
              <p style={{ 
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
  );
}
