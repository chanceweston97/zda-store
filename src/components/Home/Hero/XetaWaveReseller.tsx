"use client";

import Image from "next/image";
import Link from "next/link";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { ButtonArrowHomepage } from "@/components/Common/ButtonArrowHomepage";

export default function XetaWaveReseller() {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.2 });
  const titleRef = useScrollAnimation({ threshold: 0.2 });
  const descriptionRef = useScrollAnimation({ threshold: 0.2 });
  const featuresRef = useScrollAnimation({ threshold: 0.2 });

  return (
    <section 
      ref={ref}
      className={`transition-all duration-1000 ease-out ${
        isVisible 
          ? 'opacity-100 translate-y-0' 
          : 'opacity-0 translate-y-8'
      }`}
    >
      <div className="mx-auto w-full max-w-[1340px] px-4 sm:px-6 xl:px-0">
        <div 
          className="rounded-[20px] overflow-hidden relative"
          style={{
            height: '593px',
            padding: '50px',
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
          <div className="relative z-10 h-full flex flex-col gap-8 md:gap-10 lg:gap-12">
            {/* Top Section: Heading + Description */}
            <div className="flex flex-col md:flex-row gap-6 md:gap-8 lg:gap-10">
              {/* Left Column: Title Section */}
              <div 
                ref={titleRef.ref}
                className={`flex flex-col w-full md:w-1/2 transition-all duration-1000 ease-out ${
                  titleRef.isVisible 
                    ? 'opacity-100 translate-y-0' 
                    : 'opacity-0 translate-y-8'
                }`}
              >
                <h2 
                  style={{
                    color: '#FFF',
                    fontFamily: 'Satoshi, sans-serif',
                    fontSize: 'clamp(32px, 5vw, 50px)',
                    fontStyle: 'normal',
                    fontWeight: 400,
                    lineHeight: 'clamp(32px, 5vw, 50px)',
                    letterSpacing: '-2px',
                    marginBottom: '8px',
                    margin: 0
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
                    marginBottom: '12px',
                    margin: 0
                  }}
                >
                  end-to-end
                </h3>
                <p 
                  style={{
                    color: '#FFF',
                    fontFamily: 'Satoshi, sans-serif',
                    fontSize: '18px',
                    fontStyle: 'normal',
                    fontWeight: 400,
                    lineHeight: '26px',
                    marginBottom: '20px',
                    marginTop: '20px'
                  }}
                >
                  For complete system solutions, reach out to a product expert.
                </p>
                <Link
                  href="/request-a-quote"
                  className="group inline-flex items-center gap-2 rounded-lg px-6 py-3 transition-all duration-300 ease-in-out hover:opacity-90"
                  style={{
                    backgroundColor: '#70C8FF',
                    color: '#002D78',
                    fontFamily: 'Satoshi, sans-serif',
                    fontSize: '16px',
                    fontWeight: 500,
                    width: 'fit-content'
                  }}
                >
                  <ButtonArrowHomepage />
                  <span>Inquire Today</span>
                </Link>
              </div>

              {/* Right Column: Description Text */}
              <div 
                ref={descriptionRef.ref}
                className={`w-full md:w-1/2 flex items-start transition-all duration-1000 ease-out delay-300 ${
                  descriptionRef.isVisible 
                    ? 'opacity-100 translate-x-0' 
                    : 'opacity-0 translate-x-8'
                }`}
              >
                <p 
                  style={{
                    color: '#FFF',
                    fontFamily: 'Satoshi, sans-serif',
                    fontSize: 'clamp(16px, 1.5vw, 18px)',
                    fontStyle: 'normal',
                    fontWeight: 400,
                    lineHeight: '28px',
                    margin: 0
                  }}
                >
                  As an authorized Xetawave and Surecall reseller, we deliver end-to-end wireless link solutions integrating radios, antennas, cabling, and RF accessories for secure, reliable operation.
                </p>
              </div>
            </div>

            {/* Bottom Section: Four Feature Columns */}
            <div 
              ref={featuresRef.ref}
              className={`flex flex-col md:flex-row gap-0 transition-all duration-1000 ease-out delay-500 ${
                featuresRef.isVisible 
                  ? 'opacity-100 translate-y-0' 
                  : 'opacity-0 translate-y-8'
              }`}
            >
              {/* Feature 1: ≤1.5 VSWR */}
              <div className="flex-1 flex flex-col gap-3 p-4 md:p-6 border-r border-white/30 last:border-r-0">
                <h4 
                  style={{
                    color: '#FFF',
                    fontFamily: 'Satoshi, sans-serif',
                    fontSize: '24px',
                    fontStyle: 'normal',
                    fontWeight: 400,
                    lineHeight: '34px',
                    letterSpacing: '-0.96px',
                    margin: 0,
                    marginBottom: '8px'
                  }}
                >
                  ≤1.5 VSWR
                </h4>
                <p 
                  style={{
                    color: '#FFF',
                    fontFamily: 'Satoshi, sans-serif',
                    fontSize: '16px',
                    fontStyle: 'normal',
                    fontWeight: 400,
                    lineHeight: '26px',
                    margin: 0
                  }}
                >
                  Engineered RF components designed to minimize return loss and protect connected radios.
                </p>
              </div>

              {/* Feature 2: 0-6 GHz */}
              <div className="flex-1 flex flex-col gap-3 p-4 md:p-6 border-r border-white/30 last:border-r-0">
                <h4 
                  style={{
                    color: '#FFF',
                    fontFamily: 'Satoshi, sans-serif',
                    fontSize: '24px',
                    fontStyle: 'normal',
                    fontWeight: 400,
                    lineHeight: '34px',
                    letterSpacing: '-0.96px',
                    margin: 0,
                    marginBottom: '8px'
                  }}
                >
                  0-6 GHz
                </h4>
                <p 
                  style={{
                    color: '#FFF',
                    fontFamily: 'Satoshi, sans-serif',
                    fontSize: '16px',
                    fontStyle: 'normal',
                    fontWeight: 400,
                    lineHeight: '26px',
                    margin: 0
                  }}
                >
                  Antennas, cabling, and RF solutions supporting VHF, UHF, ISM, and cellular frequency bands.
                </p>
              </div>

              {/* Feature 3: Industrial Radio */}
              <div className="flex-1 flex flex-col gap-3 p-4 md:p-6 border-r border-white/30 last:border-r-0">
                <h4 
                  style={{
                    color: '#FFF',
                    fontFamily: 'Satoshi, sans-serif',
                    fontSize: '24px',
                    fontStyle: 'normal',
                    fontWeight: 400,
                    lineHeight: '34px',
                    letterSpacing: '-0.96px',
                    margin: 0,
                    marginBottom: '8px'
                  }}
                >
                  Industrial Radio
                </h4>
                <p 
                  style={{
                    color: '#FFF',
                    fontFamily: 'Satoshi, sans-serif',
                    fontSize: '16px',
                    fontStyle: 'normal',
                    fontWeight: 400,
                    lineHeight: '26px',
                    margin: 0
                  }}
                >
                  Software-defined radios from XetaWave built for licensed and unlicensed operation.
                </p>
              </div>

              {/* Feature 4: Cellular Signal */}
              <div className="flex-1 flex flex-col gap-3 p-4 md:p-6 border-r border-white/30 last:border-r-0">
                <h4 
                  style={{
                    color: '#FFF',
                    fontFamily: 'Satoshi, sans-serif',
                    fontSize: '24px',
                    fontStyle: 'normal',
                    fontWeight: 400,
                    lineHeight: '34px',
                    letterSpacing: '-0.96px',
                    margin: 0,
                    marginBottom: '8px'
                  }}
                >
                  Cellular Signal
                </h4>
                <p 
                  style={{
                    color: '#FFF',
                    fontFamily: 'Satoshi, sans-serif',
                    fontSize: '16px',
                    fontStyle: 'normal',
                    fontWeight: 400,
                    lineHeight: '26px',
                    margin: 0
                  }}
                >
                  FCC-compliant signal boosters from SureCall designed for reliable indoor and wide-area coverage.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

