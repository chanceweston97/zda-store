"use client";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Breadcrumb from "../Common/Breadcrumb";
import CategoryDropdown from "./CategoryDropdown";
import ClearFilters from "./ClearFilters";
import SizeDropdown from "./SizeDropdown";

import {
  FourSquaresIcon,
  SidebarToggleIcon,
  TwoSquaresIcon,
} from "@/assets/icons";
import { Category } from "@/types/category";
import { Product } from "@/types/product";
import SingleListItem from "../Shop/SingleListItem";
import SingleGridItem from "../Shop/SingleProductItem";
import ProductsEmptyState from "./ProductsEmptyState";
import TopBar from "./TopBar";
import Pagination from "../Common/Pagination";

type PropsType = {
  data: {
    allProducts: Product[];
    products: Product[];
    categories: Category[];
    allProductsCount: number;
  };
};

const PRODUCTS_PER_PAGE = 9;

const ShopWithSidebar = ({ data }: PropsType) => {
  const { allProducts, products, categories, allProductsCount } = data;
  const searchParams = useSearchParams();

  const [productStyle, setProductStyle] = useState("grid");
  const [productSidebar, setProductSidebar] = useState(false);
  const [stickyMenu, setStickyMenu] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // SERVER-SIDE FILTERING: Products are already filtered on the server (page.tsx)
  // All filtering (category, size, price, sort) is done on the server for optimal performance

  // Reset to page 1 when filters change (triggers server-side re-filter via URL params)
  useEffect(() => {
    setCurrentPage(1);
  }, [searchParams]);

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

  return (
    <>
       <section className="relative pt-5 pb-10 overflow-hidden lg:pt-10 xl:pt-12 bg-gray-2 mt-[108px]">
        <div className="w-full px-4 mx-auto max-w-7xl sm:px-6 xl:px-0">
          <div className="flex gap-7.5">
            {/* Sidebar Start */}
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

                <Suspense>
                  <CategoryDropdown categories={categories} allProducts={allProducts} />
                </Suspense>

                {/* gender box */}
                {/* <GenderDropdown genders={genders} /> */}

                <Suspense>
                  <SizeDropdown availableSizes={availableSizes} />
                </Suspense>
              </div>
            </div>
            {/* Sidebar End */}

            {/* Content Start */}
            <div className="w-full xl:w-3/4">
              <div className="rounded-lg bg-white shadow-1 pl-3 pr-2.5 py-2.5 mb-6">
                <div className="flex items-center justify-between">
                  {/* top bar left */}
                  <TopBar
                    allProductsCount={allProductsCount}
                    showingProductsCount={products.length}
                  />

                  {/* top bar right */}
                  <div className="flex items-center gap-2.5">
                    <button
                      onClick={() => setProductStyle("grid")}
                      aria-label="button for product grid tab"
                      className={`${
                        productStyle === "grid"
                          ? "bg-blue border-blue text-white"
                          : "text-dark bg-gray-1 border-gray-3"
                      } flex items-center justify-center w-10.5 h-9 rounded-lg border ease-out duration-200 hover:bg-blue hover:border-blue hover:text-white`}
                    >
                      <FourSquaresIcon />
                    </button>

                    <button
                      onClick={() => setProductStyle("list")}
                      aria-label="button for product list tab"
                      className={`${
                        productStyle === "list"
                          ? "bg-blue border-blue text-white"
                          : "text-dark bg-gray-1 border-gray-3"
                      } flex items-center justify-center w-10.5 h-9 rounded-lg border ease-out duration-200 hover:bg-blue hover:border-blue hover:text-white`}
                    >
                      <TwoSquaresIcon />
                    </button>
                  </div>
                </div>
              </div>

              {/* Products Grid Tab Content Start */}

              {paginatedProducts.length ? (
                <div
                  className={
                    productStyle === "grid"
                      ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-7.5 gap-y-9"
                      : "flex flex-col gap-7.5"
                  }
                >
                  {paginatedProducts.map((product) => {
                    return productStyle === "grid" ? (
                      <SingleGridItem key={product._id} item={product} />
                    ) : (
                      <SingleListItem key={product._id} item={product} />
                    );
                  })}
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
