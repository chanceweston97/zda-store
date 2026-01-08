import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "@/types/Menu";

type DropdownProps = {
  menuItem: Menu;
  stickyMenu?: boolean;
};

const Dropdown = ({ menuItem, stickyMenu }: DropdownProps) => {
  const pathUrl = usePathname() || "";

  const isActiveParent = pathUrl.includes(
    menuItem.path || menuItem.title.toLowerCase()
  );

  return (
    <li className="group relative">
      {/* TOP-LEVEL MENU LINK (CLICKABLE) */}
      <Link
        href={menuItem.path || "#"}
        className={`
          inline-flex items-center gap-1.5 capitalize
          px-7 text-[18px] font-medium leading-7 tracking-[-0.36px]
          font-satoshi text-[#2958A4] hover:text-[#2958A4]
          xl:py-3
          ${isActiveParent && "text-[#2958A4]!"}
        `}
      >
        <span className={`relative inline-block before:absolute before:bottom-0 before:h-[1px] before:w-0 before:bg-[#2958A4] before:transition-[width,left,right] before:duration-300 before:ease-in-out before:right-0 before:left-auto hover:before:left-0 hover:before:right-auto hover:before:w-full ${isActiveParent ? "before:w-full before:left-0 before:right-auto" : ""}`}>
          {menuItem.title}
        </span>

        {/* CHEVRON ICON THAT ROTATES ON HOVER */}
        <svg
          className="h-5 w-5 text-[#2958A4] transition-transform duration-300 group-hover:rotate-180 shrink-0"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M5 7.5L10 12.5L15 7.5"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </Link>

      {/* DROPDOWN – FADE + SLIDE, HOVER-ONLY, NO GAP */}
      <ul
        className={`
          absolute left-1/2 -translate-x-1/2 top-full z-[1000] w-auto min-w-fit rounded-lg bg-gray-1 p-2 shadow-lg border border-gray-3
          origin-top transition-all duration-300 ease-in-out
          opacity-0 -translate-y-2 pointer-events-none
          group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto
        `}
      >
        {menuItem.submenu?.map((item, i) => {
          const isActiveChild = pathUrl === item.path;
          const hasSubmenu = item.submenu && item.submenu.length > 0;

          return (
            <li 
              key={i} 
              className={hasSubmenu ? "group/submenu relative" : ""}
              ref={(el) => {
                if (hasSubmenu && el) {
                  const dropdown = el.closest('ul');
                  if (dropdown) {
                    const nestedSubmenu = el.querySelector('ul');
                    if (nestedSubmenu) {
                      (nestedSubmenu as HTMLElement).style.minWidth = `${dropdown.clientWidth}px`;
                    }
                  }
                }
              }}
            >
              <Link
                href={item.path || "#"}
                className={`
                  flex items-center gap-1.5 w-full rounded-md px-4 py-2 text-sm text-[#2958A4]
                  transition-colors duration-150
                  hover:bg-gray-100 hover:text-[#2958A4]
                  ${isActiveChild && "bg-gray-100 text-[#2958A4]"}
                `}
              >
                <span className={`relative inline-block before:absolute before:bottom-0 before:h-[1px] before:w-0 before:bg-[#2958A4] before:transition-[width,left,right] before:duration-300 before:ease-in-out before:right-0 before:left-auto hover:before:left-0 hover:before:right-auto hover:before:w-full ${isActiveChild ? "before:w-full before:left-0 before:right-auto" : ""}`}>
                  {item.title}
                </span>
                {hasSubmenu && (
                  <svg
                    className="w-3.5 h-3.5 shrink-0"
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M7.5 5L12.5 10L7.5 15"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </Link>

              {/* NESTED SUBMENU - Connected seamlessly with no gap */}
              {hasSubmenu && (
                <>
                  {/* Hover bridge area */}
                  <div 
                    className="absolute right-0 top-0 bottom-0 w-2 z-[1002]"
                    aria-hidden="true"
                  />
                  <ul
                    className={`
                      absolute left-full top-0 z-[1001] w-auto min-w-[200px] rounded-lg bg-gray-1 p-2 shadow-lg border border-gray-3
                      transition-all duration-300 ease-in-out
                      opacity-0 translate-x-[-8px] pointer-events-none
                      group-hover/submenu:opacity-100 group-hover/submenu:translate-x-0 group-hover/submenu:pointer-events-auto
                    `}
                  >
                  {item.submenu?.map((subItem, j) => {
                    const isActiveSubChild = pathUrl === subItem.path;

                    return (
                      <li key={j} className="whitespace-nowrap">
                        <Link
                          href={subItem.path || "#"}
                          className={`
                            flex items-center w-full rounded-md px-4 py-2 text-sm text-[#2958A4]
                            transition-colors duration-150
                            hover:bg-gray-100 hover:text-[#2958A4]
                            ${isActiveSubChild && "bg-gray-100 text-[#2958A4]"}
                          `}
                        >
                          <span className={`relative inline-block before:absolute before:bottom-0 before:h-[1px] before:w-0 before:bg-[#2958A4] before:transition-[width,left,right] before:duration-300 before:ease-in-out before:right-0 before:left-auto hover:before:left-0 hover:before:right-auto hover:before:w-full ${isActiveSubChild ? "before:w-full before:left-0 before:right-auto" : ""}`}>
                            {subItem.title}
                          </span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
                </>
              )}
            </li>
          );
        })}
      </ul>
    </li>
  );
};

export default Dropdown;
