"use client";
import { useState } from "react";
import { useCheckoutForm } from "./form";
import toast from "react-hot-toast";
import { validateCoupon } from "@/app/actions";
import { ButtonArrowHomepage } from "@/components/Common/ButtonArrowHomepage";

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
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            applyCoupon();
          }
        }}
      />

      <button
        type="button"
        onClick={applyCoupon}
        className="btn filled group relative inline-flex items-center justify-center rounded-[10px] border border-transparent bg-[#2958A4] text-white text-[14px] sm:text-[16px] font-medium transition-all duration-300 ease-in-out hover:bg-[#214683] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#2958A4] disabled:pointer-events-none"
        style={{ 
          fontFamily: 'Satoshi, sans-serif',
          padding: '10px 30px',
          paddingRight: '30px',
          cursor: (alreadyApplied || loading) ? 'not-allowed' : 'pointer'
        }}
        disabled={alreadyApplied || loading}
        onMouseEnter={(e) => {
          if (!alreadyApplied && !loading) {
            e.currentTarget.style.paddingRight = 'calc(30px + 17px)';
          }
        }}
        onMouseLeave={(e) => {
          if (!alreadyApplied && !loading) {
            e.currentTarget.style.paddingRight = '30px';
          }
        }}
      >
        <ButtonArrowHomepage />
        <p className="transition-transform duration-300 ease-in-out group-hover:translate-x-[11px] m-0">
          {alreadyApplied ? "Applied" : loading ? "Applying..." : "Apply"}
        </p>
      </button>
    </>
  );
}
