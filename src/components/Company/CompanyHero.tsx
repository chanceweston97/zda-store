"use client";

import Image from "next/image";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

export default function CompanyHero() {
  const titleRef = useScrollAnimation({ threshold: 0.2 });
  const dividerRef = useScrollAnimation({ threshold: 0.2 });
  const descriptionRef = useScrollAnimation({ threshold: 0.2 });

  return (
    <section 
      className="w-full flex flex-col md:flex-row justify-center items-center relative overflow-hidden"
      style={{
        display: 'flex',
        width: '100%',
        margin: '0 auto',
        marginTop: '80px',
        padding: '50px',
        alignItems: 'center',
        height: '350px',
        background: 'radial-gradient(143.61% 142.34% at 55.45% -16%, #2958A4 34.13%, #1870D5 74.53%, #70C8FF 100%)'
      }}
    >
      {/* Dot Background SVG */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <Image
          src="/images/dot-bg-global.svg"
          alt=""
          fill
          className="object-cover"
          style={{ mixBlendMode: 'overlay' }}
        />
      </div>

      <div
        className="relative z-10 flex flex-col md:flex-row items-center"
        style={{
          display: 'flex',
          width: '1440px',
          maxWidth: '100%',
          padding: '50px',
          alignItems: 'center'
        }}
      >
      {/* Left: "Built to connect" */}
      <div 
        ref={titleRef.ref}
        className={`transition-all ease-out flex items-center md:mr-[250px] ${
          titleRef.isVisible 
            ? 'opacity-100 translate-y-0' 
            : 'opacity-0 translate-y-8'
        }`}
        style={{ 
          transitionDuration: '600ms', 
          height: '100%'
        }}
      >
        <h1 
          className="md:whitespace-nowrap"
          style={{
            color: '#FFF',
            fontFamily: 'Satoshi, sans-serif',
            fontSize: '60px',
            fontStyle: 'normal',
            fontWeight: 400,
            lineHeight: '50px',
            letterSpacing: '-2.4px',
            margin: 0
          }}
        >
          Built to connect
        </h1>
      </div>

      {/* Divider */}
      <div 
        className="flex items-center"
        style={{ height: '100%' }}
      >
        <div 
          ref={dividerRef.ref}
          className={`transition-all duration-1000 ease-out delay-300 ${
            dividerRef.isVisible 
              ? 'opacity-100 translate-y-0' 
              : 'opacity-0 translate-y-full'
          }`}
          style={{
            width: '1px',
            height: '250px',
            background: '#FFF',
            flexShrink: 0,
            display: 'block'
          }}
        />
      </div>

      {/* Right: Description */}
      <div 
        ref={descriptionRef.ref}
        className={`transition-all duration-1000 ease-out delay-500 flex items-center md:ml-[80px] ${
          descriptionRef.isVisible 
            ? 'opacity-100 translate-x-0' 
            : 'opacity-0 -translate-x-8'
        }`}
        style={{
          width: '477px',
          flexShrink: 0,
          height: '100%'
        }}
      >
        <p 
          style={{
            color: '#FFF',
            fontFamily: 'Satoshi, sans-serif',
            fontSize: '20px',
            fontStyle: 'normal',
            fontWeight: 400,
            lineHeight: '26px',
            margin: 0,
            textAlign: 'left'
          }}
        >
          Delivering engineered wireless connectivity solutions that provide consistent performance, reliability, and efficiency for critical communications networks.
        </p>
      </div>
      </div>
    </section>
  );
}
