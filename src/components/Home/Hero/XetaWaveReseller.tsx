"use client";

import Image from "next/image";
import Link from "next/link";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

export default function XetaWaveReseller() {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.2 });

  return (
    <section 
      ref={ref}
      className={`py-10 sm:py-12 lg:py-16 transition-all duration-1000 ease-out ${
        isVisible 
          ? 'opacity-100 translate-y-0' 
          : 'opacity-0 translate-y-8'
      }`}
    >
      <div className="mx-auto w-full max-w-[1340px] px-4 sm:px-6 xl:px-0">
        <div 
          className="rounded-[20px] overflow-hidden relative min-h-[400px] md:min-h-[500px] lg:min-h-[600px] p-5 sm:p-8 md:p-10 lg:p-[50px]"
          style={{
            background: 'radial-gradient(89.11% 88.6% at 39.25% 24.11%, #2958A4 42.79%, #1870D5 74.04%, #70C8FF 100%)'
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

          {/* Content */}
          <div className="relative z-10 h-full flex flex-col md:flex-row gap-6 md:gap-8 lg:gap-10">
            {/* Left Column: Title Section */}
            <div className="flex flex-col w-full md:w-1/2">
                <h2 
                  style={{
                  color: '#FFF',
                    fontFamily: 'Satoshi, sans-serif',
                  fontSize: 'clamp(32px, 5vw, 50px)',
                    fontStyle: 'normal',
                  fontWeight: 400,
                  lineHeight: 'clamp(32px, 5vw, 50px)',
                  letterSpacing: '-2px',
                  marginBottom: '8px'
                  }}
                >
                  We build the whole link
                </h2>
                <h3 
                  style={{
                    color: '#70C8FF',
                    fontFamily: 'Satoshi, sans-serif',
                  fontSize: 'clamp(32px, 5vw, 50px)',
                    fontStyle: 'normal',
                  fontWeight: 400,
                  lineHeight: 'clamp(32px, 5vw, 50px)',
                  letterSpacing: '-2px',
                  marginBottom: '12px'
                  }}
                >
                  end-to-end
                </h3>
                <div className="w-1 h-8 bg-white"></div>
            </div>

            {/* Right Column: Description Text */}
            <div className="w-full md:w-1/2 flex items-start">
                <p 
                  style={{
                  color: '#FFF',
                    fontFamily: 'Satoshi, sans-serif',
                  fontSize: 'clamp(16px, 1.5vw, 18px)',
                  fontStyle: 'normal',
                  fontWeight: 400,
                    lineHeight: '28px'
                  }}
                >
                  As an authorized Xetawave reseller, we deliver end-to-end wireless link solutions integrating radios, antennas, cabling, and RF accessories for secure, reliable operation.
                </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

