import { EmptyCartIcon } from "@/assets/icons";
import Link from "next/link";
import { useShoppingCart } from "use-shopping-cart";

const EmptyCart = () => {
  const { handleCartClick } = useShoppingCart();

  return (
    <div className="text-center py-10">
      <div className="mx-auto pb-7.5">
        <EmptyCartIcon className="mx-auto" />
      </div>

      <p className="pb-6">Your cart is empty!</p>

      <Link
        onClick={() => {
          handleCartClick();
        }}
        href="/shop"
        className="w-full lg:w-10/12 mx-auto inline-flex items-center justify-center rounded-full border border-transparent bg-[#2958A4] text-white text-sm font-medium px-6 py-3 transition-colors hover:border-[#2958A4] hover:bg-white hover:text-[#2958A4]"
      >
        Continue Shopping
      </Link>
    </div>
  );
};

export default EmptyCart;
