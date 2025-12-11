import Image from "next/image";
import LocalizedClientLink from "@modules/common/components/localized-client-link";

const workItems = [
  {
    icon: "/images/icons/cable-reel.svg",
    title: "Custom Cables",
    text: "Custom RF cables for reliable, real-world coverage.",
  },
  {
    icon: "/images/icons/antennas.svg",
    title: "Antennas",
    text: "Directional and omni RF antennas for reliable, real-world coverage.",
  },
  {
    icon: "/images/icons/data.svg",
    title: "Connectors",
    text: "Industrial RF connectors and adapters for secure, low-VSWR joins.",
  },
  {
    icon: "/images/icons/manufacture.svg",
    title: "Manufacturing",
    text: "Custom RF builds and assemblies tailored to your network.",
  },
];

export default function WorkWithUsSection() {
  return (
    <section className="w-full py-12 sm:py-16 lg:py-20">
      <div className="mx-auto max-w-[1340px] px-4 sm:px-6 xl:px-0">
        <div className="mx-auto w-full max-w-[1340px] bg-[#2958A4] rounded-[20px] px-4 py-10 sm:px-8 sm:py-12 lg:px-12 lg:py-16">
          {/* Top row: title + tagline + button */}
          <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col gap-4">
              <h2 className="text-white text-[40px] sm:text-[48px] lg:text-[56px] font-medium leading-tight tracking-[-0.04em]">
                Work With Us
              </h2>
            </div>
            <LocalizedClientLink
              href="/contact"
              className="inline-flex items-center gap-3 rounded-full border border-white bg-white px-6 py-2 text-[16px] font-medium leading-[26px] text-[#2958A4] transition-colors hover:bg-white/90"
            >
              Contact Us
            </LocalizedClientLink>
          </div>
          <p className="text-white text-[24px] sm:text-[24px] leading-[26px] py-[40px]">
            From government fleets to amateur radio enthusiasts, we're your partner for antennas, custom cables, connectors, and more.
          </p>

          {/* Bottom row: 4 items in one line */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4">
            {workItems.map((item) => (
              <div
                key={item.title}
                className="flex flex-col items-start text-left gap-3"
              >
                {/* Icon */}
                <div className="h-10 w-10 flex items-center justify-center flex-shrink-0">
                  <Image
                    src={item.icon}
                    alt={item.title}
                    width={40}
                    height={40}
                    className="w-full h-full object-contain"
                  />
                </div>

                {/* Title */}
                <h3 className="text-white text-[18px] font-medium leading-[26px]">
                  {item.title}
                </h3>

                {/* Text */}
                <p className="text-white/80 text-[14px] sm:text-[15px] leading-[22px] max-w-[290px]">
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

