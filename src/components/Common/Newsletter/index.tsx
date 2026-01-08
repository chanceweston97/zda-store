"use client";

import Link from "next/link";
import Image from "next/image";

const Newsletter = () => {
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
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <Image
          src="/images/dot-bg-global.svg"
          alt=""
          fill
          className="object-cover"
          style={{ mixBlendMode: 'overlay' }}
        />
      </div>

      <div className="relative z-10 w-full max-w-[1340px] mx-auto px-4 sm:px-6 xl:px-0 flex flex-col items-center justify-center text-center">
        <h2 
          className="mb-4"
          style={{
            color: '#FFF',
            textAlign: 'center',
            fontFamily: 'Satoshi, sans-serif',
            fontSize: '70px',
            fontStyle: 'normal',
            fontWeight: 500,
            lineHeight: '66px',
            letterSpacing: '-2.8px'
          }}
        >
          Getting connected starts <span style={{ color: '#70C8FF' }}>here</span>
        </h2>
        
        <p 
          className="mb-8"
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
          href="/contact"
          className="inline-flex items-center justify-center rounded-[10px] border border-transparent transition-all duration-300 ease-in-out hover:opacity-90"
          style={{ 
            display: 'flex',
            padding: '10px 30px',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '10px',
            fontFamily: 'Satoshi, sans-serif',
            backgroundColor: '#70C8FF',
            color: '#002D78',
            fontSize: '16px',
            fontStyle: 'normal',
            fontWeight: 500,
            lineHeight: '26px',
            letterSpacing: '-0.32px'
          }}
        >
          Inquire Today
        </Link>
      </div>
    </section>
  );
};

export default Newsletter;
