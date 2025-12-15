"use client";
import { useState } from "react";
import { useCheckoutForm } from "./form";
import toast from "react-hot-toast";
import { validateCoupon } from "@/app/actions";

export default function CouponForm() {
  const { setValue, watch } = useCheckoutForm();
  const [loading, setLoading] = useState(false);
  const [coupon, setCoupon] = useState("");

  const alreadyApplied = !!watch("couponDiscount");

  async function applyCoupon() {
    setLoading(true);
    if (!coupon) return;

    const data = await validateCoupon(coupon);
    setLoading(false);

    if (!data?.success) {
      toast.error(data?.message || "Failed to apply coupon");
      setCoupon("");
      return;
    }
    console.log(data);
    setValue("couponDiscount", data?.data?.discount);
    setValue("couponCode", data?.data?.code);
    setCoupon("");
  }

  return (
    <>
      <input
        type="text"
        placeholder="Enter coupon code"
        className="rounded-full border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-hidden duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20 disabled:opacity-80"
        disabled={alreadyApplied}
        value={coupon}
        onChange={(e) => setCoupon(e.target.value)}
      />

      <button
        type="button"
        onClick={applyCoupon}
        className="inline-flex items-center rounded-full border border-transparent bg-[#2958A4] text-white text-sm font-medium px-6 py-3 transition-colors hover:border-[#2958A4] hover:bg-white hover:text-[#2958A4] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-transparent disabled:hover:bg-[#2958A4] disabled:hover:text-white disabled:pointer-events-none"
        disabled={alreadyApplied || loading}
      >
        {alreadyApplied ? "Applied" : loading ? "Applying..." : "Apply"}
      </button>
    </>
  );
}
