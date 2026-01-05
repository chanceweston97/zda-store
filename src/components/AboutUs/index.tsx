// components/Sections/NetworkIntro.tsx
import Link from "next/link";
import ProudPartners from "../Home/Hero/ProudPartners";
import WorkWithUsSection from "./WorkWithUs";
import FaqSection from "../Home/Faq";
import Newsletter from "../Common/Newsletter";

export default function AboutUs() {
  return (
    <section className="overflow-hidden lg:pt-30 w-full gap-8 lg:gap-7">
      <div className="mx-auto max-w-[1340px] flex justify-center">
        {/* LEFT CONTENT */}
        <div className="max-w-2xl shrink-0">
          {/* Heading */}
          <h2 className="text-[#2958A4] text-[60px] font-medium leading-[76px] tracking-[-2.4px]">
            Enabling Wireless Networks Since 20084
          </h2>

          {/* Paragraph */}
          <p className="mt-6 text-[#383838] text-[18px] font-normal leading-7 tracking-[-0.36px]">
            At ZDA Communications, we care about one thing above all: reliable wireless
            performance. We design and supply industrial-grade antennas, cabling, and RF
            accessories—plus practical tools like custom cable builds—that help homes,
            enterprises, and field teams achieve clear, consistent connectivity. From fixed
            sites to mobile deployments, our hardware is engineered for uptime, verified for
            low VSWR, and built to stand up to real-world conditions so your network stays
            steady when it matters.
          </p>

          {/* Buttons */}
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/shop"
              className="inline-flex items-center rounded-full 
    border border-transparent bg-[#2958A4] 
    text-white text-sm font-medium px-6 py-3 
    transition-colors 
    hover:border-[#2958A4] hover:bg-white hover:text-[#2958A4] delay-75"
            >
              Explore Products
            </Link>
          </div>

        </div>

        {/* RIGHT IMAGE */}
        <div className="shrink-0 mx-auto lg:mx-0">
          <img
            src="/images/hero/"
            alt="Network intro"
            className="w-[645px] h-[447px] object-contain shrink-0"
          />
        </div>
      </div>
      <ProudPartners />
      <WorkWithUsSection />
      <FaqSection />
      <Newsletter />
      
    </section>
  );
}
