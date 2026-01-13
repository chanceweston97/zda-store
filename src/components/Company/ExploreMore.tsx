"use client";

import Link from "next/link";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

const exploreItems = [
  {
    title: "Products",
    description: "Get to know our antennas, cables, and RF components.",
    link: "/shop"
  },
  {
    title: "Catalog",
    description: "Explore our full range of RF products and solutions.",
    link: "/catalog"
  },
  {
    title: "Cable Builder",
    description: "Build-to-spec coaxial cable assemblies for RF systems.",
    link: "/cable-customizer"
  }
];

export default function ExploreMore() {
  const titleRef = useScrollAnimation({ threshold: 0.2 });
  const cardsRef = useScrollAnimation({ threshold: 0.2 });

  return (
    <section 
      className="w-full flex justify-center"
      style={{
        paddingBottom: '50px',
        background: '#F1F6FF'
      }}
    >
      <div
        className="flex flex-col md:flex-row pt-[30px] px-[30px] pb-0 md:pt-[50px] md:px-[50px] md:pb-0"
        style={{
          display: 'flex',
          width: '100%',
          maxWidth: '1440px',
          justifyContent: 'space-between',
          alignItems: 'flex-start'
        }}
      >
        {/* Left: Title Section */}
        <div 
          ref={titleRef.ref}
          className={`transition-all duration-1000 ease-out ${
            titleRef.isVisible 
              ? 'opacity-100 translate-y-0' 
              : 'opacity-0 translate-y-8'
          }`}
          style={{
            flex: '0 0 auto'
          }}
        >
          <h2 style={{
            color: '#000',
            fontFamily: 'Satoshi, sans-serif',
            fontSize: 'clamp(40px, 5vw, 60px)',
            fontStyle: 'normal',
            fontWeight: 400,
            lineHeight: 'clamp(40px, 5vw, 60px)',
            letterSpacing: '-2.4px',
            margin: 0,
            marginBottom: '8px'
          }}>
            Explore more
          </h2>
          <h2 style={{
            color: '#2958A4',
            fontFamily: 'Satoshi, sans-serif',
            fontSize: 'clamp(40px, 5vw, 60px)',
            fontStyle: 'normal',
            fontWeight: 400,
            lineHeight: 'clamp(40px, 5vw, 60px)',
            letterSpacing: '-2.4px',
            margin: 0
          }}>
            from ZDA
          </h2>
        </div>

        {/* Right: Cards Section */}
        <div 
          ref={cardsRef.ref}
          className={`flex flex-col transition-all duration-1000 ease-out delay-300 ${
            cardsRef.isVisible 
              ? 'opacity-100 translate-y-0' 
              : 'opacity-0 translate-y-8'
          }`}
          style={{
            width: '100%',
            maxWidth: '800px',
            flexShrink: 0,
            gap: '15px'
          }}
        >
          {exploreItems.map((item) => (
            <Link
              key={item.title}
              href={item.link}
              className="flex items-center justify-between bg-white rounded-[10px] p-6 hover:shadow-md transition-shadow duration-300"
              style={{
                textDecoration: 'none'
              }}
            >
              <div style={{ flex: 1 }}>
                <h3 style={{
                  color: '#000',
                  fontFamily: 'Satoshi, sans-serif',
                  fontSize: '24px',
                  fontStyle: 'normal',
                  fontWeight: 400,
                  lineHeight: '34px',
                  letterSpacing: '-0.96px',
                  margin: 0,
                  marginBottom: '8px'
                }}>
                  {item.title}
                </h3>
                <p style={{
                  color: '#000',
                  fontFamily: 'Satoshi, sans-serif',
                  fontSize: '16px',
                  fontStyle: 'normal',
                  fontWeight: 400,
                  lineHeight: '26px',
                  margin: 0
                }}>
                  {item.description}
                </p>
              </div>
              {/* Arrow Icon */}
              <div style={{ marginLeft: '20px', flexShrink: 0 }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path fillRule="evenodd" clipRule="evenodd" d="M14.2929 5.29289C14.6834 4.90237 15.3166 4.90237 15.7071 5.29289L21.7071 11.2929C22.0976 11.6834 22.0976 12.3166 21.7071 12.7071L15.7071 18.7071C15.3166 19.0976 14.6834 19.0976 14.2929 18.7071C13.9024 18.3166 13.9024 17.6834 14.2929 17.2929L18.5858 13H3C2.44772 13 2 12.5523 2 12C2 11.4477 2.44772 11 3 11H18.5858L14.2929 6.70711C13.9024 6.31658 13.9024 5.68342 14.2929 5.29289Z" fill="#2958A4"/>
                </svg>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
