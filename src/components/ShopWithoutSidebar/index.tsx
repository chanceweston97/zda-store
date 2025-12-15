"use client";
import { FourSquaresIcon, TwoSquaresIcon } from "@/assets/icons";
import { Product } from "@/types/product";
import { useState } from "react";
import SingleGridItem from "../Shop/SingleGridItem";
import SingleListItem from "../Shop/SingleListItem";
import CustomSelect from "../ShopWithSidebar/CustomSelect";
import Pagination from "../Common/Pagination";

const PRODUCTS_PER_PAGE = 8;

const ShopWithoutSidebar = ({ shopData }: { shopData: Product[] }) => {
  const [productStyle, setProductStyle] = useState("grid");
  const [currentPage, setCurrentPage] = useState(1);
  const paginatedProducts = shopData.slice(
    (currentPage - 1) * PRODUCTS_PER_PAGE,
    currentPage * PRODUCTS_PER_PAGE
  );

  return (
    <section className="overflow-hidden relative pb-20 pt-5 lg:pt-20 xl:pt-28 bg-[#f3f4f6] pt-[209px] sm:pt-[155px] lg:pt-[95px] xl:pt-[150px]">
      <div className="w-full px-4 mx-auto max-w-7xl sm:px-6 xl:px-0">
        <div className="flex gap-7">
          <div className="w-full">
            <div className="rounded-lg bg-white shadow-1 pl-3 pr-2.5 py-2.5 mb-6">
              <div className="flex items-center justify-between">
                {/* <!-- top bar left --> */}
                <div className="flex flex-wrap items-center gap-4">
                  <CustomSelect />

                  <p>
                    Showing{" "}
                    <span className="text-dark">
                      {shopData.length} of {shopData.length}
                    </span>{" "}
                    Products
                  </p>
                </div>

                {/* <!-- top bar right --> */}
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

            {paginatedProducts.length ? (
              <div
                className={
                  productStyle === "grid"
                    ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-7.5 gap-y-9"
                    : "flex flex-col gap-7.5"
                }
              >
                {paginatedProducts.map((item) =>
                  productStyle === "grid" ? (
                    <SingleGridItem item={item} key={item._id} />
                  ) : (
                    <SingleListItem item={item} key={item._id} />
                  )
                )}
              </div>
            ) : (
              <p className="py-5 text-2xl text-center">No products found!</p>
            )}
            <Pagination
              currentPage={currentPage}
              totalCount={shopData.length}
              pageSize={PRODUCTS_PER_PAGE}
              onPageChange={setCurrentPage}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default ShopWithoutSidebar;
