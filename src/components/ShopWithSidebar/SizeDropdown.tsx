"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { ChevronDown } from "../Header/icons";

type PropsType = {
  availableSizes: string[];
};

export default function SizeDropdown({ availableSizes }: PropsType) {
  const [isOpen, setIsOpen] = useState(true);

  const router = useRouter();
  const searchParams = useSearchParams() || new URLSearchParams();
  const pathname = usePathname();

  if (!availableSizes.length) return null;

  function handleSizes(size: string, isSelected: boolean) {
    const KEY = "sizes";

    const params = new URLSearchParams(searchParams);
    const sizesParam = params.get(KEY);

    if (isSelected) {
      params.set(KEY, sizesParam ? `${sizesParam},${size}` : size);
    } else {
      const newParam = sizesParam?.split(",").filter((id) => id !== size);

      if (newParam?.length) {
        params.set(KEY, newParam.join(","));
      } else {
        params.delete(KEY);
      }
    }

    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  return (
    <div className="bg-white rounded-lg shadow-1">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between py-3 pl-6 pr-5.5 text-dark ${
          isOpen && "shadow-filter"
        }`}
      >
        <span>Size</span>

        <ChevronDown
          className={`ease-out duration-200 ${isOpen && "rotate-180"}`}
        />
      </button>

      {/* // <!-- dropdown menu --> */}
      <div className="flex flex-wrap gap-2.5 p-6" hidden={!isOpen}>
        {availableSizes.map((size) => (
          <label key={size} htmlFor={size} className="cursor-pointer">
            <input
              type="checkbox"
              id={size}
              className="sr-only peer"
              defaultChecked={searchParams
                .get("sizes")
                ?.split(",")
                .includes(size)}
              onChange={(e) => handleSizes(size, e.target.checked)}
            />

            <span className="text-custom-sm uppercase py-[5px] px-3.5 text-dark bg-gray-2 hover:bg-gray-3 peer-checked:hover:bg-blue peer-checked:bg-blue peer-checked:text-white rounded-full">
              {size}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}
