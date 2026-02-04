"use client";

import Image from "next/image";
import Link from "next/link";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { ButtonArrowHomepage } from "@/components/Common/ButtonArrowHomepage";

const services = [
  {
    icon: "/images/workwithus/antennas.svg",
    title: "Antennas",
    description: "Directional and omni antennas for reliable RF coverage across DAS, public safety, utility, and infrastructure networks."
  },
  {
    icon: "/images/workwithus/cables.svg",
    title: "RF Cable Assemblies",
    description: "Low-loss coaxial cable assemblies built to specification and assembled in the United States for long-term reliability."
  },
  {
    icon: "/images/workwithus/rf-accessories.svg",
    title: "RF Components",
    description: "Industrial RF connectors, adapters, and attenuators optimized for low-VSWR performance."
  },
  {
    icon: "/images/workwithus/manufacturing.svg",
    title: "Manufacturing",
    description: "Custom RF builds and antenna configurations tailored to your application and deployment needs."
  }
];

export default function WorkWithUs() {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.2 });

  return (
    <section 
      ref={ref}
      className={`transition-all duration-1000 ease-out flex w-full min-h-[600px] h-auto justify-center items-center pt-5 md:pt-0 mt-[50px] ${
        isVisible 
          ? 'opacity-100 translate-y-0' 
          : 'opacity-0 translate-y-8'
      }`}
      style={{ 
        background: '#F1F6FF',
        width: '100vw',
        position: 'relative',
        left: '50%',
        right: '50%',
        marginLeft: '-50vw',
        marginRight: '-50vw'
      }}
    >
      <div className="w-full max-w-[1340px] mx-auto">
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
            className="mb-6 sm:mb-8 max-w-[800px] mx-auto"
            style={{
              color: '#000',
              textAlign: 'center',
              fontFamily: 'Satoshi, sans-serif',
              fontSize: 'clamp(16px, 1.5vw, 18px)',
              fontStyle: 'normal',
              fontWeight: 400,
              lineHeight: '26px',
              marginTop: '10px'
            }}
          >
            From system integrators to government and enterprise operators, ZDA Communications is a trusted partner for antennas, RF cabling, connectivity components, and custom solutions.
          </p>
          <Link
            href="/contact"
            className="btn filled group relative inline-flex items-center justify-center gap-2 rounded-[10px] border border-transparent bg-[#2958A4] text-white text-[14px] sm:text-[16px] font-medium transition-all duration-300 ease-in-out hover:bg-[#214683] hover:active w-[180px] sm:w-[200px] h-12"
            style={{ 
              fontFamily: 'Satoshi, sans-serif',
              padding: '10px 24px',
              cursor: 'pointer',
            }}
          >
            <span className="flex items-center gap-2 transition-transform duration-300 ease-in-out group-hover:translate-x-[11px]">
              <ButtonArrowHomepage />
              <span className="m-0">Inquire Today</span>
            </span>
          </Link>
        </div>

        {/* Service Cards */}
        <div className="flex flex-col sm:flex-row justify-between items-center">
          {services.map((service, index) => {
            const iconRef = useScrollAnimation({ threshold: 0.2 });
            const titleRef = useScrollAnimation({ threshold: 0.2 });
            const descriptionRef = useScrollAnimation({ threshold: 0.2 });
            
            return (
              <div key={service.title} className="contents">
                {/* Vertical Separator (Desktop) - centered between items */}
                {index > 0 && (
                  <div 
                    className="hidden sm:block"
                    style={{
                      width: '1px',
                      height: '250px',
                      backgroundColor: '#000',
                      flexShrink: 0,
                      alignSelf: 'center'
                    }}
                  />
                )}
                <div 
                  className="w-full sm:w-[300px] flex flex-col items-center text-center sm:items-start sm:text-left flex-shrink-0"
                  style={{
                    height: '250px'
                  }}
                >
                  {/* Icon */}
                  <div 
                    ref={iconRef.ref}
                    className={`mb-5 sm:mb-[50px] transition-all duration-1000 ease-out ${
                      iconRef.isVisible 
                        ? 'opacity-100 translate-y-0' 
                        : 'opacity-0 translate-y-8'
                    }`}
                    style={{
                      transitionDelay: `${index * 100}ms`
                    }}
                  >
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
                    ref={titleRef.ref}
                    className={`mb-[10px] transition-all duration-1000 ease-out ${
                      titleRef.isVisible 
                        ? 'opacity-100 translate-y-0' 
                        : 'opacity-0 translate-y-8'
                    }`}
                    style={{
                      color: '#000',
                      fontFamily: 'Satoshi, sans-serif',
                      fontSize: '24px',
                      fontStyle: 'normal',
                      fontWeight: 400,
                      lineHeight: '34px',
                      letterSpacing: '-0.96px',
                      margin: 0,
                      transitionDelay: `${index * 100 + 100}ms`
                    }}
                  >
                    {service.title}
                  </h3>
                  {/* Description */}
                  <p 
                    ref={descriptionRef.ref}
                    className={`transition-all duration-1000 ease-out ${
                      descriptionRef.isVisible 
                        ? 'opacity-100 translate-y-0' 
                        : 'opacity-0 translate-y-8'
                    }`}
                    style={{
                      color: '#000',
                      fontFamily: 'Satoshi, sans-serif',
                      fontSize: '16px',
                      marginTop:'10px',
                      fontStyle: 'normal',
                      fontWeight: 400,
                      lineHeight: '26px',
                      margin: 0,
                      transitionDelay: `${index * 100 + 200}ms`
                    }}
                  >
                    {service.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
