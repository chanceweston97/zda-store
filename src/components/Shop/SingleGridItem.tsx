"use client";
import { useModalContext } from "@/app/context/QuickViewModalContext";
import { EyeIcon, HeartIcon, HeartSolid } from "@/assets/icons";
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
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { useShoppingCart } from "use-shopping-cart";
import { useAutoOpenCart } from "../Providers/AutoOpenCartProvider";
import CheckoutBtn from "./CheckoutBtn";
import ReviewStar from "./ReviewStar";
import { useEffect, useState } from "react";
import { ButtonArrow } from "@/components/Common/ButtonArrow";

const SingleGridItem = ({ item }: { item: Product }) => {
  const { openModal } = useModalContext();

  const dispatch = useDispatch<AppDispatch>();

  const { cartDetails } = useShoppingCart();
  const { addItemWithAutoOpen } = useAutoOpenCart();
  const isItemInCart = Object.values(cartDetails ?? {}).some(
    (cartItem) => cartItem.id?.toString() === item._id?.toString()
  );

  const wishlistItems = useAppSelector((state) => state.wishlistReducer.items);

  const isItemInWishlist = Object.values(wishlistItems ?? {}).some(
    (wishlistItem) => wishlistItem._id?.toString() === item._id?.toString()
  );

  const productPrice = getProductPrice(item);
  
  // Validate price before allowing add to cart
  if (productPrice <= 0) {
    console.warn(`Product "${item.name}" has invalid price: ${productPrice}`);
  }
  
  // Log product details for debugging (shop page only)
  console.log('[Shop Page - SingleGridItem] Product Details:', {
    name: item.name,
    id: item._id,
    hasVariants: !!(item as any).variants,
    variantsCount: (item as any).variants?.length || 0,
    variants: (item as any).variants,
    parentSku: (item as any).sku,
    metadataSku: (item as any).metadata?.sku,
    productType: item.productType
  });
  
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
  
  console.log('[Shop Page - SingleGridItem] Final SKU:', sku);
  
  const cartItem = {
    id: item._id,
    name: item.name,
    price: Math.max(1, productPrice * 100), // Ensure minimum 1 cent
    currency: "usd",
    image: item?.previewImages
      ? imageBuilder(item?.previewImages[0]?.image).url()
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
    if (isItemInWishlist) {
      dispatch(removeItemFromWishlist(item._id));
      toast.success("Product removed from wishlist!");
    } else {
      dispatch(
        addItemToWishlist({
          ...item,
          _id: item._id,
          quantity: 1,
        })
      );
      toast.success("Product added to wishlist!");
    }
  };

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="group">
      <div className="relative overflow-hidden flex items-center justify-center rounded-lg bg-white shadow-1 min-h-[200px] mb-4">
        <Link href={`/products/${item?.slug?.current}`} prefetch={false}>
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
            className="flex items-center justify-center w-9 h-9 rounded-full shadow-1 ease-out border-gray-2 duration-200 border text-dark bg-white hover:text-blue"
          >
            <EyeIcon className="w-5 h-5" />
          </button>

          {isItemInCart ? (
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
            className="flex items-center justify-center w-9 h-9 rounded-full shadow-1 ease-out duration-200 border border-gray-2 text-dark bg-white hover:text-blue"
          >
            {mounted ? (
              isItemInWishlist ? (
                <HeartSolid className="w-5 h-5" />
              ) : (
                <HeartIcon className="w-5 h-5" />
              )
            ) : null}
          </button>
        </div>
      </div>

      <div>
        {/* Title + SKU + Price section (like PDP - only this in the block) */}
        <div
          className="mb-3"
          style={{
            padding: '12px',
            borderRadius: '10px',
            background: '#F1F6FF'
          }}
        >
          {/* SKU */}
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
                display: 'block',
                marginBottom: '4px'
              }}
            >
              {sku}
            </span>
          )}

          {/* Product Title */}
          <Link href={`/products/${item?.slug?.current}`} prefetch={false}>
            <h3 
              className="font-medium text-dark ease-out duration-200 hover:text-blue line-clamp-2"
              style={{
                fontFamily: 'Satoshi, sans-serif',
                fontSize: '18px',
                fontWeight: 500,
                lineHeight: '24px',
                margin: 0,
                marginBottom: '6px'
              }}
            >
              {item.name}
            </h3>
          </Link>

          {/* Price - range like PDP when variants exist */}
          <span 
            className="text-dark font-medium"
            style={{
              fontFamily: 'Satoshi, sans-serif',
              fontSize: '18px',
              fontWeight: 500
            }}
          >
            {getProductPriceDisplay(item)}
          </span>
        </div>

        {/* Short Description - outside title/price block, above features (like PDP) */}
        {item.shortDescription && (
          <p 
            className="mb-3"
            style={{
              color: '#000',
              fontFamily: 'Satoshi, sans-serif',
              fontSize: '14px',
              fontWeight: 400,
              lineHeight: '20px'
            }}
          >
            {item.shortDescription}
          </p>
        )}

        {/* Features */}
        {(item as any).features && (() => {
          const features = (item as any).features;
          if (Array.isArray(features) && features.length > 0) {
            return (
              <ul className="space-y-1">
                {features.slice(0, 3).map((feature: string, index: number) => (
                  <li key={index} className="flex items-start gap-1.5">
                    <span className="text-gray-600" style={{ fontSize: '12px' }}>•</span>
                    <span
                      className="text-gray-600"
                      style={{
                        fontFamily: 'Satoshi, sans-serif',
                        fontSize: '12px',
                        fontWeight: 400,
                        lineHeight: '18px'
                      }}
                    >
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>
            );
          }
          return null;
        })()}
      </div>
    </div>
  );
};

export default SingleGridItem;
