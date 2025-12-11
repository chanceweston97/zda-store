"use client";

import { useState } from "react";
import { useCheckoutForm } from "./form";
import toast from "react-hot-toast";

export default function Coupon() {
  const { register, setValue, watch } = useCheckoutForm();
  const [isLoading, setIsLoading] = useState(false);
  const couponCode = watch("couponCode");

  const handleApplyCoupon = async () => {
    setIsLoading(true);

    // TODO: Implement actual coupon validation with backend
    // For now, just show a message
    setTimeout(() => {
      toast.error("Coupon code validation not implemented yet");
      setIsLoading(false);
    }, 500);
  };

  return (
    <div className="bg-white shadow-1 rounded-[10px] mt-7.5 -order-1">
      <div className="border-b border-gray-3 py-5 px-4 sm:px-8.5">
        <h3 className="font-medium text-xl text-dark">Have any Coupon Code?</h3>
      </div>

      <div className="py-8 px-4 sm:px-8.5">
        <div className="flex gap-4">
          <input
            type="text"
            {...register("couponCode")}
            placeholder="Enter coupon code"
            className="flex-1 rounded-full border border-gray-3 bg-gray-1 placeholder:text-dark-5 py-2.5 px-5 outline-hidden duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-[#2958A4]/20"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleApplyCoupon();
              }
            }}
          />
          <button
            type="button"
            onClick={handleApplyCoupon}
            disabled={isLoading}
            className="inline-flex items-center justify-center rounded-full border border-transparent bg-[#2958A4] text-white text-sm font-medium px-6 py-3 transition-colors hover:border-[#2958A4] hover:bg-white hover:text-[#2958A4] disabled:opacity-50"
          >
            {isLoading ? "Applying..." : "Apply"}
          </button>
        </div>
      </div>
    </div>
  );
}

