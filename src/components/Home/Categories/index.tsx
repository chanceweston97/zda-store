"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";

// Import Swiper styles
import { ChevronLeftIcon, ChevronRightIcon } from "@/assets/icons";
import { useGetCategoriesQuery } from "@/redux/features/api/category";
import "swiper/css";
import "swiper/css/navigation";
import SingleItem from "./SingleItem";

const Categories = () => {
  const sliderRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isEnd, setIsEnd] = useState(false);

  const { data = [] } = useGetCategoriesQuery();

  const handlePrev = useCallback(() => {
    if (!sliderRef.current) return;
    // @ts-ignore
    sliderRef.current.swiper.slidePrev();
  }, []);

  const handleNext = useCallback(() => {
    if (!sliderRef.current) return;
    // @ts-ignore
    sliderRef.current.swiper.slideNext();
  }, []);

  useEffect(() => {
    if (sliderRef.current) {
      // @ts-ignore
      sliderRef.current.swiper.init();
    }
  }, []);

  const onSlideChange = useCallback(() => {
    // @ts-ignore
    if (sliderRef.current?.swiper) {
      // @ts-ignore
      setCurrentIndex(sliderRef.current.swiper.activeIndex);
      // @ts-ignore
      setIsEnd(sliderRef.current.swiper.isEnd);
    }
  }, []);

  return (
    <section className="overflow-hidden ">
      <div className="w-full px-4 mx-auto border-b max-w-7xl sm:px-6 xl:px-0 pb-15 border-gray-3">
        <div className="swiper categories-carousel common-carousel">
          {/* <!-- section title --> */}
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-xl font-semibold xl:text-heading-5 text-dark">
                Browse by Category
              </h2>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handlePrev}
                className={`swiper-button-prev ${
                  currentIndex === 0 ? "opacity-50 pointer-events-none" : ""
                }`}
                aria-label="previous button"
                disabled={currentIndex === 0}
              >
                <ChevronLeftIcon />
              </button>

              <button
                onClick={handleNext}
                aria-label="next button"
                className={`swiper-button-next ${
                  isEnd ? "opacity-50 pointer-events-none" : ""
                }`}
                disabled={isEnd}
              >
                <ChevronRightIcon />
              </button>
            </div>
          </div>

          <Swiper
            ref={sliderRef}
            onSlideChange={onSlideChange}
            slidesPerView={6}
            breakpoints={{
              // when window width is >= 640px
              0: {
                slidesPerView: 2,
              },
              1000: {
                slidesPerView: 4,
                // spaceBetween: 4,
              },
              // when window width is >= 768px
              1200: {
                slidesPerView: 6,
              },
            }}
          >
            {data.map((item) => (
              <SwiperSlide key={item._id}>
                <SingleItem item={item} />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </section>
  );
};

export default Categories;
