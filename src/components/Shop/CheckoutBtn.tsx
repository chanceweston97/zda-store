import React from "react";
import { useRouter } from "next/navigation";
import { ButtonArrow } from "@/components/Common/ButtonArrow";

const CheckoutBtn = () => {
  const router = useRouter();

  function handleCheckoutClick(event: any) {
    event.preventDefault();
    router.push("/checkout");
  }

  return (
    <button
      onClick={(e) => handleCheckoutClick(e)}
      className="group inline-flex items-center gap-2 rounded-[10px] border border-transparent bg-[#2958A4] text-white text-[16px] font-medium px-6 py-3 transition-all duration-300 ease-in-out hover:bg-[#214683]"
      style={{ fontFamily: 'Satoshi, sans-serif' }}
    >
      <ButtonArrow />
      <span>Checkout</span>
    </button>
  );
};

export default CheckoutBtn;
