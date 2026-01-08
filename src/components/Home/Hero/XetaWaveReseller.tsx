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
          className="bg-[#2958A4] rounded-[20px] overflow-hidden relative"
          style={{
            width: '1340px',
            height: '600px',
            maxWidth: '100%',
            padding: '50px'
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
          <div className="relative z-10 h-full flex flex-col">
            {/* Top Row: Heading and Description */}
            <div className="flex flex-col lg:flex-row items-start justify-between gap-8 flex-1">
              {/* Left Side: Title Section */}
              <div className="flex flex-col">
                <h2 
                  className="text-white mb-2"
                  style={{
                    fontFamily: 'Satoshi, sans-serif',
                    fontSize: '50px',
                    fontStyle: 'normal',
                    fontWeight: 500,
                    lineHeight: '50px',
                    letterSpacing: '-2px'
                  }}
                >
                  We build the whole link
                </h2>
                <h3 
                  className="mb-3"
                  style={{
                    color: '#70C8FF',
                    fontFamily: 'Satoshi, sans-serif',
                    fontSize: '50px',
                    fontStyle: 'normal',
                    fontWeight: 500,
                    lineHeight: '50px',
                    letterSpacing: '-2px'
                  }}
                >
                  end-to-end
                </h3>
                <div className="w-1 h-8 bg-white"></div>
              </div>
              
              {/* Right Side: Description Text */}
              <div className="w-full lg:max-w-[600px] xl:max-w-[700px]">
                <p 
                  className="text-white"
                  style={{
                    fontFamily: 'Satoshi, sans-serif',
                    fontSize: '18px',
                    lineHeight: '28px'
                  }}
                >
                  As an authorized Xetawave reseller, we deliver end-to-end wireless link solutions integrating radios, antennas, cabling, and RF accessories for secure, reliable operation.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

