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
import { getProductPrice, getProductPriceDisplay } from "@/utils/getProductPrice";
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
import { ButtonArrow } from "@/components/Common/ButtonArrow";

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
  
  // Get SKU - Priority: First variation SKU → Parent SKU → empty
  const sku = (() => {
    // 1️⃣ First variation SKU (if variations exist, prioritize first variation's SKU)
    if ((item as any).variants && (item as any).variants.length > 0) {
      // Get first variation's SKU (first ID's SKU - variations are sorted by ID ascending)
      const firstVariant = (item as any).variants[0];
      const firstVariantSku = firstVariant?.sku;
      
      if (firstVariantSku && firstVariantSku.trim() !== "") {
        return firstVariantSku.trim();
      } else {
        // If first variant has no SKU, find first variant with SKU
        const firstWithSku = (item as any).variants.find((v: any) => v.sku && v.sku.trim() !== "");
        if (firstWithSku) {
          return firstWithSku.sku.trim();
        }
      }
    }

    // 2️⃣ Parent SKU (fallback if no variations or first variation has no SKU)
    const parentSku = (item as any).sku;
    if (parentSku && parentSku.trim() !== "") {
      return parentSku.trim();
    }

    // 3️⃣ GainOptions SKU (for antenna products)
    if (item.productType === "antenna" && item.gainOptions && item.gainOptions.length > 0) {
      const firstGainOptionWithSku = item.gainOptions.find(
        (g: any) => {
          const gainOption = g as any;
          return gainOption?.sku && typeof gainOption.sku === 'string' && gainOption.sku.trim() !== "";
        }
      );
      if (firstGainOptionWithSku) {
        const sku = (firstGainOptionWithSku as any).sku;
        if (typeof sku === 'string') {
          return sku.trim();
        }
      }
    }

    // 4️⃣ Metadata SKU (last resort)
    const metadataSku = (item as any).metadata?.sku;
    if (metadataSku && metadataSku.trim() !== "") {
      return metadataSku.trim();
    }

    // 5️⃣ Nothing
    return null;
  })();
  
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
      <div className="relative overflow-hidden flex border items-center justify-center rounded-lg border-gray-2 bg-[#F6F7FB] min-h-[200px] mb-4">
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
            width={200}
            height={200}
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
              className="group inline-flex items-center gap-2 rounded-[10px] border border-transparent bg-[#2958A4] text-white text-[16px] font-medium px-6 py-3 transition-all duration-300 ease-in-out hover:bg-[#214683]"
              style={{ fontFamily: 'Satoshi, sans-serif' }}
            >
              <ButtonArrow />
              <span>Add to cart</span>
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
        style={{
          fontFamily: 'Satoshi, sans-serif',
          fontSize: '30px',
          fontWeight: 500,
          lineHeight: '36px',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap'
        }}
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

      {/* SKU Display */}
      {sku && (
        <span
          style={{
            color: '#457B9D',
            fontFamily: 'Satoshi, sans-serif',
            fontSize: '14px',
            fontStyle: 'normal',
            fontWeight: 500,
            lineHeight: '20px',
            letterSpacing: '-0.28px',
            marginBottom: '4px',
            display: 'block'
          }}
        >
          {sku}
        </span>
      )}

      <span className="flex items-center gap-2 font-medium" style={{ fontSize: '30px', fontFamily: 'Satoshi, sans-serif' }}>
        <span className="text-dark">{getProductPriceDisplay(item)}</span>
        {item.discountedPrice && item.discountedPrice < productPrice && (
          <span className="line-through text-dark-4">${formatPrice(productPrice)}</span>
        )}
      </span>
    </div>
  );
};

export default ProductItem;
