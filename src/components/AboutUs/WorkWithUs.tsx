import Image from "next/image";
import Link from "next/link";


const workItems = [
    {
        icon: "/images/icons/cable-reel.svg",
        title: "Custom Cables",
        text: "Directional and omni RF antennas for reliable, real-world coverage.",
    },
    {
        icon: "/images/icons/antennas.svg",
        title: "Antennas",
        text: "Low-loss coaxial cable assemblies built to your spec, assembled in the United States.",
    },
    {
        icon: "/images/icons/data.svg",
        title: "Connectors",
        text: "Industrial RF connectors and adapters for secure, low-VSWR joins.",
    },
    {
        icon: "/images/icons/manufacture.svg",
        title: "Manufacturing",
        text: "Custom RF builds and assembles tailored to your network.",
    },
];

export default function WorkWithUsSection() {
    return (
        <section className=" ">
            <div className="mx-auto w-full max-w-[1340px] bg-[#2958A4] rounded-[20px] px-4 py-10 sm:px-8 sm:py-12 lg:px-12 lg:py-16">
                {/* Top row: title + tagline + button */}
                <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-col gap-4">
                        <h2 className="text-white text-[40px] sm:text-[48px] lg:text-[56px] font-medium leading-tight tracking-[-0.04em]">
                            Work With Us
                        </h2>
                    </div>
                    <Link
                        href="/contact"
                        className="inline-flex items-center gap-3 rounded-full border border-white bg-white px-6 py-2 text-[16px] font-medium leading-[26px] text-[#2958A4] transition-colors hover:bg-white/90"
                    >
                        Contact Us
                    </Link>
                </div>
                <p className="text-white text-[24px] sm:text-[24px] leading-[26px] py-[40px]">
                            From government fleets to amateur radio enthusiasts, we're your partner for antennas, custom cables, connectors, and more.
                        </p>

                {/* Bottom row: 4 items */}
                <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
                    {workItems.map((item) => (
                        <div
                            key={item.title}
                            className="flex flex-col items-center text-center lg:items-start lg:text-left gap-3"
                        >
                            {/* Icon */}
                            <div className="h-10 w-10 flex items-center justify-center flex-shrink-0">
                                {/* Use your real SVGs/images here */}
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
        </section>
    );
}
