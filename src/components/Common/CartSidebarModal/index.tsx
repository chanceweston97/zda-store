"use client";
import { CircleXIcon } from "@/assets/icons";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useShoppingCart } from "use-shopping-cart";
import EmptyCart from "./EmptyCart";
import SingleItem from "./SingleItem";
import { formatPrice, convertCartPriceToDollars } from "@/utils/price";
import { ButtonArrow } from "@/components/Common/ButtonArrow";

const CartSidebarModal = () => {
  const router = useRouter();
  const {
    cartCount,
    shouldDisplayCart,
    handleCartClick,
    cartDetails,
    totalPrice,
  } = useShoppingCart();

  useEffect(() => {
    // closing modal while clicking outside
    function handleClickOutside(event: any) {
      if (!event.target.closest(".modal-content")) {
        handleCartClick();
      }
    }

    if (shouldDisplayCart) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [shouldDisplayCart, handleCartClick]);

  function handleCheckoutClick(event: any) {
    event.preventDefault();
    handleCartClick(); // Close the cart modal
    router.push("/checkout");
  }

  return (
    <>
      <div
        className={`fixed top-0 left-0 z-9999 overflow-y-auto no-scrollbar w-full h-screen bg-dark/70 ease-linear duration-300 ${
          shouldDisplayCart ? "block" : "hidden"
        }`}
      ></div>

      {/* <div className="flex items-center justify-end"> */}
      <div
        className={`${
          shouldDisplayCart ? "translate-x-0" : "translate-x-full"
        } fixed z-999999 w-[350px] h-screen sm:w-[500px] sm:max-w-[500px] ease-linear duration-300 shadow-1 bg-white px-4 sm:px-7.5 lg:px-11 top-0 right-0 modal-content flex flex-col`}
      >
        <div className="sticky top-0 bg-white flex items-center justify-between pb-7 pt-4 sm:pt-7.5 lg:pt-11 border-b border-gray-3 mb-7.5">
          <h2 className="font-medium text-dark text-lg sm:text-2xl">
            Cart View
          </h2>
          <button
            onClick={() => handleCartClick()}
            aria-label="button for close modal"
            className="flex items-center justify-center ease-in duration-150 text-dark-5 hover:text-dark"
          >
            <svg
              className="text-dark hover:text-dark-5"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              transform="rotate(0 0 0)"
            >
              <path
                d="M6.21967 7.28033C5.92678 6.98744 5.92678 6.51256 6.21967 6.21967C6.51256 5.92678 6.98744 5.92678 7.28033 6.21967L11.999 10.9384L16.7176 6.2198C17.0105 5.92691 17.4854 5.92691 17.7782 6.2198C18.0711 6.51269 18.0711 6.98757 17.7782 7.28046L13.0597 11.999L17.7782 16.7176C18.0711 17.0105 18.0711 17.4854 17.7782 17.7782C17.4854 18.0711 17.0105 18.0711 16.7176 17.7782L11.999 13.0597L7.28033 17.7784C6.98744 18.0713 6.51256 18.0713 6.21967 17.7784C5.92678 17.4855 5.92678 17.0106 6.21967 16.7177L10.9384 11.999L6.21967 7.28033Z"
                fill="currentColor"
              />
            </svg>
          </button>
        </div>

        <div className="h-[66vh] overflow-y-auto no-scrollbar">
          <div className="flex flex-col gap-6">
            {/* <!-- cart item --> */}
            {cartCount ? (
              <>
                {Object.values(cartDetails ?? {}).map((item, key) => (
                  <SingleItem toggle={handleCartClick} key={key} item={item} />
                ))}
              </>
            ) : (
              <EmptyCart />
            )}
          </div>
        </div>

        <div className="border-t border-gray-3 bg-white pt-5 pb-4 sm:pb-7.5 lg:pb-11 sticky bottom-0 mt-auto">
          <div className="flex items-center justify-between gap-5 mb-6">
            <p className="font-medium text-xl text-dark">Subtotal:</p>

            <p className="font-medium text-xl text-dark">
              ${formatPrice(convertCartPriceToDollars(totalPrice))}
            </p>
          </div>

          <div className="flex items-center gap-4">
            <Link
              onClick={() => handleCartClick()}
              href="/cart"
              className="group w-full inline-flex items-center justify-center gap-2 rounded-[10px] border border-transparent bg-[#2958A4] text-white text-[16px] font-medium px-6 py-3 transition-all duration-300 ease-in-out hover:bg-[#214683]"
              style={{ fontFamily: 'Satoshi, sans-serif' }}
            >
              <ButtonArrow />
              <span>View Cart</span>
            </Link>

            <button
              onClick={(e) => handleCheckoutClick(e)}
              className="group w-full inline-flex items-center justify-center gap-2 rounded-[10px] border border-transparent bg-[#2958A4] text-white text-[16px] font-medium px-6 py-3 transition-all duration-300 ease-in-out hover:bg-[#214683]"
              style={{ fontFamily: 'Satoshi, sans-serif' }}
            >
              <ButtonArrow />
              <span>Checkout</span>
            </button>
          </div>
        </div>
      </div>
      {/* </div> */}
    </>
  );
};

export default CartSidebarModal;
