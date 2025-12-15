"use client";
import { imageBuilder } from "@/lib/data/shop-utils";
import { Countdown } from "@/types/countdown";
import Image from "next/image";
import Link from "next/link";
import { CountdownTimer } from "./CountdownTimer";

interface CountdownBannerProps {
  data: Countdown;
}

const CountdownBanner = ({ data }: CountdownBannerProps) => {
  if (!data) return null;

  return (
    <section className="overflow-hidden py-20">
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 xl:px-0 ">
        <div className="relative overflow-hidden z-1 rounded-lg bg-[#D0E9F3] p-4 sm:p-7.5 lg:p-10 xl:p-15">
          <div className="max-w-[422px] w-full">
            <span className="block font-medium text-custom-1 text-blue mb-2.5">
              {data.subtitle}
            </span>

            <h2 className="font-bold text-dark text-xl lg:text-heading-4 xl:text-heading-3 mb-3">
              {data.title}
            </h2>

            <p>{data.product?.name}</p>

            <CountdownTimer />

            <Link
              href="#"
              className="inline-flex font-medium text-custom-sm text-white bg-blue py-3 px-9.5 rounded-full ease-out duration-200 hover:bg-blue-dark mt-7.5"
            >
              Check it Out!
            </Link>
          </div>

          <BackgroundImages data={data} />
        </div>
      </div>
    </section>
  );
};

const BackgroundImages = ({ data }: CountdownBannerProps) => (
  <>
    <Image
      src="/images/countdown/countdown-bg.png"
      alt="bg shapes"
      className="hidden sm:block absolute right-0 bottom-0 -z-1"
      width={737}
      height={482}
    />
    <Image
      src={imageBuilder(data.image).url()!}
      alt="product"
      className="hidden lg:block absolute right-4 xl:right-33 bottom-4 xl:bottom-10 -z-1"
      width={411}
      height={376}
    />
  </>
);

export default CountdownBanner;
