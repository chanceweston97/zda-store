"use client";

import Image from "next/image";
import Link from "next/link";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { ButtonArrowHomepage } from "@/components/Common/ButtonArrowHomepage";

const services = [
  {
    icon: "/images/workwithus/antennas.svg",
    title: "Antennas",
    description: "Directional and omni RF antennas for reliable, real-world coverage."
  },
  {
    icon: "/images/workwithus/cables.svg",
    title: "Cables",
    description: "Low-loss coaxial cable assemblies built to your spec, assembled in the United States."
  },
  {
    icon: "/images/workwithus/rf-accessories.svg",
    title: "RF Accessories",
    description: "Industrial RF connectors and adapters for secure, low-VSWR joins."
  },
  {
    icon: "/images/workwithus/manufacturing.svg",
    title: "Manufacturing",
    description: "Custom RF builds and assembles tailored to your network."
  }
];

export default function WorkWithUs() {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.2 });

  return (
    <section 
      ref={ref}
      className={`transition-all duration-1000 ease-out ${
        isVisible 
          ? 'opacity-100 translate-y-0' 
          : 'opacity-0 translate-y-8'
      }`}
      style={{ 
        background: '#F1F6FF',
        display: 'flex',
        width: '100%',
        maxWidth: '1440px',
        minHeight: '600px',
        height: 'auto',
        padding: '0 100px',
        justifyContent: 'center',
        alignItems: 'center',
        margin: '0 auto',
        marginTop: '50px'
      }}
    >
      <div className="w-full max-w-[1440px] mx-auto">
        {/* Header Section */}
        <div className="flex flex-col items-center text-center mb-8 sm:mb-10 lg:mb-12">
          <h2 
            style={{
              color: '#000',
              fontFamily: 'Satoshi, sans-serif',
              fontSize: 'clamp(40px, 5vw, 60px)',
              fontStyle: 'normal',
              fontWeight: 400,
              lineHeight: 'clamp(40px, 5vw, 60px)',
              letterSpacing: '-2.4px',
              marginBottom: '16px'
            }}
          >
            Work with us
          </h2>
          <p 
            className="mb-6 sm:mb-8 max-w-3xl"
            style={{
              color: '#000',
              textAlign: 'center',
              fontFamily: 'Satoshi, sans-serif',
              fontSize: 'clamp(16px, 1.5vw, 18px)',
              fontStyle: 'normal',
              fontWeight: 500,
              lineHeight: '26px'
            }}
          >
            From government fleets to amateur radio enthusiasts, we're your partner for antennas, cables, connectors, and more.
          </p>
          <Link
            href="/contact"
            className="btn filled group relative inline-flex items-center justify-center rounded-[10px] border border-transparent bg-[#2958A4] text-white text-[14px] sm:text-[16px] font-medium transition-all duration-300 ease-in-out hover:bg-[#214683] hover:active"
            style={{ 
              fontFamily: 'Satoshi, sans-serif',
              padding: '10px 30px',
              paddingRight: '30px',
              cursor: 'pointer',
              minWidth: 'fit-content'
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

        {/* Service Cards */}
        <div className="flex flex-col sm:flex-row justify-between items-center">
          {services.map((service, index) => (
            <div key={service.title} className="contents">
              {/* Horizontal Separator (Mobile) */}
              {index > 0 && (
                <div 
                  className="block sm:hidden w-full"
                  style={{
                    height: '1px',
                    backgroundColor: '#D1D5DB'
                  }}
                />
              )}
              {/* Vertical Separator (Desktop) - centered between items */}
              {index > 0 && (
                <div 
                  className="hidden sm:block"
                  style={{
                    width: '1px',
                    height: '225px',
                    backgroundColor: '#D1D5DB',
                    flexShrink: 0,
                    alignSelf: 'center'
                  }}
                />
              )}
              <div 
                className="w-full sm:w-[250px]"
                style={{
                  display: 'flex',
                  height: '250px',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  flexShrink: 0
                }}
              >
                {/* Icon */}
                <div style={{ marginBottom: '50px' }}>
                  <Image
                    src={service.icon}
                    alt={service.title}
                    width={50}
                    height={50}
                    style={{
                      width: '50px',
                      height: '50px',
                      flexShrink: 0,
                      aspectRatio: '1/1'
                    }}
                  />
                </div>
                {/* Title */}
                <h3 
                  style={{
                    color: '#000',
                    fontFamily: 'Satoshi, sans-serif',
                    fontSize: '24px',
                    fontStyle: 'normal',
                    fontWeight: 500,
                    lineHeight: '34px',
                    letterSpacing: '-0.96px',
                    margin: 0,
                    marginBottom: '10px'
                  }}
                >
                  {service.title}
                </h3>
                {/* Description */}
                <p 
                  style={{
                    color: '#000',
                    fontFamily: 'Satoshi, sans-serif',
                    fontSize: '16px',
                    fontStyle: 'normal',
                    fontWeight: 400,
                    lineHeight: '26px',
                    margin: 0
                  }}
                >
                  {service.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
