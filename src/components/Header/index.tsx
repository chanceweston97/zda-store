"use client";

import { CartIcon } from "./icons";
import Image from "next/image";
import { useEffect, useState } from "react";
import Dropdown from "./Dropdown";
import MobileDropdown from "./MobileDropdown";
import { menuData } from "./menuData";
import { HttpTypes } from "@medusajs/types";
import LocalizedClientLink from "@modules/common/components/localized-client-link";
import { useCartSidebar } from "@components/Common/CartSidebar/CartSidebarProvider";

type HeaderProps = {
  cart?: HttpTypes.StoreCart | null;
};

const Header = ({ cart }: HeaderProps) => {
  const [navigationOpen, setNavigationOpen] = useState(false);
  const [stickyMenu, setStickyMenu] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const { openCart } = useCartSidebar();

  const cartCount = cart?.items?.reduce((acc, item) => acc + item.quantity, 0) || 0;

  // Sticky menu
  const handleStickyMenu = () => {
    if (window.scrollY >= 80) {
      setStickyMenu(true);
    } else {
      setStickyMenu(false);
    }
  };

  useEffect(() => {
    setIsMounted(true);
    window.addEventListener("scroll", handleStickyMenu);
    return () => window.removeEventListener("scroll", handleStickyMenu);
  }, []);

  return (
    <>
      <header
        className={`fixed left-0 top-0 w-full z-[999] bg-white transition-shadow ease-in-out duration-300 ${stickyMenu ? "shadow-sm" : ""}`}
      >
        <div className="w-full px-4 mx-auto max-w-[1340px] sm:px-6 xl:px-0">
          {/* <!-- header top start --> */}
          <div
            className="flex flex-col lg:flex-row gap-5 items-end lg:items-center xl:justify-between ease-out duration-200 py-6"
          >
            {/* <!-- header top left --> */}
            <div className="flex w-full items-center justify-between gap-4 lg:relative">
              {/* Logo */}
              <div className="flex-shrink-0">
                <LocalizedClientLink className="shrink-0" href="/">
                  <Image
                    src="/images/logo/logo.png"
                    alt="Logo"
                    width={147}
                    height={61}
                    className="h-auto w-auto max-w-[120px] sm:max-w-[147px]"
                  />
                </LocalizedClientLink>
              </div>

              {/* Desktop Navigation - Hidden on mobile/tablet */}
              <div className="hidden xl:flex items-center justify-center flex-1">
                {/* <!-- Main Nav Start --> */}
                <nav>
                  <ul className="flex items-center gap-4">
                    {menuData.map((menuItem, i) =>
                      menuItem.submenu ? (
                        <Dropdown
                          key={i}
                          menuItem={menuItem}
                          stickyMenu={stickyMenu}
                        />
                      ) : (
                        <li key={i} className="group relative">
                          <LocalizedClientLink
                            href={menuItem.path!}
                            className="relative inline-flex hover:text-[#2958A4] text-[#2958A4] px-7 font-satoshi text-[18px] font-medium leading-7 tracking-[-0.36px] xl:py-3 before:absolute before:left-7 before:bottom-2 before:h-[2px] before:w-0 before:bg-[#2958A4] before:transition-all before:duration-300 before:ease-out hover:before:w-[calc(100%-3.5rem)]"
                          >
                            {menuItem.title}
                          </LocalizedClientLink>
                        </li>
                      )
                    )}
                  </ul>
                </nav>
                {/* //   <!-- Main Nav End --> */}
              </div>

              {/* Right side buttons - Cart + Mobile Hamburger */}
              <div className="flex items-center gap-2 sm:gap-3">
                {/* Cart Icon Button - Visible on all screens */}
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    openCart();
                  }}
                  className="relative w-10 h-10 flex items-center justify-center text-[#2958A4] hover:bg-gray-100 rounded-lg transition-colors"
                  aria-label="Open cart"
                >
                  <CartIcon className="w-6 h-6" />
                  {isMounted && cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 bg-[#2958A4] text-white text-xs font-medium rounded-full">
                      {cartCount > 99 ? "99+" : cartCount}
                    </span>
                  )}
                </button>

                {/* Hamburger Toggle BTN - Visible on mobile/tablet, hidden on xl+ */}
                <button
                  id="Toggle"
                  aria-label="Toggle menu"
                  className="xl:hidden w-10 h-10 bg-transparent rounded-lg inline-flex items-center cursor-pointer justify-center hover:bg-gray-2 transition-colors"
                  onClick={() => setNavigationOpen(!navigationOpen)}
                >
                  <span className="flex h-7 w-7 items-center justify-center text-[#2958A4] transition-transform duration-200">
                    {navigationOpen ? (
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                          d="M6.21967 7.28033C5.92678 6.98744 5.92678 6.51256 6.21967 6.21967C6.51256 5.92678 6.98744 5.92678 7.28033 6.21967L11.999 10.9384L16.7176 6.2198C17.0105 5.92691 17.4854 5.92691 17.7782 6.2198C18.0711 6.51269 18.0711 6.98757 17.7782 7.28046L13.0597 11.999L17.7782 16.7176C18.0711 17.0105 18.0711 17.4854 17.7782 17.7782C17.4854 18.0711 17.0105 18.0711 16.7176 17.7782L11.999 13.0597L7.28033 17.7784C6.98744 18.0713 6.51256 18.0713 6.21967 17.7784C5.92678 17.4855 5.92678 17.0106 6.21967 16.7177L10.9384 11.999L6.21967 7.28033Z"
                          fill="currentColor"
                        />
                      </svg>
                    ) : (
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M3 12H21M3 6H21M3 18H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </span>
                </button>
              </div>
            </div>
          </div>
          {/* <!-- header top end --> */}
        </div>

        {/* Offcanvas Mobile Menu (Mobile Only) */}
        <div
          className={`fixed inset-0 z-[998] xl:hidden transition-all duration-300 ${navigationOpen ? "visible opacity-100" : "invisible opacity-0"}`}
        >
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-dark/70 backdrop-blur-sm transition-opacity duration-300"
            onClick={() => setNavigationOpen(false)}
          ></div>
          {/* Sidebar */}
          <aside
            className={`fixed top-0 right-0 z-[999] h-full w-80 max-w-full bg-white shadow-2xl flex flex-col transition-all duration-300 ease-out transform ${navigationOpen ? "translate-x-0" : "translate-x-full"
              }`}
            style={{
              transitionDelay: navigationOpen ? "0ms" : "50ms",
            }}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-3">
              <LocalizedClientLink href="/">
                <Image
                  src="/images/logo/logo.png"
                  alt="Logo"
                  width={130}
                  height={28}
                />
              </LocalizedClientLink>
              <button
                aria-label="Close menu"
                className="w-10 h-10 bg-transparent text-dark-2 rounded-lg inline-flex items-center cursor-pointer justify-center hover:bg-gray-2"
                onClick={() => setNavigationOpen(false)}
              >
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M6.21967 7.28033C5.92678 6.98744 5.92678 6.51256 6.21967 6.21967C6.51256 5.92678 6.98744 5.92678 7.28033 6.21967L11.999 10.9384L16.7176 6.2198C17.0105 5.92691 17.4854 5.92691 17.7782 6.2198C18.0711 6.51269 18.0711 6.98757 17.7782 7.28046L13.0597 11.999L17.7782 16.7176C18.0711 17.0105 18.0711 17.4854 17.7782 17.7782C17.4854 18.0711 17.0105 18.0711 16.7176 17.7782L11.999 13.0597L7.28033 17.7784C6.98744 18.0713 6.51256 18.0713 6.21967 17.7784C5.92678 17.4855 5.92678 17.0106 6.21967 16.7177L10.9384 11.999L6.21967 7.28033Z"
                    fill="currentColor"
                  />
                </svg>
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto px-3 py-4">
              <ul className="flex flex-col gap-1">
                {menuData.map((menuItem, i) =>
                  menuItem.submenu ? (
                    <MobileDropdown
                      key={i}
                      menuItem={menuItem}
                      onClose={() => setNavigationOpen(false)}
                    />
                  ) : (
                    <li
                      key={i}
                      className={`transform transition-all duration-300 ease-out ${navigationOpen
                        ? "translate-x-0 opacity-100"
                        : "translate-x-4 opacity-0"
                        }`}
                      style={{
                        transitionDelay: navigationOpen ? `${i * 50}ms` : "0ms",
                      }}
                    >
                      <LocalizedClientLink
                        href={menuItem.path!}
                        className="flex items-center gap-2 text-sm font-medium text-dark py-2 px-3 rounded-md hover:bg-[#2958A4]/10 hover:text-[#2958A4] transition-colors"
                        onClick={() => setNavigationOpen(false)}
                      >
                        {menuItem.title}
                      </LocalizedClientLink>
                    </li>
                  )
                )}
              </ul>
            </nav>
          </aside>
        </div>
      </header>
    </>
  );
};

export default Header;


