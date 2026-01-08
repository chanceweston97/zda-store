"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ButtonArrowHomepage } from "@/components/Common/ButtonArrowHomepage";

interface ScrollItem {
  id: number;
  number: string;
  title: string;
  description: string;
  buttonText: string;
  buttonLink: string;
}

const items: ScrollItem[] = [
  {
    id: 1,
    number: '01/04',
    title: 'Antennas',
    description: 'Directional and omnidirectional options engineered for reliable coverage from VHF/UHF to LTE/5G sub-6 GHz. ZDA Communications provides field ready builds with verified VSWR for clean links in real-world conditions.',
    buttonText: 'Explore Antennas',
    buttonLink: '/shop?category=antennas'
  },
  {
    id: 2,
    number: '02/04',
    title: 'Cables',
    description: 'Low-loss 50-ohm assemblies cut to length with precise terminations for minimal attenuation and maximum durability. Any length, assembled in the United States.',
    buttonText: 'Explore Cables',
    buttonLink: '/shop?category=cables'
  },
  {
    id: 3,
    number: '03/04',
    title: 'Connectors & Accessories',
    description: 'Industry-standard RF connectors, adapters, and couplers for secure, low-resistance joins across your network. Available in N, SMA, TNC, and more. For radios and signal boosters, reach out to a product expert.',
    buttonText: 'Explore Connectors',
    buttonLink: '/shop?category=connectors'
  },
  {
    id: 4,
    number: '04/04',
    title: 'Manufacturing',
    description: 'Industry-standard RF connectors, adapters, and couplers for secure, low-resistance joins across your network. Available in N, SMA, TNC, and more. For radios and signal boosters, reach out to a product expert.',
    buttonText: 'Explore Manufacturing',
    buttonLink: '/manufacturing'
  }
];

export default function HeroScrollItems() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;

      const headerHeight = 100;
      
      // Get scroll position - Lenis uses window.scrollY internally
      // But we need to get the actual scroll position
      const scrollY = window.scrollY || window.pageYOffset || document.documentElement.scrollTop;
      
      // Calculate which item should be active based on scroll position
      // Each item section is viewport height
      const itemHeight = window.innerHeight - headerHeight;
      const containerTop = containerRef.current.offsetTop;
      const scrollProgress = Math.max(0, scrollY - (containerTop - headerHeight));
      const newActiveIndex = Math.floor(scrollProgress / itemHeight);
      
      setActiveIndex(Math.min(Math.max(0, newActiveIndex), items.length - 1));
    };

    // Listen to both Lenis scroll events and window scroll
    const lenis = (window as any).lenisInstance;
    
    // Always use window scroll event as Lenis still triggers it
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial call
    
    // Also listen to Lenis scroll if available for more accurate updates
    if (lenis) {
      const lenisScrollHandler = () => {
        // Small delay to ensure scroll position is updated
        requestAnimationFrame(handleScroll);
      };
      lenis.on('scroll', lenisScrollHandler);
      
      return () => {
        window.removeEventListener('scroll', handleScroll);
        lenis.off('scroll', lenisScrollHandler);
      };
    }
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const scrollToItem = (index: number) => {
    if (!containerRef.current) return;

    const headerHeight = 100;
    const itemHeight = window.innerHeight - headerHeight;
    const containerOffsetTop = containerRef.current.offsetTop;
    const targetScroll = containerOffsetTop - headerHeight + (index * itemHeight);
    
    // Use Lenis scrollTo if available, otherwise use window.scrollTo
    const lenis = (window as any).lenisInstance;
    
    if (lenis) {
      lenis.scrollTo(targetScroll, {
        duration: 1.2,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      });
    } else {
      window.scrollTo({
        top: targetScroll,
        behavior: 'smooth'
      });
    }

    setActiveIndex(index);
  };

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        marginTop: '50px',
        marginBottom: '50px',
        position: 'relative',
        display: 'flex',
        flexDirection: 'row',
        gap: '50px',
        alignItems: 'flex-start',
        // Ensure no transforms that break sticky
        transform: 'none',
        willChange: 'auto'
      }}
    >
      {/* Pagination Dots - Sticky at Header Bottom */}
      <div
        style={{
          position: 'sticky',
          top: '100px',
          alignSelf: 'flex-start',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          paddingLeft: '50px',
          height: 'fit-content',
          zIndex: 10000,
          pointerEvents: 'auto',
          marginTop: '125px'
        }}
      >
        {items.map((item, index) => (
          <button
            key={item.id}
            onClick={() => scrollToItem(index)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.3s ease',
              width: '8px'
            }}
            aria-label={`Go to ${item.title}`}
          >
            <div
              style={{
                width: '8px',
                height: activeIndex === index ? '40px' : '8px',
                backgroundColor: activeIndex === index ? '#2958A4' : '#CBD5E1',
                borderRadius: '4px',
                transition: 'all 0.3s ease'
              }}
            />
          </button>
        ))}
      </div>
      
      {/* Cards Container */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          paddingRight: '50px'
        }}
      >
        {items.map((item, index) => (
          <div
            key={item.id}
            className="pin-spacer"
            style={{
              position: 'relative',
              width: '100%',
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'center',
              marginTop: index > 0 ? '20px' : '0' // Add gap between items
            }}
          >
            <div
              className="card featured-item"
              style={{
                position: 'sticky',
                top: '100px', // Stick at header bottom
                zIndex: items.length - index, // Higher index = higher z-index (appears on top)
                width: '1340px',
                maxWidth: '100%',
                transition: 'opacity 0.3s ease',
                opacity: 1
              }}
            >
              <div
                style={{
                  display: 'flex',
                  width: '100%',
                  height: '450px',
                  padding: '30px 50px',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  backgroundColor: '#F8F9FC',
                  borderRadius: '10px'
                }}
              >
                {/* Number Indicator */}
                <div style={{ color: '#6B7280', fontSize: '14px', fontFamily: 'Satoshi, sans-serif', fontWeight: 400 }}>
                  {item.number}
                </div>

                {/* Title */}
                <h3 style={{
                  color: '#000',
                  fontFamily: 'Satoshi, sans-serif',
                  fontSize: '48px',
                  fontWeight: 400,
                  lineHeight: '1.2',
                  margin: 0
                }}>
                  {item.title}
                </h3>

                {/* Description */}
                <p style={{
                  color: '#383838',
                  fontFamily: 'Satoshi, sans-serif',
                  fontSize: '18px',
                  fontWeight: 400,
                  lineHeight: '28px',
                  margin: 0,
                  maxWidth: '600px'
                }}>
                  {item.description}
                </p>

                {/* Button */}
                <Link
                  href={item.buttonLink}
                  className="btn filled group relative inline-flex items-center justify-center rounded-[10px] border text-[16px] font-medium transition-all duration-300 ease-in-out hover:active"
                  style={{ 
                    fontFamily: 'Satoshi, sans-serif',
                    padding: '10px 30px',
                    paddingRight: '30px',
                    cursor: 'pointer',
                    width: '600px',
                    backgroundColor: '#F8F9FC',
                    borderColor: '#2958A4',
                    borderWidth: '1px',
                    color: '#2958A4'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.paddingRight = 'calc(30px + 17px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.paddingRight = '30px';
                  }}
                >
                  <ButtonArrowHomepage />
                  <p className="transition-transform duration-300 ease-in-out group-hover:translate-x-[11px] m-0">{item.buttonText}</p>
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
