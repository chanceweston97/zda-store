"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import useSWR from "swr";
import Image from "next/image";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import CategoryDropdown from "./CategoryDropdown";
import ClearFilters from "./ClearFilters";

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
    products: Product[];
    categories: Category[];
    totalCount: number;
    currentCategory?: Category | null; // Optional: current category for subcategories display
  };
  categoryName?: string; // Optional: category name for hero section (from category page)
};

const PRODUCTS_PER_PAGE = 10;

const ShopWithSidebar = ({ data, categoryName: categoryNameProp }: PropsType) => {
  const { products: initialProducts, categories, totalCount: initialTotalCount, currentCategory } = data;
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Always use list view - grid view removed
  const productStyle = "list";
  const [productSidebar, setProductSidebar] = useState(false);
  const [stickyMenu, setStickyMenu] = useState(false);
  const categoryParam = searchParams?.get("category") || null;
  const pageParam = searchParams?.get("page");
  const parsedPage = pageParam ? parseInt(pageParam, 10) : 1;
  const currentPage = Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1;

  const activeCategoryIds = useMemo(() => {
    if (categoryParam) {
      const paramValues = categoryParam.split(",").filter(Boolean);
      
      // Convert slugs to IDs if needed
      const resolvedIds = paramValues.map((param) => {
        // Check if it's already a numeric ID
        if (/^\d+$/.test(param)) {
          return param;
        }
        
        // It's a slug - find the category by slug and get its ID
        const category = categories?.find(
          (cat: any) => {
            // Handle different slug formats
            const slugValue = typeof cat.slug === 'string' 
              ? cat.slug 
              : (cat.slug?.current || null);
            
            // Compare slug (case-insensitive)
            if (slugValue && typeof slugValue === 'string') {
              if (slugValue.toLowerCase() === param.toLowerCase()) return true;
            }
            
            // Check other fields
            if (cat.handle && typeof cat.handle === 'string') {
              if (cat.handle.toLowerCase() === param.toLowerCase()) return true;
            }
            
            // Direct string match (case-sensitive fallback)
            if (slugValue === param || cat.handle === param) return true;
            
            return false;
          }
        );
        
        if (category) {
          const id = category.id || category._id;
          return id ? String(id) : null;
        }
        
        return null;
      }).filter(Boolean) as string[];
      
      return resolvedIds;
    }
    if (currentCategory) {
      const id = (currentCategory as any).id || currentCategory._id;
      return id ? [String(id)] : [];
    }
    return [];
  }, [categoryParam, currentCategory, categories]);

  // AbortController for canceling previous requests when filters change
  const activeControllerRef = useRef<AbortController | null>(null);

  const fetchProducts = async (categoryIds?: string, pageOverride?: number) => {
    // Cancel previous request if still active
    if (activeControllerRef.current) {
      activeControllerRef.current.abort();
    }

    // Create new abort controller for this request
    const controller = new AbortController();
    activeControllerRef.current = controller;

    try {
      const params = new URLSearchParams({
        per_page: String(PRODUCTS_PER_PAGE),
        page: String(pageOverride ?? currentPage),
      });
      if (categoryIds) {
        params.set("category", categoryIds);
      }
      const response = await fetch(`/api/products?${params.toString()}`, {
        signal: controller.signal,
      });
      
      // Check if request was aborted
      if (controller.signal.aborted) {
        throw new Error("Request cancelled");
      }

      if (!response.ok) {
        // Swallow errors - return empty data instead of crashing
        console.error(`[ShopWithSidebar] Failed to load products (${response.status})`);
        return {
          products: [],
          totalCount: 0,
          allCount: 0,
        };
      }
      return response.json();
    } catch (error: any) {
      // Handle abort errors gracefully
      if (error?.name === 'AbortError' || error?.message === 'Request cancelled') {
        throw error; // Let SWR handle cancellation
      }
      // Swallow other errors - return empty data instead of crashing
      console.error("[ShopWithSidebar] Error fetching products:", error);
      return {
        products: [],
        totalCount: 0,
        allCount: 0,
      };
    }
  };

  const categoryKey = activeCategoryIds.join(",");
  const swrKey = activeCategoryIds.length ? categoryKey : "all";
  const prevCategoryKey = useRef(categoryKey);
  const productsTopRef = useRef<HTMLDivElement | null>(null);
  
  const { data: productsData, isLoading } = useSWR(
    ["products", swrKey, currentPage],
    () => fetchProducts(activeCategoryIds.join(","), currentPage),
    {
      keepPreviousData: true,
      dedupingInterval: 5000, // Increased from 2000 to reduce duplicate requests
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      errorRetryCount: 2,
      errorRetryInterval: 1500,
      fallbackData: {
        products: initialProducts || [],
        totalCount: initialTotalCount || 0,
        allCount: initialTotalCount || 0,
      },
    }
  );

  const products: Product[] = productsData?.products || [];

  // products actually rendered on this page
  const showingCount = products.length;
  // total products matching current filter
  const filteredTotalCount: number = productsData?.totalCount ?? 0;
  // total products in the store (used only when no category selected)
  const globalTotalCount: number =
    productsData?.allCount ?? filteredTotalCount;
  // for "of X Products"
  const displayAllCount = activeCategoryIds.length
    ? filteredTotalCount
    : globalTotalCount;
  const paginationCount = displayAllCount;

  useEffect(() => {
    console.log("[Shop Page] Products from WooCommerce:", {
      count: products.length,
      products,
      filteredTotalCount,
      globalTotalCount,
      activeCategoryIds,
      currentPage,
    });
  }, [products, filteredTotalCount, globalTotalCount, activeCategoryIds, currentPage]);

  // REMOVED: Prefetch logic that was causing traffic spikes
  // WordPress cannot handle speculative prefetching
  // This was removed to prevent 504 errors

  useEffect(() => {
    if (prevCategoryKey.current === categoryKey) {
      return;
    }
    prevCategoryKey.current = categoryKey;
    if (currentPage <= 1) return;
    const params = new URLSearchParams(searchParams?.toString() || "");
    params.delete("page");
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [categoryKey, currentPage, pathname, router, searchParams]);

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

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams?.toString() || "");
    if (page <= 1) {
      params.delete("page");
    } else {
      params.set("page", String(page));
    }
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    if (productsTopRef.current) {
      productsTopRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Get category name from prop or URL params
  const categoryName = useMemo(() => {
    // Use prop if provided (from category page)
    if (categoryNameProp) return categoryNameProp;
    // Otherwise get from URL params
    if (!categoryParam) return null;
    const categoryId = categoryParam?.split(",")[0];
    if (!categoryId) return null;
    const findCategory = (cats: any[]): any => {
      for (const cat of cats) {
        const id = cat.id || cat._id;
        if (String(id) === categoryId) return cat;
        if (cat.subcategories?.length) {
          const found = findCategory(cat.subcategories);
          if (found) return found;
        }
      }
      return null;
    };
    const category = findCategory(categories);
    return (category as any)?.name || category?.title || categoryId;
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
            {/* Sidebar with filters - always visible */}
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
                <CategoryDropdown categories={categories} />

                {/* gender box */}
                {/* <GenderDropdown genders={genders} /> */}

                {/* Size filter removed */}
              </div>
            </div>
            {/* Sidebar End */}

            {/* Content Start */}
            <div className="w-full xl:w-3/4">
              <div className="rounded-lg bg-white shadow-1 pl-3 pr-2.5 py-2.5 mb-6">
                <div className="flex items-center justify-between">
                  {/* top bar left */}
                  <TopBar
                    allProductsCount={displayAllCount}
                    showingProductsCount={showingCount}
                  />

                  {/* Grid/List view toggle removed - always use list view */}
                </div>
              </div>

              {/* Products List View - Always use list view */}
              <div ref={productsTopRef} />
              {isLoading ? (
                <div className="flex flex-col gap-7.5">
                  {Array.from({ length: PRODUCTS_PER_PAGE }).map((_, index) => (
                    <div
                      key={`product-skeleton-${index}`}
                      className="bg-white rounded-lg shadow-1 overflow-hidden mb-6 animate-pulse"
                    >
                      <div className="flex flex-col lg:flex-row gap-6">
                        {/* Left image placeholder */}
                        <div className="flex-shrink-0 relative mx-auto lg:mx-0">
                          <div
                            className="relative rounded-lg border border-gray-3 flex items-center justify-center bg-gray-1 overflow-hidden"
                            style={{
                              width: "300px",
                              height: "300px",
                              aspectRatio: "1/1",
                            }}
                          >
                            <div className="w-full h-full bg-gray-2" />
                          </div>
                        </div>

                        {/* Right content placeholder */}
                        <div className="flex-1 flex flex-col justify-start px-4 lg:px-0 w-full">
                          <div
                            className="rounded-[10px] bg-[#F1F6FF] w-full mb-4"
                            style={{
                              display: "flex",
                              padding: "15px",
                              flexDirection: "column",
                              alignItems: "flex-start",
                              gap: "5px",
                              alignSelf: "stretch",
                            }}
                          >
                            <div className="h-5 w-40 rounded bg-gray-2" />
                            <div className="h-7 w-3/4 rounded bg-gray-2" />
                            <div className="h-6 w-24 rounded bg-gray-2" />
                          </div>
                          <div className="h-5 w-2/3 rounded bg-gray-2 mb-4" />
                          <div className="space-y-2">
                            <div className="h-4 w-1/2 rounded bg-gray-2" />
                            <div className="h-4 w-2/3 rounded bg-gray-2" />
                            <div className="h-4 w-3/4 rounded bg-gray-2" />
                            <div className="h-4 w-5/6 rounded bg-gray-2" />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : products.length ? (
                <div className="flex flex-col gap-7.5">
                  {products.map((product) => (
                      <SingleListItem key={product._id} item={product} />
                  ))}
                </div>
              ) : (
                <ProductsEmptyState />
              )}

              <Pagination
                currentPage={currentPage}
                totalCount={paginationCount}
                pageSize={PRODUCTS_PER_PAGE}
                onPageChange={handlePageChange}
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
