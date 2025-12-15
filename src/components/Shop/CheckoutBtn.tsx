import React from "react";
import { useRouter } from "next/navigation";

const CheckoutBtn = () => {
  const router = useRouter();

  function handleCheckoutClick(event: any) {
    event.preventDefault();
    router.push("/checkout");
  }

  return (
    <button
      onClick={(e) => handleCheckoutClick(e)}
      className="inline-flex items-center rounded-full border border-transparent bg-[#2958A4] text-white text-sm font-medium px-6 py-3 transition-colors hover:border-[#2958A4] hover:bg-white hover:text-[#2958A4]"
    >
      Checkout
    </button>
  );
};

export default CheckoutBtn;
