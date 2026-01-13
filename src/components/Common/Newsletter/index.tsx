"use client";

import Link from "next/link";
import Image from "next/image";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { ButtonArrowHomepage } from "@/components/Common/ButtonArrowHomepage";

const Newsletter = () => {
  const headingRef = useScrollAnimation({ threshold: 0.2 });
  const paragraphRef = useScrollAnimation({ threshold: 0.2 });
  const buttonRef = useScrollAnimation({ threshold: 0.2 });

  return (
    <section 
      className="flex justify-center items-center relative overflow-hidden mx-auto"
      style={{
        width: '1440px',
        maxWidth: '100%',
        height: '400px',
        flexShrink: 0,
        background: 'radial-gradient(99.5% 99.03% at 50% 35.5%, #2958A4 21.63%, #1870D5 55.29%, #70C8FF 97.6%)'
      }}
    >
      {/* Dot Background SVG */}
      <div className="absolute inset-0 pointer-events-none">
        <Image
          src="/images/xetawave-dot.svg"
          alt=""
          fill
          className="object-cover"
        />
      </div>

      <div className="relative z-10 w-full max-w-[1340px] mx-auto px-4 sm:px-6 xl:px-0 flex flex-col items-center justify-center text-center">
        <h2 
          ref={headingRef.ref}
          className={`mb-4 text-[45px] sm:text-[70px] transition-all duration-1000 ease-out ${
            headingRef.isVisible 
              ? 'opacity-100 translate-y-0' 
              : 'opacity-0 translate-y-8'
          }`}
          style={{
            color: '#FFF',
            textAlign: 'center',
            fontFamily: 'Satoshi, sans-serif',
            fontStyle: 'normal',
            fontWeight: 400,
            lineHeight: '66px',
            letterSpacing: '-2.8px'
          }}
        >
          Getting connected starts <span style={{ color: '#70C8FF' }}>here</span>
          </h2>

        <p 
          ref={paragraphRef.ref}
          className={`mb-8 transition-all duration-1000 ease-out delay-200 ${
            paragraphRef.isVisible 
              ? 'opacity-100 translate-y-0' 
              : 'opacity-0 translate-y-8'
          }`}
          style={{
            color: '#FFF',
            textAlign: 'center',
            fontFamily: 'Satoshi, sans-serif',
            fontSize: '18px',
            fontStyle: 'normal',
            fontWeight: 400,
            lineHeight: '28px',
            letterSpacing: '-0.36px'
          }}
        >
          Support at every stage of your project
        </p>

        <Link
          ref={buttonRef.ref}
          href="/contact"
          className={`btn filled group relative inline-flex items-center justify-center rounded-[10px] border border-transparent text-[14px] sm:text-[16px] font-medium transition-all duration-300 ease-in-out hover:opacity-90 ${
            buttonRef.isVisible 
              ? 'opacity-100 translate-y-0' 
              : 'opacity-0 translate-y-8'
          }`}
          style={{ 
            fontFamily: 'Satoshi, sans-serif',
            backgroundColor: '#70C8FF',
            color: '#002D78',
            padding: '10px 30px',
            paddingRight: '30px',
            cursor: 'pointer',
            minWidth: 'fit-content',
            transitionDuration: '1000ms',
            transitionDelay: '400ms'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.paddingRight = 'calc(30px + 17px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.paddingRight = '30px';
          }}
        >
          <ButtonArrowHomepage />
          <p className="transition-transform duration-300 ease-in-out group-hover:translate-x-[11px] m-0">Inquire Today</p>
        </Link>
      </div>
    </section>
  );
};

export default Newsletter;
