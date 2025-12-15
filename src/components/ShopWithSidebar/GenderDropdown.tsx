"use client";

import { useState } from "react";
import { ChevronDown } from "../Header/icons";

const GenderDropdown = ({ genders }: any) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="bg-white rounded-lg shadow-1">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`cursor-pointer flex items-center justify-between py-3 pl-6 pr-5.5 w-full ${
          isOpen && "shadow-filter"
        }`}
      >
        <span className="text-dark">Colors</span>

        <ChevronDown
          className={`text-dark ease-out duration-200 ${
            isOpen && "rotate-180"
          }`}
        />
      </button>

      {/* <!-- dropdown menu --> */}
      <div
        className={`flex-col gap-3 py-6 pl-6 pr-5.5 ${
          isOpen ? "flex" : "hidden"
        }`}
      >
        {genders.map((gender: any, key: number) => (
          <button
            key={key}
            className="flex items-center justify-between duration-200 ease-out group hover:text-blue"
          >
            {gender.name}
            <span className="inline-flex rounded-[30px] bg-gray-2 text-custom-xs px-2 ease-out duration-200 group-hover:text-white group-hover:bg-blue">
              {gender.products}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default GenderDropdown;
