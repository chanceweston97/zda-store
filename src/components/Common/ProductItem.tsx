"use client";
import { useModalContext } from "@/app/context/QuickViewModalContext";
import { EyeIcon, HeartIcon, HeartSolid } from "@/assets/icons";
import { updateproductDetails } from "@/redux/features/product-details";
import { updateQuickView } from "@/redux/features/quickView-slice";
import {
  addItemToWishlist,
  removeItemFromWishlist,
} from "@/redux/features/wishlist-slice";
import { AppDispatch, useAppSelector } from "@/redux/store";
import { imageBuilder } from "@/lib/data/shop-utils";
import { Product } from "@/types/product";
import { getProductPrice } from "@/utils/getProductPrice";
import { formatPrice } from "@/utils/price";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { useShoppingCart } from "use-shopping-cart";
import { useAutoOpenCart } from "../Providers/AutoOpenCartProvider";
import CheckoutBtn from "../Shop/CheckoutBtn";
import { useEffect, useState } from "react";

// add updated the type here
const ProductItem = ({ item }: { item: Product }) => {
  const { openModal } = useModalContext();
  // const [product, setProduct] = useState({});
  const dispatch = useDispatch<AppDispatch>();

  const { cartDetails } = useShoppingCart();
  const { addItemWithAutoOpen } = useAutoOpenCart();
  const wishlistItems = useAppSelector((state) => state.wishlistReducer.items);

  const pathUrl = usePathname() || "";

  const isAlradyAdded = Object.values(cartDetails ?? {}).some(
    (cartItem) => cartItem.id?.toString() === item._id?.toString()
  );

  const isAlradyWishListed = Object.values(wishlistItems ?? {}).some(
    (wishlistItem) => wishlistItem._id?.toString() === item._id?.toString()
  );

  const productPrice = getProductPrice(item);
  
  const cartItem = {
    id: item._id,
    name: item.name,
    price: productPrice * 100,
    currency: "usd",
    image: item?.thumbnails
      ? imageBuilder(item?.thumbnails[0]?.image).url()
      : "",
    price_id: null,
    slug: item?.slug?.current,
  };

  // update the QuickView state
  const handleQuickViewUpdate = () => {
    dispatch(updateQuickView({ ...item }));
  };

  // add to cart
  const handleAddToCart = () => {
    // @ts-ignore
    addItemWithAutoOpen(cartItem);

    toast.success("Product added to cart!");
  };

  const handleToggleWishList = () => {
    if (isAlradyWishListed) {
      dispatch(removeItemFromWishlist(item._id));
      toast.success("Product removed from wishlist!");
    } else {
      dispatch(
        addItemToWishlist({
          ...item,
          quantity: 1,
        })
      );
      toast.success("Product added to wishlist!");
    }
  };

  const handleProductDetails = () => {
    dispatch(updateproductDetails({ ...item }));
  };

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="group">
      <div className="relative overflow-hidden flex border items-center justify-center rounded-lg border-gray-2 bg-[#F6F7FB] min-h-[270px] mb-4">
        <Link
          href={`${
            pathUrl.includes("products")
              ? `${item?.slug?.current}`
              : `products/${item?.slug?.current}`
          }`}
        >
          <Image
            src={
              item?.previewImages
                ? imageBuilder(item?.previewImages[0]?.image).url()!
                : ""
            }
            alt={item.name}
            width={250}
            height={250}
          />
        </Link>

        <div className="absolute left-0 bottom-0 translate-y-full w-full flex items-center justify-center gap-2.5 pb-5 ease-linear duration-200 group-hover:translate-y-0">
          <button
            onClick={() => {
              openModal();
              handleQuickViewUpdate();
            }}
            aria-label="button for quick view"
            className="flex items-center justify-center w-9 h-9 rounded-full shadow-1 ease-out duration-200 text-dark bg-white hover:text-blue"
          >
            <EyeIcon className="w-5 h-5" />
          </button>

          {isAlradyAdded ? (
            <CheckoutBtn />
          ) : (
            <button
              onClick={() => handleAddToCart()}
              className="inline-flex items-center rounded-full border border-transparent bg-[#2958A4] text-white text-sm font-medium px-6 py-3 transition-colors hover:border-[#2958A4] hover:bg-white hover:text-[#2958A4]"
            >
              Add to cart
            </button>
          )}

          <button
            onClick={handleToggleWishList}
            aria-label="button for favorite select"
            className={`flex items-center justify-center w-9 h-9 rounded-full shadow-1 ease-out duration-200 text-dark bg-white hover:text-blue`}
          >
            {mounted ? (
              isAlradyWishListed ? (
                <HeartSolid className="w-5 h-5" />
              ) : (
                <HeartIcon className="w-5 h-5" />
              )
            ) : null}
          </button>
        </div>
      </div>

      <h3
        className="font-medium text-dark ease-out duration-200 hover:text-blue mb-1.5 line-clamp-1"
        onClick={() => handleProductDetails()}
      >
        <Link
          href={`${
            pathUrl.includes("products")
              ? `${item?.slug?.current}`
              : `products/${item?.slug?.current}`
          }`}
        >
          {" "}
          {item.name}{" "}
        </Link>
      </h3>

      <span className="flex items-center gap-2 text-lg font-medium">
        <span className="text-dark">${formatPrice(productPrice * 100)}</span>
        {item.discountedPrice && item.discountedPrice < productPrice && (
          <span className="line-through text-dark-4">${formatPrice(productPrice * 100)}</span>
        )}
      </span>
    </div>
  );
};

export default ProductItem;
