"use client";

import { useState } from "react";
import LocalizedClientLink from "@modules/common/components/localized-client-link";
import { ChevronDown } from "./icons";
import { Menu } from "./menuData";

interface MobileDropdownProps {
  menuItem: Menu;
  onClose: () => void;
}

const MobileDropdown = ({ menuItem, onClose }: MobileDropdownProps) => {
  const [open, setOpen] = useState(false);

  return (
    <li>
      <button
        className="flex items-center w-full gap-2 text-sm cursor-pointer capitalize font-medium text-dark py-2 px-3 rounded-md hover:bg-[#2958A4]/10 hover:text-[#2958A4] transition-colors justify-between"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-controls={`submenu-${menuItem.title}`}
      >
        <span className="flex items-center gap-2">{menuItem.title}</span>

        {menuItem.submenu && (
          <span
            className={`transform transition-transform duration-300 ease-in-out text-[#2958A4] ${open ? "rotate-180" : "rotate-0"}`}
          >
            <ChevronDown />
          </span>
        )}
      </button>
      {menuItem.submenu && (
        <ul
          id={`submenu-${menuItem.title}`}
          className={`ml-6 mt-1 flex flex-col gap-1 overflow-hidden transition-all duration-300 ease-in-out ${
            open ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          {menuItem.submenu.map((sub, idx) =>
            sub.submenu ? (
              <MobileDropdown key={idx} menuItem={sub} onClose={onClose} />
            ) : (
              <li key={idx}>
                <LocalizedClientLink
                  href={sub.path!}
                  className="flex items-center gap-2 text-sm font-medium text-dark py-2 px-3 rounded-md hover:bg-[#2958A4]/10 hover:text-[#2958A4] transition-colors"
                  onClick={onClose}
                >
                  {sub.title}
                </LocalizedClientLink>
              </li>
            )
          )}
        </ul>
      )}
    </li>
  );
};

export default MobileDropdown;


