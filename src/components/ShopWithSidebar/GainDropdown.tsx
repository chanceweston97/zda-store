"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { ChevronDown } from "../Header/icons";

type PropsType = {
  availableGains: string[];
};

export default function GainDropdown({ availableGains }: PropsType) {
  const [isOpen, setIsOpen] = useState(true);

  const router = useRouter();
  const searchParams = useSearchParams() || new URLSearchParams();
  const pathname = usePathname();

  if (!availableGains.length) return null;

  function handleGains(gain: string, isSelected: boolean) {
    const KEY = "gains";

    const params = new URLSearchParams(searchParams);
    const gainsParam = params.get(KEY);

    if (isSelected) {
      params.set(KEY, gainsParam ? `${gainsParam},${gain}` : gain);
    } else {
      const newParam = gainsParam?.split(",").filter((id) => id !== gain);

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
        <span>Gain</span>

        <ChevronDown
          className={`ease-out duration-200 ${isOpen && "rotate-180"}`}
        />
      </button>

      {/* // <!-- dropdown menu --> */}
      <div className="flex flex-wrap gap-2.5 p-6" hidden={!isOpen}>
        {availableGains.map((gain) => (
          <label key={gain} htmlFor={gain} className="cursor-pointer">
            <input
              type="checkbox"
              id={gain}
              className="sr-only peer"
              defaultChecked={searchParams
                .get("gains")
                ?.split(",")
                .includes(gain)}
              onChange={(e) => handleGains(gain, e.target.checked)}
            />

            <span className="text-custom-sm uppercase py-[5px] px-3.5 text-dark bg-gray-2 hover:bg-gray-3 peer-checked:hover:bg-blue peer-checked:bg-blue peer-checked:text-white rounded-full">
              {gain}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}

