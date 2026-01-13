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
      <div className="absolute inset-0 pointer-events-none">
        <Image
          src="/images/xetawave-dot.svg"
          alt=""
          fill
          className="object-cover"
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
      <div className="absolute inset-0 pointer-events-none">
        <Image
          src="/images/xetawave-dot.svg"
          alt=""
          fill
          className="object-cover"
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
  const { allProducts, products: initialProducts, categories, allProductsCount, currentCategory } = data;
  const searchParams = useSearchParams();

  // Always use list view - grid view removed
  const productStyle = "list";
  const [productSidebar, setProductSidebar] = useState(false);
  const [stickyMenu, setStickyMenu] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // ✅ CLIENT-SIDE FILTERING: Filter products on the client for instant updates
  // This avoids server round-trips and makes filtering instant
  const categoryParam = searchParams?.get("category") || null;
  const sizesParam = searchParams?.get("sizes") || null;
  const minPriceParam = searchParams?.get("minPrice") || null;
  const maxPriceParam = searchParams?.get("maxPrice") || null;
  const sortParam = searchParams?.get("sort") || null;

  // Reset pagination when filters change
  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [categoryParam, sizesParam, minPriceParam, maxPriceParam, sortParam]);

  const availableSizes = useMemo(() => {
    const sizes = allProducts.flatMap((product) => product.sizes || []);
    return [...new Set(sizes)];
  }, [allProducts]);

  // Build category map for O(1) lookup
  const categoryMap = useMemo(() => {
    const map = new Map<string, any>();
    const buildMap = (cats: any[]) => {
      cats.forEach((cat) => {
        const catHandle = (cat as any).handle || cat.slug?.current || cat.slug;
        if (catHandle) {
          map.set(catHandle, cat);
        }
        const subcats = cat.subcategories || cat.category_children || [];
        if (subcats.length > 0) {
          buildMap(subcats);
        }
      });
    };
    buildMap(categories);
    return map;
  }, [categories]);

  // ✅ CLIENT-SIDE FILTERING: Filter products based on URL params
  // When on a category page (currentCategory exists), start with the pre-filtered products
  // When on shop page, start with allProducts
  const filteredProducts = useMemo(() => {
    // Start with pre-filtered products if on category page, otherwise use allProducts
    const baseProducts = currentCategory ? initialProducts : allProducts;
    let result = [...baseProducts];

    // Category filter (only apply if not on a category page, or if additional categories are selected)
    if (categoryParam && !currentCategory) {
      const categoryHandles = categoryParam.split(",").filter(Boolean);
      const categoryIdSet = new Set<string>();
      
      categoryHandles.forEach((handle) => {
        const foundCategory = categoryMap.get(handle);
        if (foundCategory) {
          const categoryId = foundCategory.id || foundCategory._id;
          if (categoryId) {
            categoryIdSet.add(categoryId);
            const subcats = foundCategory.subcategories || foundCategory.category_children || [];
            subcats.forEach((sub: any) => {
              const subId = sub.id || sub._id;
              if (subId) categoryIdSet.add(subId);
            });
          }
        }
      });

      if (categoryIdSet.size > 0) {
        result = result.filter((product: any) => {
          const productCategoryIds = product.categories?.map((cat: any) => cat.id).filter(Boolean) || [];
          return productCategoryIds.some((id: string) => categoryIdSet.has(id));
        });
      }
    }

    // Size filter
    if (sizesParam) {
      const selectedSizesSet = new Set(sizesParam.split(",").filter(Boolean));
      if (selectedSizesSet.size > 0) {
        result = result.filter((product: any) => {
          const productSizes = product.sizes || [];
          return Array.from(selectedSizesSet).some(size => productSizes.includes(size));
        });
      }
    }

    // Price filter
    const minPriceNum = minPriceParam ? parseFloat(minPriceParam) : null;
    const maxPriceNum = maxPriceParam ? parseFloat(maxPriceParam) : null;
    if (minPriceNum !== null || maxPriceNum !== null) {
      result = result.filter((product: any) => {
        const productPrice = product.price || 0;
        if (minPriceNum !== null && productPrice < minPriceNum) return false;
        if (maxPriceNum !== null && productPrice > maxPriceNum) return false;
        return true;
      });
    }

    // Sort
    if (sortParam === 'popular') {
      result = [...result].sort((a, b) => {
        const aReviews = a.reviews?.length || 0;
        const bReviews = b.reviews?.length || 0;
        return bReviews - aReviews;
      });
    }

    return result;
  }, [allProducts, initialProducts, currentCategory, categoryParam, sizesParam, minPriceParam, maxPriceParam, sortParam, categoryMap]);

  // Use filtered products
  const products = filteredProducts;

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
      {/* Products Hero Section (like Company page) - Show on base shop page */}
      {!categoryNameProp && <ProductsHeroSection />}

      {/* Category Hero Section (like Company page) - Show when category page visited via menu */}
      {categoryNameProp && (
        <CategoryHeroSection categoryName={categoryNameProp} />
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
