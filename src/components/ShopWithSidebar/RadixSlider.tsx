import * as Slider from "@radix-ui/react-slider";
import { useState } from "react";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import "./RangeSliderCSS.css";
import { ChevronDown } from "../Header/icons";

type PropsType = {
  highestPrice: number;
};

export default function RadixSlider({ highestPrice }: PropsType) {
  const [isOpen, setIsOpen] = useState(true);

  const router = useRouter();
  const searchParams = useSearchParams() || new URLSearchParams();
  const pathname = usePathname();

  const maxPrice = Number(searchParams.get("maxPrice")) || highestPrice;
  const minPrice = Number(searchParams.get("minPrice")) || 0;

  const [value, setValue] = useState([minPrice, maxPrice]);

  function handlePriceRange(range: number[]) {
    const params = new URLSearchParams(searchParams);

    if (range[0] !== minPrice) {
      params.set("minPrice", String(range[0]));
    }

    if (range[1] !== maxPrice) {
      params.set("maxPrice", String(range[1]));
    }

    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  return (
    <div className="bg-white rounded-lg shadow-1">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`cursor-pointer flex items-center justify-between py-3 pl-6 pr-5.5 w-full ${
          isOpen && "shadow-filter"
        }`}
      >
        <span className="text-dark">Price</span>

        <ChevronDown
          className={`text-dark ease-out duration-200 ${
            isOpen && "rotate-180"
          }`}
        />
      </button>

      {/* // <!-- dropdown menu --> */}
      <div className="p-6 mt-7.5" hidden={!isOpen}>
        <div id="pricingOne">
          <div className="price-range">
            <Slider.Root
              className="slider-root"
              min={0}
              max={highestPrice}
              value={value}
              onValueChange={setValue}
              onValueCommit={handlePriceRange}
            >
              <Slider.Track className="slider-track">
                <Slider.Range className="slider-range" />
              </Slider.Track>
              <Slider.Thumb className="slider-thumb" />
              <Slider.Thumb className="slider-thumb" />
            </Slider.Root>

            <div className="flex items-center justify-between pt-4 price-amount">
              <div className="flex border rounded-sm text-custom-xs text-dark-4 border-gray-3/80">
                <span className="block border-r border-gray-3/80 px-2.5 py-1.5">
                  $
                </span>
                <span id="minAmount" className="block px-3 py-1.5">
                  {value[0]}
                </span>
              </div>

              <div className="flex border rounded-sm text-custom-xs text-dark-4 border-gray-3/80">
                <span className="block border-r border-gray-3/80 px-2.5 py-1.5">
                  $
                </span>
                <span id="maxAmount" className="block px-3 py-1.5">
                  {value[1]}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
