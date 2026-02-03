"use client";

import { useScrollAnimation } from "@/hooks/useScrollAnimation";

export default function SolutionsIntro() {
  const titleRef = useScrollAnimation({ threshold: 0.2 });
  const textRef = useScrollAnimation({ threshold: 0.2 });

  return (
    <section 
      className="w-full bg-white"
      style={{
        paddingTop: '50px',
        paddingBottom: '50px',
      }}
    >
      <div 
        className="mx-auto"
        style={{
          width: '100%',
          maxWidth: '1340px',
        }}
      >
        {/* Heading */}
        <h2 
          ref={titleRef.ref}
          className={`transition-all duration-1000 ease-out ${
            titleRef.isVisible 
              ? 'opacity-100 translate-y-0' 
              : 'opacity-0 translate-y-8'
          }`}
          style={{
            fontFamily: 'Satoshi, sans-serif',
            fontSize: 'clamp(32px, 5vw, 50px)',
            fontStyle: 'normal',
            fontWeight: 400,
            lineHeight: 'clamp(40px, 6vw, 60px)',
            letterSpacing: '-2px',
            margin: 0,
            marginBottom: '20px',
            width: '100%',
            maxWidth: '693px'
          }}
        >
          <span style={{ color: '#000' }}>
          RF connectivity solutions <br />
          </span>
          <span style={{ color: '#2958A4' }}>
          for any network
          </span>
        </h2>

        {/* Paragraph */}
        <p 
          ref={textRef.ref}
          className={`transition-all duration-1000 ease-out delay-300 ${
            textRef.isVisible 
              ? 'opacity-100 translate-y-0' 
              : 'opacity-0 translate-y-8'
          }`}
          style={{
            color: '#000',
            fontFamily: 'Satoshi, sans-serif',
            fontSize: 'clamp(16px, 2vw, 18px)',
            fontStyle: 'normal',
            fontWeight: 400,
            lineHeight: 'clamp(24px, 3vw, 30px)',
            margin: 0,
            width: '100%',
            maxWidth: '783px'
          }}
        >
          Our antennas, cabling, and RF components are engineered for reliable performance in demanding industrial, public safety, and infrastructure networks.
        </p>
      </div>
    </section>
  );
}
