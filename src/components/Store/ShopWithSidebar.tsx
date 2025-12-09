"use client"

import { useState, useMemo, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { HttpTypes } from "@medusajs/types"
import ProductGridItem from "./ProductGridItem"
import CategoryDropdown from "./CategoryDropdown"
import ClearFilters from "./ClearFilters"
import TopBar from "./TopBar"

const PRODUCTS_PER_PAGE = 9

type ShopWithSidebarProps = {
  products: HttpTypes.StoreProduct[]
  categories: HttpTypes.StoreProductCategory[]
  region: HttpTypes.StoreRegion
  totalCount: number
  allProducts?: HttpTypes.StoreProduct[] // All products for counting
}

export default function ShopWithSidebar({
  products,
  categories,
  region,
  totalCount,
  allProducts = [],
}: ShopWithSidebarProps) {
  const [productStyle, setProductStyle] = useState<"grid" | "list">("grid")
  const [productSidebar, setProductSidebar] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const searchParams = useSearchParams()

  // Products are already filtered server-side, so use them directly
  const filteredProducts = products

  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * PRODUCTS_PER_PAGE
    return filteredProducts.slice(start, start + PRODUCTS_PER_PAGE)
  }, [filteredProducts, currentPage])

  const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE)

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchParams])

  // Close sidebar when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as HTMLElement
      if (!target.closest(".sidebar-content") && !target.closest(".sidebar-toggle")) {
        setProductSidebar(false)
      }
    }

    if (productSidebar) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [productSidebar])

  return (
    <section className="relative pt-5 pb-10 overflow-hidden lg:pt-10 xl:pt-12 bg-[#f3f4f6] mt-[108px]">
      <div className="w-full px-4 mx-auto max-w-[1340px] sm:px-6 xl:px-0">
        <div className="flex gap-7.5">
          {/* Sidebar Start */}
          <div
            className={`sidebar-content fixed xl:sticky xl:top-[108px] xl:self-start xl:z-1 z-[9999] left-0 top-0 xl:translate-x-0 xl:w-1/4 w-full ease-out duration-200 ${
              productSidebar ? "translate-x-0 bg-white" : "-translate-x-full xl:translate-x-0"
            }`}
          >
            <button
              onClick={() => setProductSidebar(!productSidebar)}
              aria-label="button for product sidebar toggle"
              className="sidebar-toggle xl:hidden absolute -right-12.5 sm:-right-8 flex items-center justify-center w-8 h-8 rounded-md bg-white shadow-lg z-[10000]"
            >
              <svg
                className="w-5 h-5 text-[#2958A4]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>

            <div className="flex flex-col gap-6 overflow-y-auto max-xl:h-screen max-xl:p-5 xl:p-0 xl:max-h-[calc(100vh-108px)]">
              <ClearFilters />
              <CategoryDropdown categories={categories} allProducts={allProducts} />
            </div>
          </div>
          {/* Sidebar End */}

          {/* Content Start */}
          <div className="w-full xl:w-3/4">
            {/* Top Bar */}
            <div className="rounded-lg bg-white shadow-sm pl-3 pr-2.5 py-2.5 mb-6">
              <div className="flex items-center justify-between">
                <TopBar
                  allProductsCount={totalCount}
                  showingProductsCount={filteredProducts.length}
                />

                {/* Grid/List View Toggle */}
                <div className="flex items-center gap-2.5">
                  <button
                    onClick={() => setProductStyle("grid")}
                    aria-label="button for product grid tab"
                    className={`${
                      productStyle === "grid"
                        ? "bg-[#2958A4] border-[#2958A4] text-white"
                        : "text-[#2958A4] bg-gray-100 border-gray-300"
                    } flex items-center justify-center w-10.5 h-9 rounded-lg border ease-out duration-200 hover:bg-[#2958A4] hover:border-[#2958A4] hover:text-white`}
                  >
                    {/* Four Squares Icon */}
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                      />
                    </svg>
                  </button>

                  <button
                    onClick={() => setProductStyle("list")}
                    aria-label="button for product list tab"
                    className={`${
                      productStyle === "list"
                        ? "bg-[#2958A4] border-[#2958A4] text-white"
                        : "text-[#2958A4] bg-gray-100 border-gray-300"
                    } flex items-center justify-center w-10.5 h-9 rounded-lg border ease-out duration-200 hover:bg-[#2958A4] hover:border-[#2958A4] hover:text-white`}
                  >
                    {/* List Icon */}
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 6h16M4 12h16M4 18h16"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Products Grid/List */}
            {paginatedProducts.length > 0 ? (
              <div
                className={
                  productStyle === "grid"
                    ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-7.5 gap-y-9"
                    : "flex flex-col gap-7.5"
                }
              >
                {paginatedProducts.map((product) => (
                  <ProductGridItem
                    key={product.id}
                    product={product}
                    region={region}
                  />
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center py-12">
                <p className="text-center text-2xl text-[#4F6866]">
                  No products found!
                </p>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex justify-center">
                <div className="flex gap-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`px-4 py-2 rounded-lg border transition-colors ${
                        pageNum === currentPage
                          ? "bg-[#2958A4] text-white border-[#2958A4]"
                          : "bg-white text-[#2958A4] border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      {pageNum}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          {/* Content End */}
        </div>
      </div>
    </section>
  )
}

