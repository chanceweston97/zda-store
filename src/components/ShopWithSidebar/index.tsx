"use client";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import Breadcrumb from "../Common/Breadcrumb";
import CategoryDropdown from "./CategoryDropdown";
import ClearFilters from "./ClearFilters";
import SizeDropdown from "./SizeDropdown";
import SubcategoryFilter from "./SubcategoryFilter";

// Products Hero Section Component (like Company page "Built to connect")
function ProductsHeroSection() {
  const titleRef = useScrollAnimation({ threshold: 0.2 });
  const dividerRef = useScrollAnimation({ threshold: 0.2 });
  const descriptionRef = useScrollAnimation({ threshold: 0.2 });

  return (
    <section 
      className="w-full flex flex-col md:flex-row justify-center items-center relative overflow-hidden p-5 md:p-[50px]"
      style={{
        display: 'flex',
        width: '100%',
        margin: '0 auto',
        marginTop: '80px',
        alignItems: 'center',
        height: '350px',
        background: 'radial-gradient(143.61% 142.34% at 55.45% -16%, #2958A4 34.13%, #1870D5 74.53%, #70C8FF 100%)'
      }}
    >
      {/* Dot Background SVG */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <Image
          src="/images/dot-bg-global.svg"
          alt=""
          fill
          className="object-cover"
          style={{ mixBlendMode: 'overlay' }}
        />
      </div>

      <div
        className="relative z-10 flex flex-col md:flex-row items-center p-5 md:p-[50px]"
        style={{
          display: 'flex',
          width: '1440px',
          maxWidth: '100%',
          alignItems: 'center'
        }}
      >
        {/* Left: "Products" */}
        <div 
          ref={titleRef.ref}
          className={`transition-all ease-out flex items-center justify-center md:justify-start md:mr-[250px] ${
            titleRef.isVisible 
              ? 'opacity-100 translate-y-0' 
              : 'opacity-0 translate-y-8'
          }`}
          style={{ 
            transitionDuration: '600ms',
            height: '100%'
          }}
        >
          <h1 
            className="md:whitespace-nowrap text-center md:text-left text-[40px] md:text-[60px] leading-[45px] md:leading-[50px] tracking-[-1.6px] md:tracking-[-2.4px]"
            style={{
              color: '#FFF',
              fontFamily: 'Satoshi, sans-serif',
              fontStyle: 'normal',
              fontWeight: 400,
              margin: 0
            }}
          >
            Products
          </h1>
        </div>

        {/* Divider */}
        <div 
          className="hidden md:flex items-center"
          style={{ height: '100%' }}
        >
          <div 
            ref={dividerRef.ref}
            className={`transition-all duration-1000 ease-out delay-300 ${
              dividerRef.isVisible 
                ? 'opacity-100 translate-y-0' 
                : 'opacity-0 translate-y-full'
            }`}
            style={{
              width: '1px',
              height: '250px',
              background: '#FFF',
              flexShrink: 0,
              display: 'block'
            }}
          />
        </div>

        {/* Right: Description */}
        <div 
          ref={descriptionRef.ref}
          className={`transition-all duration-1000 ease-out delay-500 flex items-center md:ml-[80px] ${
            descriptionRef.isVisible 
              ? 'opacity-100 translate-x-0' 
              : 'opacity-0 -translate-x-8'
          }`}
          style={{
            width: '100%',
            maxWidth: '477px',
            flexShrink: 0,
            height: '100%'
          }}
        >
          <p 
            className="text-[16px] md:text-[20px] leading-[24px] md:leading-[26px] text-center md:text-left"
            style={{
              color: '#FFF',
              fontFamily: 'Satoshi, sans-serif',
              fontStyle: 'normal',
              fontWeight: 400,
              margin: 0
            }}
          >
            Delivering engineered wireless connectivity solutions that provide consistent performance, reliability, and efficiency for critical communications networks.
          </p>
        </div>
      </div>
    </section>
  );
}

// Category Hero Section Component (like Company page "Built to connect")
function CategoryHeroSection({ categoryName }: { categoryName: string }) {
  const titleRef = useScrollAnimation({ threshold: 0.2 });
  const dividerRef = useScrollAnimation({ threshold: 0.2 });
  const descriptionRef = useScrollAnimation({ threshold: 0.2 });

  // Default description - can be customized per category later
  const description = "Delivering engineered wireless connectivity solutions that provide consistent performance, reliability, and efficiency for critical communications networks.";

  return (
    <section 
      className="w-full flex flex-col md:flex-row justify-center items-center relative overflow-hidden p-5 md:p-[50px]"
      style={{
        display: 'flex',
        width: '100%',
        margin: '0 auto',
        marginTop: '80px',
        alignItems: 'center',
        height: '350px',
        background: 'radial-gradient(143.61% 142.34% at 55.45% -16%, #2958A4 34.13%, #1870D5 74.53%, #70C8FF 100%)'
      }}
    >
      {/* Dot Background SVG */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <Image
          src="/images/dot-bg-global.svg"
          alt=""
          fill
          className="object-cover"
          style={{ mixBlendMode: 'overlay' }}
        />
      </div>

      <div
        className="relative z-10 flex flex-col md:flex-row items-center p-5 md:p-[50px]"
        style={{
          display: 'flex',
          width: '1440px',
          maxWidth: '100%',
          alignItems: 'center'
        }}
      >
        {/* Left: Category Name */}
        <div 
          ref={titleRef.ref}
          className={`transition-all ease-out flex items-center justify-center md:justify-start md:mr-[250px] ${
            titleRef.isVisible 
              ? 'opacity-100 translate-y-0' 
              : 'opacity-0 translate-y-8'
          }`}
          style={{ 
            transitionDuration: '600ms',
            height: '100%'
          }}
        >
          <h1 
            className="md:whitespace-nowrap text-center md:text-left text-[40px] md:text-[60px] leading-[45px] md:leading-[50px] tracking-[-1.6px] md:tracking-[-2.4px]"
            style={{
              color: '#FFF',
              fontFamily: 'Satoshi, sans-serif',
              fontStyle: 'normal',
              fontWeight: 400,
              margin: 0
            }}
          >
            {categoryName}
          </h1>
        </div>

        {/* Divider - Blue/White */}
        <div 
          className="hidden md:flex items-center"
          style={{ height: '100%' }}
        >
          <div 
            ref={dividerRef.ref}
            className={`transition-all duration-1000 ease-out delay-300 ${
              dividerRef.isVisible 
                ? 'opacity-100 translate-y-0' 
                : 'opacity-0 translate-y-full'
            }`}
            style={{
              width: '1px',
              height: '250px',
              background: '#FFF',
              flexShrink: 0,
              display: 'block'
            }}
          />
        </div>

        {/* Right: Description */}
        <div 
          ref={descriptionRef.ref}
          className={`transition-all duration-1000 ease-out delay-500 flex items-center md:ml-[80px] ${
            descriptionRef.isVisible 
              ? 'opacity-100 translate-x-0' 
              : 'opacity-0 -translate-x-8'
          }`}
          style={{
            width: '100%',
            maxWidth: '477px',
            flexShrink: 0,
            height: '100%'
          }}
        >
          <p 
            className="text-[16px] md:text-[20px] leading-[24px] md:leading-[26px] text-center md:text-left"
            style={{
              color: '#FFF',
              fontFamily: 'Satoshi, sans-serif',
              fontStyle: 'normal',
              fontWeight: 400,
              margin: 0
            }}
          >
            {description}
          </p>
        </div>
      </div>
    </section>
  );
}

import {
  SidebarToggleIcon,
} from "@/assets/icons";
import { Category } from "@/types/category";
import { Product } from "@/types/product";
import SingleListItem from "../Shop/SingleListItem";
import ProductsEmptyState from "./ProductsEmptyState";
import TopBar from "./TopBar";
import Pagination from "../Common/Pagination";

type PropsType = {
  data: {
    allProducts: Product[];
    products: Product[];
    categories: Category[];
    allProductsCount: number;
    currentCategory?: Category | null; // Optional: current category for subcategories display
  };
  categoryName?: string; // Optional: category name for hero section (from category page)
};

const PRODUCTS_PER_PAGE = 9;

const ShopWithSidebar = ({ data, categoryName: categoryNameProp }: PropsType) => {
  const { allProducts, products, categories, allProductsCount, currentCategory } = data;
  const searchParams = useSearchParams();

  // Always use list view - grid view removed
  const productStyle = "list";
  const [productSidebar, setProductSidebar] = useState(false);
  const [stickyMenu, setStickyMenu] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // SERVER-SIDE FILTERING: Products are already filtered on the server (page.tsx)
  // All filtering (category, size, price, sort) is done on the server for optimal performance

  // ✅ OPTIMIZED: Only reset pagination when category changes, not on every searchParams change
  // This prevents unnecessary re-renders when only page number or sort changes
  const categoryParam = searchParams?.get("category") || null;
  useEffect(() => {
    // Only reset if category actually changed (not on page/sort changes)
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [categoryParam]); // Only depend on category, not all searchParams

  const availableSizes = useMemo(() => {
    const sizes = allProducts.flatMap((product) => product.sizes || []);
    return [...new Set(sizes)];
  }, [allProducts]);

  const handleStickyMenu = () => {
    if (window.scrollY >= 80) {
      setStickyMenu(true);
    } else {
      setStickyMenu(false);
    }
  };

  useEffect(() => {
    window.addEventListener("scroll", handleStickyMenu);

    // closing sidebar while clicking outside
    function handleClickOutside(event: any) {
      if (!event.target.closest(".sidebar-content")) {
        setProductSidebar(false);
      }
    }

    if (productSidebar) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [productSidebar]);

  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * PRODUCTS_PER_PAGE;
    return products.slice(start, start + PRODUCTS_PER_PAGE);
  }, [products, currentPage]);

  // Get category name from prop or URL params
  const categoryName = useMemo(() => {
    // Use prop if provided (from category page)
    if (categoryNameProp) return categoryNameProp;
    // Otherwise get from URL params
    if (!categoryParam) return null;
    const category = categories.find(
      (cat) => ((cat as any).handle || cat.slug?.current || (cat as any).slug) === categoryParam
    );
    return (category as any)?.name || category?.title || categoryParam;
  }, [categoryParam, categories, categoryNameProp]);

  return (
    <>
      {/* Products Hero Section (like Company page) - Show when not on a specific category page */}
      {!categoryNameProp && <ProductsHeroSection />}

      {/* Category Hero Section (like Company page) - Show when category selected */}
      {categoryName && (
        <CategoryHeroSection categoryName={categoryName} />
      )}

       <section className="relative pt-5 pb-10 overflow-hidden lg:pt-10 xl:pt-12 bg-white">
        <div className="w-full px-4 mx-auto max-w-7xl sm:px-6 xl:px-0">
          <div className="flex gap-7.5">
            {/* Sidebar Start - Hide completely on category/subcategory pages */}
            {!currentCategory && (
            <div
              className={`sidebar-content fixed xl:z-1 z-9999 left-0 top-0 xl:translate-x-0 xl:static xl:w-1/4 w-full ease-out duration-200 ${
                productSidebar ? "translate-x-0 bg-white" : "-translate-x-full"
              }`}
            >
              <button
                onClick={() => setProductSidebar(!productSidebar)}
                aria-label="button for product sidebar toggle"
                className={`xl:hidden absolute -right-12.5 sm:-right-8 flex items-center justify-center w-8 h-8 rounded-md bg-white shadow-1 ${
                  stickyMenu
                    ? "lg:top-20 sm:top-34.5 top-35"
                    : "lg:top-24 sm:top-39 top-37"
                }`}
              >
                <SidebarToggleIcon />
              </button>

              <div className="flex flex-col gap-6 overflow-y-auto max-xl:h-screen max-xl:p-5">
                {/* filter box */}
                <ClearFilters />

                  {/* Category filter - Only show on shop page */}
                <CategoryDropdown categories={categories} allProducts={allProducts} />

                {/* gender box */}
                {/* <GenderDropdown genders={genders} /> */}

                <SizeDropdown availableSizes={availableSizes} />
              </div>
            </div>
            )}
            {/* Sidebar End */}

            {/* Content Start */}
            <div className={currentCategory ? "w-full" : "w-full xl:w-3/4"}>
              <div className="rounded-lg bg-white shadow-1 pl-3 pr-2.5 py-2.5 mb-6">
                <div className="flex items-center justify-between">
                  {/* top bar left */}
                  <TopBar
                    allProductsCount={allProductsCount}
                    showingProductsCount={products.length}
                  />

                  {/* Grid/List view toggle removed - always use list view */}
                </div>
              </div>

              {/* Products List View - Always use list view */}
              {paginatedProducts.length ? (
                <div className="flex flex-col gap-7.5">
                  {paginatedProducts.map((product) => (
                      <SingleListItem key={product._id} item={product} />
                  ))}
                </div>
              ) : (
                <ProductsEmptyState />
              )}

              <Pagination
                currentPage={currentPage}
                totalCount={products.length}
                pageSize={PRODUCTS_PER_PAGE}
                onPageChange={setCurrentPage}
              />
            </div>

            {/* Content End */}
          </div>
        </div>
      </section>
    </>
  );
};

export default ShopWithSidebar;
