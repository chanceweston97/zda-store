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
        <div className="bg-[#2958A4] rounded-[20px] overflow-hidden relative p-6 sm:p-8 lg:p-10 xl:p-12">
          {/* Top Row: Title and Button in 1 line */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            <h2 className="text-white text-[32px] sm:text-[40px] lg:text-[48px] font-medium leading-tight">
              Authorized XetaWave Reseller
            </h2>
            
            {/* Top Right Button */}
            <Link
              href="/request-a-quote"
              className="inline-flex items-center justify-center rounded-full border border-transparent bg-white text-[#2958A4] text-sm font-medium px-6 py-3 transition-colors hover:border-white hover:bg-[#2958A4] hover:text-white whitespace-nowrap"
            >
              Request a Quote
            </Link>
          </div>

          {/* Bottom Row: Card (450px) and Image (770px) in 1 line */}
          <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 min-w-0">
            {/* White Info Box - 450px width */}
            <div className="w-full lg:w-[450px] lg:shrink-0">
              <div className="bg-white rounded-[20px] h-[300px] sm:h-[350px] lg:h-[412px] flex flex-col">
                <div className="p-[30px] flex flex-col h-full">
                  <p className="text-[#383838] font-satoshi text-[18px] leading-[28px] mb-4">
                    Xetawave industrial radios support licensed and unlicensed sub-GHz bands, ethernet, and are engineered for SCADA, telemetry, and remote monitoring.
                  </p>
                  <p className="text-[#383838] font-satoshi text-[18px] leading-[28px] mb-6 grow">
                    Our antennas are even better with Xetawave radios. As an authorized reseller, we can help you build the whole link end-to-end.
                  </p>
                  
                  <Link
                    href="/request-a-quote"
                    className="inline-flex items-center justify-center rounded-full border border-transparent bg-[#2958A4] text-white text-sm font-medium px-6 py-3 transition-colors hover:border-[#2958A4] hover:bg-white hover:text-[#2958A4] self-start"
                  >
                    Request a Quote
                  </Link>
                </div>
              </div>
            </div>

            {/* Website Screenshot - 770px width, but flexible to prevent overflow */}
            <div className="w-full lg:flex-1 lg:max-w-[770px] lg:min-w-0 lg:h-[412px] h-[300px] sm:h-[350px] relative">
              <div className="relative w-full h-full rounded-lg overflow-hidden">
                <Image
                  src="/images/xetawave-website.png"
                  alt="XetaWave Website"
                  fill
                  className="object-contain"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

