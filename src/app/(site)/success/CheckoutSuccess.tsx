"use client";
import { useSession } from "next-auth/react";
import Link from "next/link";
import React, { useEffect } from "react";
import { useShoppingCart } from "use-shopping-cart";
import { ArrowLeftIcon } from "./_components/icons";

const CheckoutSuccess = () => {
  const { clearCart } = useShoppingCart();
  const [loading, setLoading] = React.useState(true);

  const { data: session } = useSession();

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
      clearCart();
    }, 1000);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section className="overflow-hidden py-20 bg-gray-2">
      <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
        {loading ? (
          <>
            <div className="bg-white rounded-xl shadow-1 px-4 py-10 sm:py-15 lg:py-20 xl:py-25">
              <div className="text-center">
                <h2 className="font-bold text-blue text-4xl lg:text-[45px] lg:leading-[57px] mb-5">
                  Successful!
                </h2>

                <h3 className="font-medium text-dark text-xl sm:text-2xl mb-3">
                  Order Placed Successfully!
                </h3>

                <p className="max-w-[491px] w-full mx-auto mb-7.5">
                  Wait a second while we save the order. You will receive an
                  email with details of your order.
                </p>

                <div className="flex justify-center gap-5">
                  <svg
                    width="56"
                    height="56"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <g fill="currentColor">
                      <path
                        fill="currentColor"
                        d="M12,4a8,8,0,0,1,7.89,6.7A1.53,1.53,0,0,0,21.38,12h0a1.5,1.5,0,0,0,1.48-1.75,11,11,0,0,0-21.72,0A1.5,1.5,0,0,0,2.62,12h0a1.53,1.53,0,0,0,1.49-1.3A8,8,0,0,1,12,4Z"
                      >
                        <animateTransform
                          attributeName="transform"
                          dur="0.75s"
                          repeatCount="indefinite"
                          type="rotate"
                          values="0 12 12;360 12 12"
                        />
                      </path>
                    </g>
                  </svg>
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="bg-white rounded-xl shadow-1 px-4 py-10 sm:py-15 lg:py-20 xl:py-25">
              <div className="text-center">
                <h2 className="font-bold text-blue text-4xl lg:text-[45px] lg:leading-[57px] mb-5">
                  Successful!
                </h2>

                <h3 className="font-medium text-dark text-xl sm:text-2xl mb-3">
                  Order Placed Successfully!
                </h3>

                <p className="max-w-[491px] w-full mx-auto mb-7.5">
                  Sign In with & Track the order. If you are not already Signed
                  Up use the purchase email to Sign up.
                </p>

                <div className="flex justify-center gap-5">
                  <Link
                    href={`${session?.user ? "/my-account" : "/signin"}`}
                    className="inline-flex items-center gap-2 font-medium text-white bg-blue-light py-3 px-6 rounded-full ease-out duration-200 hover:bg-blue-dark"
                  >
                    <ArrowLeftIcon />
                    {`${session?.user ? "Account" : "Sign In"}`}
                  </Link>

                  <Link
                    href="/shop"
                    className="inline-flex items-center gap-2 rounded-full border border-transparent bg-[#2958A4] text-white text-sm font-medium px-6 py-3 transition-colors hover:border-[#2958A4] hover:bg-white hover:text-[#2958A4]"
                  >
                    Continue Shopping
                    <ArrowLeftIcon className="rotate-180" />
                  </Link>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default CheckoutSuccess;
