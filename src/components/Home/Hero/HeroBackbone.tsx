"use client";

import { useScrollAnimation } from "@/hooks/useScrollAnimation";

export default function HeroBackbone() {
  const titleRef = useScrollAnimation({ threshold: 0.2 });

  return (
    <section 
      className="w-full"
    >
      <div className="mx-auto w-full max-w-[1340px] px-4 sm:px-6 xl:px-0">
      {/* Heading */}
      <h2 
        ref={titleRef.ref}
          className={`transition-all duration-1000 ease-out text-center md:text-left text-[28px] sm:text-[36px] md:text-[42px] lg:text-[50px] leading-[1.2] sm:leading-[1.3] md:leading-[50px] tracking-[-0.5px] sm:tracking-[-0.75px] md:tracking-[-1px] ${
          titleRef.isVisible 
            ? 'opacity-100 translate-y-0' 
            : 'opacity-0 translate-y-8'
        }`}
        style={{
          color: '#000',
          fontFamily: 'Satoshi, sans-serif',
          fontStyle: 'normal',
          fontWeight: 400,
          width: '100%'
        }}
      >
        <span>Providing the backbone for</span>
        <br />
        <span style={{ color: '#2958A4' }}>wireless communication</span>
      </h2>
      </div>
    </section>
  );
}
