"use client";

import Image from "next/image";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

export default function SolutionsHero() {
  const titleRef = useScrollAnimation({ threshold: 0.2 });
  const dividerRef = useScrollAnimation({ threshold: 0.2 });
  const descriptionRef = useScrollAnimation({ threshold: 0.2 });

  return (
    <section
      className="solutions-hero-section w-full flex flex-col md:flex-row justify-center items-center relative overflow-hidden p-5 md:p-[50px]"
      style={{
        display: "flex",
        width: "100%",
        margin: "0 auto",
        marginTop: "80px",
        alignItems: "center",
        height: "auto",
        minHeight: "350px",
        background:
          "radial-gradient(143.61% 142.34% at 55.45% -16%, #2958A4 34.13%, #1870D5 74.53%, #70C8FF 100%)",
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

      <div className="relative z-10 flex flex-col md:flex-row items-center w-full max-w-[1340px] mx-auto gap-6 md:gap-[250px] md:px-0 px-2">
        {/* Left: "Industry solutions" */}
        <div
          ref={titleRef.ref}
          className={`transition-all ease-out flex items-center justify-center md:justify-start shrink-0 ${
            titleRef.isVisible
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-8"
          }`}
          style={{
            transitionDuration: "600ms",
          }}
        >
          <h1
            className="md:whitespace-nowrap text-center md:text-left"
            style={{
              color: "#FFF",
              fontFamily: "Satoshi, sans-serif",
              fontSize: "clamp(32px, 8vw, 60px)",
              fontStyle: "normal",
              fontWeight: 400,
              lineHeight: "clamp(32px, 8vw, 50px)",
              margin: 0,
              wordWrap: "break-word",
            }}
          >
            Industry solutions
          </h1>
        </div>

        {/* Divider - hidden on mobile */}
        <div className="hidden md:flex items-center shrink-0">
          <div
            ref={dividerRef.ref}
            className={`transition-all duration-1000 ease-out delay-300 ${
              dividerRef.isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-full"
            }`}
            style={{
              width: "1px",
              height: "250px",
              background: "#FFF",
              flexShrink: 0,
              display: "block",
            }}
          />
        </div>

        {/* Right: Description */}
        <div
          ref={descriptionRef.ref}
          className={`transition-all duration-1000 ease-out delay-500 flex items-center justify-center md:justify-start min-w-0 ${
            descriptionRef.isVisible
              ? "opacity-100 translate-x-0"
              : "opacity-0 -translate-x-8"
          }`}
        >
          <p
            className="text-center md:text-left w-full"
            style={{
              color: "#FFF",
              fontFamily: "Satoshi, sans-serif",
              fontSize: "clamp(16px, 4vw, 20px)",
              fontStyle: "normal",
              fontWeight: 400,
              lineHeight: "clamp(22px, 5vw, 26px)",
              margin: 0,
              wordWrap: "break-word",
            }}
          >
            Delivering engineered wireless connectivity solutions that provide
            consistent performance, reliability, and efficiency for critical
            communications networks.
          </p>
        </div>
      </div>
    </section>
  );
}
