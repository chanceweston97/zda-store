"use client";
import ProductItem from "@/components/Common/ProductItem";
import Image from "next/image";

import { ChevronLeftIcon, ChevronRightIcon } from "@/assets/icons";
import { useGetProductsQuery } from "@/redux/features/api/product";
import { useCallback, useRef } from "react";
import "swiper/css";
import "swiper/css/navigation";
import { Swiper, SwiperRef, SwiperSlide } from "swiper/react";

const RecentlyViewedItems = () => {
  const { data: products } = useGetProductsQuery(6);

  const sliderRef = useRef<SwiperRef>(null);

  const handlePrev = useCallback(() => {
    if (!sliderRef.current) return;

    sliderRef.current.swiper?.slidePrev();
  }, []);

  const handleNext = useCallback(() => {
    if (!sliderRef.current) return;

    sliderRef.current.swiper.slideNext();
  }, []);

  return (
    <section className="overflow-hidden pt-17.5">
      <div className="w-full px-4 mx-auto border-b max-w-7xl sm:px-6 xl:px-0 pb-15 border-gray-3">
        <div className="swiper categories-carousel common-carousel">
          {/* <!-- section title --> */}
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-xl font-semibold xl:text-heading-5 text-dark">
                Recently Viewed Products
              </h2>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handlePrev}
                className="swiper-button-prev"
                aria-label="previous button"
              >
                <ChevronLeftIcon />
              </button>

              <button
                onClick={handleNext}
                className="swiper-button-next"
                aria-label="next button"
              >
                <ChevronRightIcon />
              </button>
            </div>
          </div>

          <Swiper
            ref={sliderRef}
            slidesPerView={4}
            spaceBetween={20}
            className="justify-between"
          >
            {products?.map((item, key) => (
              <SwiperSlide key={key}>
                <ProductItem item={item} />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </section>
  );
};

export default RecentlyViewedItems;
