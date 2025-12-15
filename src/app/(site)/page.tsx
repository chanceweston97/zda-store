import Newsletter from "@/components/Common/Newsletter";
import BestSeller from "@/components/Home/BestSeller";
import Categories from "@/components/Home/Categories";
import CountDown from "@/components/Home/Countdown";
import FaqSection from "@/components/Home/Faq";
import Hero from "@/components/Home/Hero";
import NewArrival from "@/components/Home/NewArrivals";
import PromoBanner from "@/components/Home/PromoBanner";
import Testimonials from "@/components/Home/Testimonials";
import { getFaq } from "@/lib/data/shop-utils";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ZDAComm |  Store",
  description: "This is Home for ZDAComm Store",
  // other metadata
};

export default async function HomePage() {
  const faqData = await getFaq();

  return (
    <main>
      <Hero />
      <FaqSection faqData={faqData} />
      {/* <Categories />
      <NewArrival />
      <PromoBanner />
      <BestSeller />
      <CountDown />
      <Testimonials /> */}
      <Newsletter />

    </main>
  );
}
