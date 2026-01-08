"use client";

import { useScrollAnimation } from "@/hooks/useScrollAnimation";

export default function HeroBackbone() {
  const titleRef = useScrollAnimation({ threshold: 0.2 });

  return (
    <section 
      style={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'end',
        justifyContent: 'space-between',
        width: '100%',
        marginTop: '50px',
        marginBottom: '50px',
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
          color: '#000',
          fontFamily: 'Satoshi, sans-serif',
          fontSize: '50px',
          fontStyle: 'normal',
          fontWeight: 400,
          lineHeight: '50px',
          letterSpacing: '-1px',
          width: '100%'
        }}
      >
        <span>Providing the backbone for</span>
        <br />
        <span style={{ color: '#2958A4' }}>wireless communication</span>
      </h2>

    </section>
  );
}
