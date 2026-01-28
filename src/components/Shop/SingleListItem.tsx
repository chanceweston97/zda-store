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
import { getProductPrice } from "@/utils/getProductPrice";
import { formatPrice } from "@/utils/price";
import Image from "next/image";
import Link from "next/link";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { useShoppingCart } from "use-shopping-cart";
import { useAutoOpenCart } from "../Providers/AutoOpenCartProvider";
import CheckoutBtn from "./CheckoutBtn";
import { useEffect, useState } from "react";
import { ButtonArrow } from "@/components/Common/ButtonArrow";

const SingleListItem = ({ item }: { item: Product }) => {
  const { openModal } = useModalContext();
  const dispatch = useDispatch<AppDispatch>();

  const { cartDetails } = useShoppingCart();
  const { addItemWithAutoOpen } = useAutoOpenCart();
  const wishlistItems = useAppSelector((state) => state.wishlistReducer.items);

  const isItemInCart = Object.values(cartDetails ?? {}).some(
    (cartItem) => cartItem.id.toString() === item._id.toString()
  );

  const isItemInWishlist = Object.values(wishlistItems ?? {}).some(
    (wishlistItem) => wishlistItem._id.toString() === item._id.toString()
  );

  const productPrice = getProductPrice(item);
  
  // Validate price before allowing add to cart
  if (productPrice <= 0) {
    console.warn(`Product "${item.name}" has invalid price: ${productPrice}`);
  }
  
  const cartItem = {
    id: item._id,
    name: item.name,
    price: Math.max(1, productPrice * 100), // Ensure minimum 1 cent
    currency: "usd",
    image: item?.previewImages?.[0]?.image
      ? imageBuilder(item.previewImages[0].image).url()!
      : item?.thumbnails?.[0]?.image
      ? imageBuilder(item.thumbnails[0].image).url()!
      : item?.connector?.image
      ? imageBuilder(item.connector.image).url()!
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
      const wishlistPrice = productPrice || item.price || 0;
      dispatch(
        addItemToWishlist({
          ...item,
          quantity: 1,
          price: wishlistPrice,
          discountedPrice: item.discountedPrice || wishlistPrice,
        })
      );
      toast.success("Product added to wishlist!");
    }
  };

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  // Check if product has a valid image
  const hasImage = !!(item?.previewImages?.[0]?.image || item?.thumbnails?.[0]?.image || item?.connector?.image);
  
  const productImageUrl = item?.previewImages?.[0]?.image
                  ? imageBuilder(item.previewImages[0].image).url()!
                  : item?.thumbnails?.[0]?.image
                  ? imageBuilder(item.thumbnails[0].image).url()!
                  : item?.connector?.image
                  ? imageBuilder(item.connector.image).url()!
    : null;

  // Log product details for debugging (shop page only)
  console.log('[Shop Page - SingleListItem] Product Details:', {
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
  // When variations exist, show first variation's SKU (first ID's SKU)
  const sku = (() => {
    // 1️⃣ First variation SKU (if variations exist, prioritize first variation's SKU)
    // Variations are sorted by ID in convertWCToProduct, so [0] is the first (lowest ID)
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

  console.log('[Shop Page - SingleListItem] Final SKU:', sku);

  return (
    <div className="bg-white rounded-lg shadow-1 overflow-hidden mb-6">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* LEFT: Product Image - Fixed 300x300px */}
        <div className="flex-shrink-0 relative mx-auto lg:mx-0">
          <div 
            className="relative rounded-lg border border-gray-3 flex items-center justify-center bg-gray-1 overflow-hidden"
            style={{
              width: '300px',
              height: '300px',
              aspectRatio: '1/1'
            }}
          >
            {hasImage && productImageUrl ? (
              <Link href={`/products/${item?.slug?.current}`} prefetch={false}>
                <Image
                  src={productImageUrl}
              alt={item.name}
                  fill
                  className="object-contain"
                  sizes="300px"
            />
          </Link>
            ) : (
              <div className="flex items-center justify-center w-full h-full p-4">
                <p 
                  className="text-center text-gray-500 text-sm"
                  style={{
                    fontFamily: 'Satoshi, sans-serif',
                    fontSize: '14px',
                    fontWeight: 400,
                    color: '#6B7280'
                  }}
                >
                  No Product Image Available
                </p>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: Product Info - Takes remaining space */}
        <div className="flex-1 flex flex-col justify-start px-4 lg:px-0">
          {/* SKU, Title, Price in Rectangle - On Top */}
          <div
            style={{
              display: 'flex',
              padding: '15px',
              flexDirection: 'column',
              alignItems: 'flex-start',
              gap: '5px',
              alignSelf: 'stretch',
              borderRadius: '10px',
              background: '#F1F6FF',
              marginBottom: '16px'
            }}
          >
            {/* SKU - Like PDP - Always show if available */}
            {sku ? (
              <span
                style={{
                  color: '#457B9D',
                  fontFamily: 'Satoshi, sans-serif',
                  fontSize: '16px',
                  fontStyle: 'normal',
                  fontWeight: 500,
                  lineHeight: '26px',
                  letterSpacing: '-0.32px'
                }}
              >
                {sku}
              </span>
            ) : null}

            {/* Product Title */}
            <Link href={`/products/${item?.slug?.current}`} prefetch={false}>
              <h2
                style={{
                  color: '#000',
                  fontFamily: 'Satoshi, sans-serif',
                  fontSize: '24px',
                  fontStyle: 'normal',
                  fontWeight: 400,
                  lineHeight: '28px',
                  letterSpacing: '-0.48px',
                  margin: 0
                }}
                className="hover:text-[#2958A4] transition-colors"
              >
              {item.name}
              </h2>
            </Link>

            {/* Price */}
            <h3
              style={{
                color: '#000',
                fontFamily: 'Satoshi, sans-serif',
                fontSize: '18px',
                fontStyle: 'normal',
                fontWeight: 400,
                lineHeight: '36px',
                letterSpacing: '-0.54px',
                textTransform: 'uppercase',
                margin: 0
              }}
            >
              ${formatPrice(productPrice)}
            </h3>
          </div>

          {/* Subtitle/Short Description - Outside rectangle */}
          {item.shortDescription && (
            <p
              style={{
                color: '#000',
                fontFamily: 'Satoshi, sans-serif',
                fontSize: '16px',
                fontStyle: 'normal',
                fontWeight: 500,
                lineHeight: '26px',
                marginBottom: '16px',
                marginTop: 0
              }}
            >
              {item.shortDescription}
            </p>
          )}

          {/* Features - Outside rectangle */}
          {(item as any).features && (() => {
            const features = (item as any).features;
            if (Array.isArray(features) && features.length > 0) {
              return (
                <div className="mb-4">
                  <ul className="space-y-1">
                    {features.map((feature: string, index: number) => (
                      <li key={index} className="flex items-start gap-2">
                        <span
                          style={{
                            color: '#000',
                            fontFamily: 'Satoshi, sans-serif',
                            fontSize: '12px',
                            fontStyle: 'normal',
                            fontWeight: 400,
                            lineHeight: '26px'
                          }}
                        >
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            }
            // Handle string format - could be HTML or newline-separated
            if (typeof features === 'string' && features.trim()) {
              if (typeof window !== 'undefined') {
                const parser = new DOMParser();
                const doc = parser.parseFromString(features, 'text/html');
                const listItems = doc.querySelectorAll('li');

                if (listItems.length > 0) {
                  // HTML list format
                  return (
                    <div className="mb-4">
                      <ul className="space-y-1">
                        {Array.from(listItems).map((li, index) => {
                          const text = li.textContent || li.innerText || '';
                          return (
                            <li key={index} className="flex items-start gap-2">
                              <span
                                style={{
                                  color: '#000',
                                  fontFamily: 'Satoshi, sans-serif',
                                  fontSize: '12px',
                                  fontStyle: 'normal',
                                  fontWeight: 400,
                                  lineHeight: '26px'
                                }}
                              >
                                {text.trim()}
                              </span>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  );
                } else {
                  // Newline-separated string format
                  const featureLines = features.split('\n').filter(line => line.trim());
                  if (featureLines.length > 0) {
                    return (
                      <div className="mb-4">
                        <ul className="space-y-1">
                          {featureLines.map((feature: string, index: number) => (
                            <li key={index} className="flex items-start gap-2">
                              <span
                                style={{
                                  color: '#000',
                                  fontFamily: 'Satoshi, sans-serif',
                                  fontSize: '12px',
                                  fontStyle: 'normal',
                                  fontWeight: 400,
                                  lineHeight: '26px'
                                }}
                              >
                                {feature.trim()}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    );
                  }
                }
              } else {
                // Server-side: handle newline-separated string
                const featureLines = features.split('\n').filter(line => line.trim());
                if (featureLines.length > 0) {
                  return (
                    <div className="mb-4">
                      <ul className="space-y-1">
                        {featureLines.map((feature: string, index: number) => (
                          <li key={index} className="flex items-start gap-2">
                            <span
                              style={{
                                color: '#000',
                                fontFamily: 'Satoshi, sans-serif',
                                fontSize: '12px',
                                fontStyle: 'normal',
                                fontWeight: 400,
                                lineHeight: '26px'
                              }}
                            >
                              {feature.trim()}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                }
              }
            }
            return null;
          })()}
        </div>
      </div>
    </div>
  );
};

export default SingleListItem;
