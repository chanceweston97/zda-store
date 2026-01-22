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
        href="/products"
        className="w-full lg:w-10/12 mx-auto inline-flex items-center justify-center rounded-[10px] border border-transparent bg-[#2958A4] text-white text-[16px] font-medium px-6 py-3 transition-all duration-300 ease-in-out hover:bg-[#214683]"
        style={{ fontFamily: 'Satoshi, sans-serif' }}
      >
        Continue Shopping
      </Link>
    </div>
  );
};

export default EmptyCart;
