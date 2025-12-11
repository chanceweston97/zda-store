"use client";

import { HttpTypes } from "@medusajs/types";
import Link from "next/link";
import LocalizedClientLink from "@modules/common/components/localized-client-link";

type OrderSummaryProps = {
  cart: HttpTypes.StoreCart | null;
};

const OrderSummary = ({ cart }: OrderSummaryProps) => {
  const cartItems = cart?.items || [];
  const subtotal = cart?.subtotal || 0;

  return (
    <div className="lg:max-w-2/5 w-full">
      {/* <!-- order list box --> */}
      <div className="bg-white shadow-1 rounded-[10px]">
        <div className="border-b border-gray-3 py-5 px-4 sm:px-8.5">
          <h3 className="font-medium text-xl text-dark">Order Summary</h3>
        </div>

        <div className="pt-2.5 pb-8.5 px-4 sm:px-8.5">
          {/* <!-- title --> */}
          <div className="flex items-center justify-between py-5 border-b border-gray-3">
            <div>
              <h4 className="font-medium text-dark">Product</h4>
            </div>
            <div>
              <h4 className="font-medium text-dark text-right">Subtotal</h4>
            </div>
          </div>

          {/* <!-- product item --> */}
          {cartItems.length > 0 && (
            <>
              {cartItems.map((item) => {
                const itemTotal = (item.unit_price || 0) * item.quantity;
                return (
                  <div
                    key={item.id}
                    className="flex items-center justify-between py-5 border-b border-gray-3"
                  >
                    <div>
                      <p className="text-dark">{item.title}</p>
                    </div>
                    <div>
                      <p className="text-dark text-right">
                        ${itemTotal.toFixed(2)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </>
          )}

          {/* <!-- total --> */}
          <div className="flex items-center justify-between pt-5">
            <div>
              <p className="font-medium text-lg text-dark">Total</p>
            </div>
            <div>
              <p className="font-medium text-lg text-dark text-right">
                ${subtotal.toFixed(2)}
              </p>
            </div>
          </div>

          {/* <!-- checkout button --> */}
          <LocalizedClientLink
            href="/checkout"
            className="w-full inline-flex items-center justify-center rounded-full border border-transparent bg-[#2958A4] text-white text-sm font-medium px-6 py-3 transition-colors hover:border-[#2958A4] hover:bg-white hover:text-[#2958A4] mt-7.5"
          >
            Process to Checkout
          </LocalizedClientLink>
        </div>
      </div>
    </div>
  );
};

export default OrderSummary;

