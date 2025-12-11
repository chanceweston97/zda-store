"use client";

import Link from "next/link";
import React, { useEffect } from "react";
import LocalizedClientLink from "@modules/common/components/localized-client-link";

const ArrowLeftIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M12.5 15L7.5 10L12.5 5"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ArrowRightIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M7.5 5L12.5 10L7.5 15"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const CheckoutSuccess = () => {
  const [loading, setLoading] = React.useState(true);

  useEffect(() => {
    // Clear cart on success
    const clearCart = async () => {
      try {
        await fetch("/api/cart", {
          method: "DELETE",
        });
        window.dispatchEvent(new Event("cart-updated"));
      } catch (error) {
        console.error("Error clearing cart:", error);
      }
    };

    setTimeout(() => {
      setLoading(false);
      clearCart();
    }, 1000);
  }, []);

  return (
    <section className="overflow-hidden py-20 bg-[#F5F7FA]">
      <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
        {loading ? (
          <div className="bg-white rounded-xl shadow-1 px-4 py-10 sm:py-15 lg:py-20 xl:py-25">
            <div className="text-center">
              <h2 className="font-bold text-[#3F51B5] text-4xl lg:text-[45px] lg:leading-[57px] mb-5">
                Successful!
              </h2>

              <h3 className="font-medium text-dark text-xl sm:text-2xl mb-3">
                Order Placed Successfully!
              </h3>

              <p className="max-w-[491px] w-full mx-auto mb-7.5 text-gray-600">
                Wait a second while we save the order. You will receive an
                email with details of your order.
              </p>

              <div className="flex justify-center gap-5">
                <div className="w-14 h-14 border-4 border-[#3F51B5] border-t-transparent rounded-full animate-spin"></div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-1 px-4 py-10 sm:py-15 lg:py-20 xl:py-25">
            <div className="text-center">
              <h2 className="font-bold text-[#3F51B5] text-4xl lg:text-[45px] lg:leading-[57px] mb-5">
                Successful!
              </h2>

              <h3 className="font-medium text-dark text-xl sm:text-2xl mb-3">
                Order Placed Successfully!
              </h3>

              <p className="max-w-[491px] w-full mx-auto mb-7.5 text-gray-600">
                Sign In with & Track the order. If you are not already Signed
                Up use the purchase email to Sign up.
              </p>

              <div className="flex justify-center gap-5 flex-wrap">
                <LocalizedClientLink
                  href="/account"
                  className="inline-flex items-center gap-2 font-medium text-white bg-[#5C7CDE] py-3 px-6 rounded-full ease-out duration-200 hover:bg-[#4A6BC7] transition-colors"
                >
                  <ArrowLeftIcon />
                  Sign In
                </LocalizedClientLink>

                <LocalizedClientLink
                  href="/store"
                  className="inline-flex items-center gap-2 font-medium text-white bg-[#5C7CDE] py-3 px-6 rounded-full ease-out duration-200 hover:bg-[#4A6BC7] transition-colors"
                >
                  Continue Shopping
                  <ArrowRightIcon />
                </LocalizedClientLink>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default CheckoutSuccess;

