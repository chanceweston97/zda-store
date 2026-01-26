"use client";
import { CartIcon, HeartIcon, SearchIcon } from "@/assets/icons";
import { ButtonArrowHomepage } from "../Common/ButtonArrowHomepage";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useShoppingCart } from "use-shopping-cart";
import GlobalSearchModal from "../Common/GlobalSearch";
import CustomSelect from "./CustomSelect";
import Dropdown from "./Dropdown";
import MobileDropdown from "./MobileDropdown";
import { menuData as staticMenuData } from "./menuData";
import { useAppSelector } from "@/redux/store";
import { Menu } from "@/types/Menu";

const Header = () => {
  const [menuData, setMenuData] = useState<Menu[]>(staticMenuData);
  const [navigationOpen, setNavigationOpen] = useState(false);
  const [stickyMenu, setStickyMenu] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const { data: session } = useSession();

  const { handleCartClick, cartCount, totalPrice } = useShoppingCart();
  const wishlistItems = useAppSelector((state) => state.wishlistReducer.items);
  const wishlistCount = wishlistItems?.length || 0;

  const handleOpenCartModal = () => {
    handleCartClick();
  };

  // Sticky menu
  const handleStickyMenu = () => {
    if (window.scrollY >= 80) {
      setStickyMenu(true);
    } else {
      setStickyMenu(false);
    }
  };

  // Fetch menu data from API on mount
  useEffect(() => {
    async function fetchMenuData() {
      try {
        console.log('[Header] Fetching menu from /api/menu...');
        
        // Use AbortController for timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout
        
        try {
          const response = await fetch('/api/menu', {
            signal: controller.signal,
          });
          clearTimeout(timeoutId);
          
          console.log('[Header] Menu API response status:', response.status);
          
          if (response.ok) {
            const data = await response.json();
            console.log('[Header] Menu API returned data:', {
              isArray: Array.isArray(data),
              length: data?.length,
              firstItem: data?.[0],
            });
            
            if (data && Array.isArray(data) && data.length > 0) {
              console.log('[Header] Updating menu with', data.length, 'items');
              setMenuData(data);
            } else {
              console.warn('[Header] Menu API returned empty or invalid data, keeping static menu');
            }
          } else {
            console.error('[Header] Menu API returned error status:', response.status);
            // Swallow error - keep static menu
          }
        } catch (fetchError: any) {
          clearTimeout(timeoutId);
          if (fetchError?.name === 'AbortError') {
            console.warn('[Header] Menu fetch timed out, keeping static menu');
          } else {
            console.error('[Header] Error fetching menu:', fetchError);
          }
          // Swallow error - keep static menu
        }
      } catch (error) {
        console.error('[Header] Error fetching menu:', error);
        // Swallow error - keep static menu
      }
    }

    fetchMenuData();
  }, []);

  useEffect(() => {
    setIsMounted(true);
    window.addEventListener("scroll", handleStickyMenu);
    return () => window.removeEventListener("scroll", handleStickyMenu);
  }, []);

  return (
    <>
      <header
        className={`fixed left-0 top-0 w-full z-999 bg-white transition-shadow ease-in-out duration-300 ${stickyMenu ? "shadow-sm" : ""}`}
        style={{ height: '80px', display: 'flex', alignItems: 'center' }}
      >
        <div className="w-full px-4 mx-auto max-w-[1340px] sm:px-6 xl:px-0 h-full flex items-center">
          {/* <!-- header top start --> */}
          <div
            className="flex flex-col lg:flex-row gap-5 items-center xl:justify-between ease-out duration-200 w-full"
            style={{ paddingTop: '0', paddingBottom: '0' }}
          >
            {/* <!-- header top left --> */}
            <div className="flex w-full items-center justify-between gap-4 lg:relative">
              {/* Logo */}
              <div className="flex-shrink-0">
                <Link className="shrink-0" href="/">
                  <Image
                    src="/images/logo/logo.png"
                    alt="Logo"
                    width={111}
                    height={46}
                    className="h-auto w-auto"
                  />
                </Link>
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
                          <Link
                            href={menuItem.path!}
                            className="relative inline-flex hover:text-[#2958A4] text-[#2958A4] px-7 font-satoshi text-[18px] font-medium leading-7 tracking-[-0.36px] xl:py-3 before:absolute before:bottom-2 before:h-[1px] before:w-0 before:bg-[#2958A4] before:transition-[width,left,right] before:duration-300 before:ease-in-out before:right-7 before:left-auto hover:before:left-7 hover:before:right-auto hover:before:w-[calc(100%-3.5rem)]"
                          >
                            {menuItem.title}
                          </Link>
                        </li>
                      )
                    )}
                  </ul>
                </nav>
                {/* //   <!-- Main Nav End --> */}
              </div>

              {/* Right side buttons - Contact + Cart + Mobile Hamburger */}
              <div className="flex items-center gap-2 sm:gap-3">
                {/* Contact Button - Hidden on mobile/tablet, visible on xl+ */}
                <Link
                  href="/contact"
                  className="hidden xl:inline-flex btn filled group relative items-center justify-center rounded-[10px] border border-transparent bg-[#2958A4] text-white text-[14px] sm:text-[16px] font-medium transition-all duration-300 ease-in-out hover:bg-[#214683]"
                  style={{ 
                    fontFamily: 'Satoshi, sans-serif',
                    padding: '10px 30px',
                    paddingRight: '30px',
                    cursor: 'pointer',
                    width: '140px',
                    minWidth: '140px',
                    height: '46px'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.paddingRight = 'calc(30px + 17px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.paddingRight = '30px';
                  }}
                >
                  <ButtonArrowHomepage />
                  <p className="transition-transform duration-300 ease-in-out group-hover:translate-x-[11px] m-0">Contact</p>
                </Link>

                {/* Cart Icon Button - Visible on all screens */}
                <button
                  onClick={handleOpenCartModal}
                  aria-label="Open cart"
                  className="relative w-10 h-10 flex items-center justify-center text-[#2958A4] hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Image
                    src="/images/icons/cart.svg"
                    alt="Cart"
                    width={24}
                    height={24}
                    className="w-6 h-6"
                  />
                  {isMounted && typeof cartCount === 'number' && cartCount > 0 && (
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
              <Link href="/">
                <Image
                  src="/images/logo/logo.png"
                  alt="Logo"
                  width={111}
                  height={46}
                />
              </Link>
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
                  transform="rotate(0 0 0)"
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
                      <Link
                        href={menuItem.path!}
                        className="flex items-center gap-2 text-sm font-medium text-dark py-2 px-3 rounded-md hover:bg-[#2958A4]/10 hover:text-[#2958A4] transition-colors"
                        onClick={() => setNavigationOpen(false)}
                      >
                        {menuItem.title}
                      </Link>
                    </li>
                  )
                )}
                {/* Contact Button in Mobile Menu */}
                <li
                  className={`transform transition-all duration-300 ease-out ${navigationOpen
                    ? "translate-x-0 opacity-100"
                    : "translate-x-4 opacity-0"
                    }`}
                  style={{
                    transitionDelay: navigationOpen ? `${menuData.length * 50}ms` : "0ms",
                  }}
                >
                  <Link
                    href="/contact"
                    className="btn filled group relative inline-flex items-center justify-center rounded-[10px] border border-transparent bg-[#2958A4] text-white text-[14px] sm:text-[16px] font-medium transition-all duration-300 ease-in-out hover:bg-[#214683] mt-2"
                    style={{ 
                      fontFamily: 'Satoshi, sans-serif',
                      padding: '10px 30px',
                      paddingRight: '30px',
                      cursor: 'pointer',
                      width: '140px',
                      minWidth: '140px'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.paddingRight = 'calc(30px + 17px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.paddingRight = '30px';
                    }}
                    onClick={() => setNavigationOpen(false)}
                  >
                    <ButtonArrowHomepage />
                    <p className="transition-transform duration-300 ease-in-out group-hover:translate-x-[11px] m-0">Contact</p>
                  </Link>
                </li>
              </ul>
            </nav>{" "}

          </aside>
        </div>
      </header>

      {searchModalOpen && (
        <GlobalSearchModal
          searchModalOpen={searchModalOpen}
          setSearchModalOpen={setSearchModalOpen}
        />
      )}
    </>
  );
};

export default Header;
