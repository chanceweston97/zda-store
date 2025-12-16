"use client";

import { usePreviewSlider } from "@/app/context/PreviewSliderContext";
import {
  FullScreenIcon,
  MinusIcon,
  PlusIcon,
} from "@/assets/icons";
import { updateproductDetails } from "@/redux/features/product-details";
import {
  addItemToWishlist,
  removeItemFromWishlist,
} from "@/redux/features/wishlist-slice";
import { AppDispatch, useAppSelector } from "@/redux/store";
import { imageBuilder } from "@/lib/data/shop-utils";
import { Product } from "@/types/product";
import Image from "next/image";

import { useState, useEffect, useMemo } from "react";
import { useDispatch } from "react-redux";
import { useShoppingCart } from "use-shopping-cart";
import toast from "react-hot-toast";
import { useAutoOpenCart } from "../Providers/AutoOpenCartProvider";
import Breadcrumb from "../Common/Breadcrumb";
import Newsletter from "../Common/Newsletter";
import Description from "./Description";
import RequestAQuote from "../RequestAQuote";
import FaqSection from "../Home/Faq";
import { useRouter } from "next/navigation";
import { formatPrice } from "@/utils/price";

type SelectedAttributesType = {
  [key: number]: string | undefined;
};
const productDetailsHeroData = [
  {
    img: "/images/icons/shield-check.svg",
    title: "1 Year Warranty",
  },
  {
    img: "/images/icons/truck.svg",
    title: "Orders Shipped Within 24 Business Hours"
  },
  {
    img: "/images/icons/vectorr.svg",
    title: "Complete Technical Support",
  },
];
type ShopDetailsProps = {
  product: Product;
  cableSeries?: any[] | null;
  cableTypes?: any[] | null;
};

const ShopDetails = ({ product, cableSeries, cableTypes }: ShopDetailsProps) => {
  const { openPreviewModal } = usePreviewSlider();
  const [previewImg, setPreviewImg] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [mounted, setMounted] = useState(false);

  const { cartDetails } = useShoppingCart();
  const { addItemWithAutoOpen } = useAutoOpenCart();
  const wishlistItems = useAppSelector((state) => state.wishlistReducer.items);

  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  useEffect(() => {
    setMounted(true);
  }, []);

  const isProductInCart = useMemo(
    () => Object.values(cartDetails ?? {}).some((cartItem) => cartItem.id === product._id),
    [cartDetails, product._id]
  );

  const isProductInWishlist = useMemo(
    () =>
      Object.values(wishlistItems ?? {}).some(
        (wishlistItem) => wishlistItem._id?.toString() === product._id?.toString()
      ),
    [wishlistItems, product._id]
  );

  // ---------- SAFE IMAGE HELPERS ----------

  const getImageUrl = (img: any | undefined | null): string | null => {
    if (!img) return null;
    try {
      // If img is already a string URL (from Medusa), return it directly
      if (typeof img === 'string' && (img.startsWith('http://') || img.startsWith('https://'))) {
        return img;
      }
      // Otherwise, try to use imageBuilder for Sanity assets
      const url = imageBuilder(img).url();
      return url && url.length > 0 ? url : null;
    } catch {
      // If imageBuilder fails, check if img is a string URL
      if (typeof img === 'string' && (img.startsWith('http://') || img.startsWith('https://'))) {
        return img;
      }
      return null;
    }
  };

  // main hero image: previewImages[previewImg] OR fallback to first thumbnail
  const mainImageUrl = useMemo(() => {
    const candidate =
      product.previewImages?.[previewImg]?.image ??
      product.previewImages?.[0]?.image ??
      product.thumbnails?.[0]?.image;

    return getImageUrl(candidate);
  }, [product.previewImages, product.thumbnails, previewImg]);

  // cart image: just reuse main hero image
  const cartImageUrl = mainImageUrl;
  // Ensure gainIndex is valid
  const validGainOptions = product.gainOptions?.filter((opt) => opt !== null && opt !== undefined) ?? [];
  const initialGainIndex = validGainOptions.length > 0 ? 0 : -1;
  const [gainIndex, setGainIndex] = useState(initialGainIndex);

  // Update gainIndex if it becomes invalid
  useEffect(() => {
    if (gainIndex >= (validGainOptions.length ?? 0) || gainIndex < 0) {
      setGainIndex(validGainOptions.length > 0 ? 0 : -1);
    }
  }, [product.gainOptions, gainIndex, validGainOptions.length]);

  // Connector product: Display cable series/type as buttons, select length as buttons
  const isConnectorProduct = product.productType === "connector" && product.cableSeries && product.cableType;
  // Standalone connector: from connector document, needs cable series/type selection (legacy)
  const isStandaloneConnector = product.productType === "connector" && !product.cableSeries && !product.cableType && (product.connector?.pricing || product.pricing);
  // Simple connector: new connector with direct connectorPrice field
  const isSimpleConnector = product.productType === "connector" && !product.cableSeries && !product.cableType && !product.connector?.pricing && !product.pricing && (product as any).connectorPrice;
  
  // Cable product: from cableType document, needs length selection
  const isCableProduct = product.productType === "cable";
  
  // For connector products (products with productType="connector")
  const productCableSeries = product.cableSeries?.name || "";
  // Support both direct cableType (from product) and nested cableType (from cableTypeData query)
  const cableType = product.cableType || (product as any).cableType?.cableType || null;
  const cableTypeName = cableType?.name || "";
  const cableTypePricePerFoot = cableType?.pricePerFoot ?? 0;
  // For cable products, lengthOptions come from Medusa variants
  // Medusa lengthOptions have structure: { value, price, sku, variantId }
  const rawLengthOptions = product.lengthOptions;
  const lengthOptions = Array.isArray(rawLengthOptions) && rawLengthOptions.length > 0
    ? rawLengthOptions.filter((opt: any) => {
        if (!opt) return false;
        // For Medusa cable products, check for 'value' field (e.g., "10", "25", "50")
        if (typeof opt === 'object' && opt !== null) {
          // Check if it has a value field (Medusa structure) - this is the key field
          const hasValue = opt.value !== undefined && opt.value !== null && String(opt.value).trim() !== '';
          const hasTitle = opt.title !== undefined && opt.title !== null && String(opt.title).trim() !== '';
          // Also support legacy format with 'length' property
          const hasLength = opt.length !== undefined && opt.length !== null && String(opt.length).trim() !== '';
          return hasValue || hasTitle || hasLength;
        }
        if (typeof opt === 'string') {
          return opt.trim().length > 0;
        }
        return false;
      })
    : [];
  
  const [selectedLengthIndex, setSelectedLengthIndex] = useState<number>(-1);
  const [selectedLength, setSelectedLength] = useState<string>("");
  
  // For standalone connectors: state for cable series and type selection
  const [selectedCableSeriesSlug, setSelectedCableSeriesSlug] = useState<string>("");
  const [selectedCableTypeSlug, setSelectedCableTypeSlug] = useState<string>("");
  
  // Get connector slug/name to check if it's N-Male or N-Female
  const connectorSlug = product.slug?.current?.toLowerCase() || "";
  const connectorName = product.name?.toLowerCase() || "";
  const isNTypeConnector = connectorSlug === "n-male" || connectorSlug === "n-female" || 
                           connectorName.includes("n-male") || connectorName.includes("n-female");
  
  // Get connector pricing array
  const connectorPricing = (product.connector?.pricing || product.pricing) as any[] || [];
  
  // Get available cable types based on selected series
  const availableCableTypes = useMemo(() => {
    if (!cableTypes || !selectedCableSeriesSlug) return [];
    
    // Filter by series first
    let filtered = cableTypes.filter((type: any) => type.series?.slug === selectedCableSeriesSlug);
    
    // Filter by connector pricing availability
    filtered = filtered.filter((type: any) => {
      // Check if connector has pricing for this cable type
      const hasPricing = connectorPricing.some((p: any) => p?.cableType?._id === type._id);
      if (!hasPricing) return false;
      
      // If connector is NOT N-Male or N-Female, exclude LMR 600
      if (!isNTypeConnector && type.slug === "lmr-600") {
        return false;
      }
      
      return true;
    });
    
    return filtered;
  }, [cableTypes, selectedCableSeriesSlug, isNTypeConnector, connectorPricing]);
  
  // Get selected cable type data
  const selectedCableType = useMemo(() => {
    if (!cableTypes || !selectedCableTypeSlug) return null;
    return cableTypes.find((type: any) => type.slug === selectedCableTypeSlug);
  }, [cableTypes, selectedCableTypeSlug]);
  
  // Get connector price for selected cable type (for standalone connectors)
  const standaloneConnectorPrice = useMemo(() => {
    if (!isStandaloneConnector || !selectedCableType) return 0;
    
    // Check both product.connector.pricing and product.pricing (connectorData has both)
    const pricingArray = (product.connector?.pricing || product.pricing) as any[];
    if (!pricingArray || !Array.isArray(pricingArray)) return 0;
    
    const pricing = pricingArray.find(
      (p: any) => p?.cableType?._id === selectedCableType._id
    );
    return pricing?.price ?? 0;
  }, [isStandaloneConnector, product.connector?.pricing, product.pricing, selectedCableType]);

  // Get connector price for this cable type
  const connectorPrice = useMemo(() => {
    if (!isConnectorProduct || !product.connector?.pricing || !cableType?._id) {
      return 0;
    }
    const pricing = product.connector.pricing.find(
      (p) => p?.cableType?._id === cableType._id
    );
    return pricing?.price ?? 0;
  }, [isConnectorProduct, product.connector?.pricing, cableType?._id]);

  // Helper functions for lengthOptions (similar to gainOptions)
  // For Medusa cable products, lengthOptions have: { value, price, sku, variantId }
  const getLengthValue = (option: any): string => {
    if (!option) return "";
    if (typeof option === 'string') {
      return option;
    }
    if (typeof option === 'object' && option !== null) {
      // For Medusa cable products, use 'value' field (e.g., "10", "25", "50")
      // Also check 'title' for compatibility with other formats
      return option.value || option.title || option.length || "";
    }
    return "";
  };

  const getLengthPrice = (option: any): number => {
    if (!option) return 0;
    
    // For Medusa cable products, get price from the variant's calculated_price
    // First try to get price from the variant using variantId
    if (typeof option === 'object' && option !== null && option.variantId) {
      const variant = (product as any).variants?.find((v: any) => v.id === option.variantId);
      if (variant?.calculated_price?.calculated_amount) {
        // calculated_amount is in cents, convert to dollars
        return variant.calculated_price.calculated_amount / 100;
      }
    }
    
    // Fallback: check if length option has a direct price (might be in dollars or cents)
    if (typeof option === 'object' && option !== null && 'price' in option && typeof option.price === 'number' && option.price > 0) {
      // If price is very small (< 1), it's likely already in dollars
      // If price is >= 1, it might need conversion
      const price = option.price;
      // Based on data: prices are 0.075, 0.1875, 0.375 (already in dollars)
      return price < 1 ? price : price / 100;
    }
    
    // Fallback: calculate price from pricePerFoot × length
    const lengthValue = getLengthValue(option);
    if (!lengthValue) return 0;
    
    // Try to get pricePerFoot from cableType (could be nested in cableTypeData)
    const pricePerFoot = cableTypePricePerFoot || 
                        (product.cableType?.pricePerFoot) || 
                        ((product as any).cableType?.cableType?.pricePerFoot) || 
                        0;
    if (pricePerFoot > 0) {
      const lengthInFeet = parseLengthInFeet(lengthValue);
      if (lengthInFeet > 0) {
        return pricePerFoot * lengthInFeet; // Return exact price without rounding
      }
    }
    return 0;
  };

  // Auto-select first length option (for cables) or first variant (for simple connectors)
  useEffect(() => {
    if (isCableProduct && lengthOptions.length > 0 && selectedLengthIndex < 0) {
      setSelectedLengthIndex(0);
      const firstLength = lengthOptions[0];
      setSelectedLength(getLengthValue(firstLength));
    } else if (isSimpleConnector && (product as any).variants && (product as any).variants.length > 0 && selectedLengthIndex < 0) {
      setSelectedLengthIndex(0);
    }
  }, [lengthOptions, selectedLengthIndex, isCableProduct, isSimpleConnector, product]);

  // Parse length from string (e.g., "25 ft" -> 25)
  const parseLengthInFeet = (lengthStr: string): number => {
    if (!lengthStr) return 0;
    const match = lengthStr.match(/(\d+\.?\d*)/);
    return match ? parseFloat(match[1]) : 0;
  };

  // Handle both old format (string[]) and new format (object[])
  const getGainValue = (option: any, index: number): string => {
    if (!option) return "";
    if (typeof option === 'string') {
      return option;
    }
    if (typeof option === 'object' && option !== null) {
      return option.gain ?? "";
    }
    return "";
  };

  const getGainPrice = (option: any, index: number): number => {
    // New format: object with price (price is in cents from Medusa calculated_amount)
    // Front project line 141: uses calculated_amount directly, then divides by 100 for display
    if (option && typeof option === 'object' && option !== null && 'price' in option && typeof option.price === 'number') {
      // Price is stored in cents, convert to dollars for display
      return option.price / 100;
    }
    // Old format: fallback to first gain option's price with calculation
    const firstGainOption = product.gainOptions?.[0];
    let basePrice = 0;

    // Try to get base price from first gain option (new format)
    if (firstGainOption && typeof firstGainOption === 'object' && firstGainOption !== null && 'price' in firstGainOption) {
      basePrice = firstGainOption.price || 0;
    }

    if (typeof option === 'string') {
      const getGainNumericValue = (gainStr: string): number => {
        if (!gainStr) return 0;
        const match = gainStr.match(/(\d+\.?\d*)/);
        return match ? parseFloat(match[1]) : 0;
      };
      const selectedGainValue = getGainNumericValue(option);
      const firstGain = product.gainOptions?.[0];
      const baseGainValue = firstGain ? getGainNumericValue(getGainValue(firstGain, 0)) : selectedGainValue;
      const gainMultiplier = baseGainValue > 0 ? 1 + ((selectedGainValue - baseGainValue) * 0.05) : 1;
      return Math.round(basePrice * gainMultiplier * 100) / 100;
    }
    return basePrice;
  };

  const currentGainOption = gainIndex >= 0 && product.gainOptions && gainIndex < product.gainOptions.length
    ? product.gainOptions[gainIndex]
    : null;
  const currentGain = getGainValue(currentGainOption, gainIndex);

  // Get unit price (per item, without quantity) from selected gain option or calculated from length and connector price
  const dynamicPrice = useMemo(() => {
    // For connectors with variants: use price from selected variant (cable type)
    if (product.productType === "connector" && !isConnectorProduct && !isStandaloneConnector && (product as any).variants && (product as any).variants.length > 0) {
      if (selectedLengthIndex >= 0 && (product as any).variants[selectedLengthIndex]) {
        const selectedVariant = (product as any).variants[selectedLengthIndex];
        if (selectedVariant?.calculated_price?.calculated_amount) {
          return selectedVariant.calculated_price.calculated_amount / 100; // Convert cents to dollars
        }
      }
      // Fallback to first variant's price if no selection
      const firstVariant = (product as any).variants[0];
      if (firstVariant?.calculated_price?.calculated_amount) {
        return firstVariant.calculated_price.calculated_amount / 100;
      }
      return (product as any).connectorPrice ?? product.price ?? 0;
    }
    
    // For simple connectors (legacy check)
    if (isSimpleConnector) {
      if (selectedLengthIndex >= 0 && (product as any).variants && (product as any).variants[selectedLengthIndex]) {
        const selectedVariant = (product as any).variants[selectedLengthIndex];
        if (selectedVariant?.calculated_price?.calculated_amount) {
          return selectedVariant.calculated_price.calculated_amount / 100; // Convert cents to dollars
        }
      }
      return (product as any).connectorPrice ?? product.price ?? 0;
    }
    
    // For standalone connectors: show connector price for selected cable type (legacy)
    if (isStandaloneConnector) {
      if (selectedCableTypeSlug && standaloneConnectorPrice > 0) {
        return standaloneConnectorPrice;
      }
      return product.price ?? 0;
    }
    
    // For connector products: (cableType.pricePerFoot × length) + (connector.price × 2)
    if (isConnectorProduct) {
      if (selectedLength && cableTypePricePerFoot > 0) {
        const lengthInFeet = parseLengthInFeet(selectedLength);
        const cablePrice = cableTypePricePerFoot * lengthInFeet;
        const connectorPriceTotal = connectorPrice * 2; // Connector price × 2
        const unitPrice = cablePrice + connectorPriceTotal;
        return unitPrice; // Return exact price without rounding
      }
      return product.price ?? 0;
    }
    
    // For cable products: calculate price from pricePerFoot × selected length
    if (isCableProduct && lengthOptions.length > 0) {
      if (selectedLengthIndex >= 0 && selectedLengthIndex < lengthOptions.length && selectedLength) {
        // Calculate price from selected length
        return getLengthPrice(lengthOptions[selectedLengthIndex]);
      }
      // Fallback to first length option if no selection
      const firstLength = lengthOptions[0];
      if (firstLength) {
        return getLengthPrice(firstLength);
      }
    }
    // Fallback to pricePerFoot if no lengthOptions
    if (isCableProduct && cableTypePricePerFoot > 0) {
      return cableTypePricePerFoot;
    }
    
    // For antenna products, use gain options
    if (gainIndex < 0 || !currentGainOption) {
      // Fallback to first gain option's price, or 0 if no gain options
      const firstGain = product.gainOptions?.[0];
      if (firstGain) {
        return getGainPrice(firstGain, 0);
      }
      return 0;
    }
    return getGainPrice(currentGainOption, gainIndex);
  }, [currentGainOption, gainIndex, product.gainOptions, isConnectorProduct, isStandaloneConnector, isSimpleConnector, isCableProduct, selectedLength, selectedLengthIndex, lengthOptions, cableTypePricePerFoot, connectorPrice, product.price, selectedCableTypeSlug, standaloneConnectorPrice, (product as any).variants]);

  // Calculate total price for display (unit price × quantity)
  const totalPrice = useMemo(() => {
    if (!dynamicPrice) return 0;
    return dynamicPrice * quantity; // Return exact price without rounding
  }, [dynamicPrice, quantity]);

  const cartItem = {
    id: product._id,
    name: product.name,
    price: dynamicPrice * 100, // Convert to cents
    currency: "usd",
    image: cartImageUrl ?? undefined,
    price_id: product?.price_id,
    slug: product?.slug?.current,
    gain: currentGain,
    // Add connector product info
    ...(isConnectorProduct && {
      ...(productCableSeries && { cableSeries: productCableSeries }),
      ...(cableType && { 
        cableType,
        cableTypeId: product.cableType?._id,
      }),
      ...(selectedLength && {
        length: selectedLength,
      }),
    }),
    // Add cable product info
    ...(isCableProduct && {
      ...(cableType && { 
        cableType,
        cableTypeId: cableType._id,
      }),
      ...(selectedLength && {
        length: selectedLength,
      }),
    }),
    // Add standalone connector info
    ...(isStandaloneConnector && {
      ...(selectedCableSeriesSlug && { cableSeriesSlug: selectedCableSeriesSlug }),
      ...(selectedCableTypeSlug && { 
        cableTypeSlug: selectedCableTypeSlug,
        cableTypeId: selectedCableType?._id,
      }),
    }),
    // Add connector with variants info (variant ID for cable type)
    ...(product.productType === "connector" && !isConnectorProduct && !isStandaloneConnector && selectedLengthIndex >= 0 && (product as any).variants && (product as any).variants[selectedLengthIndex] && {
      variantId: (product as any).variants[selectedLengthIndex].id,
      cableType: (product as any).variants[selectedLengthIndex].title || (product as any).variants[selectedLengthIndex].sku,
    }),
    // Add simple connector info (variant ID for cable type) - legacy
    ...(isSimpleConnector && selectedLengthIndex >= 0 && (product as any).variants && (product as any).variants[selectedLengthIndex] && {
      variantId: (product as any).variants[selectedLengthIndex].id,
      cableType: (product as any).variants[selectedLengthIndex].title || (product as any).variants[selectedLengthIndex].sku,
    }),
  };

  // pass the product here when you get the real data.
  const handlePreviewSlider = () => {
    dispatch(updateproductDetails(product));
    openPreviewModal();
  };

  const handleCheckout = async () => {
    // For connector products, validate length is selected
    if (isConnectorProduct) {
      if (!selectedLength) {
        toast.error("Please select a length");
        return;
      }
    }
    
    // For cable products, validate length is selected
    if (isCableProduct) {
      if (selectedLengthIndex < 0 || !selectedLength) {
        toast.error("Please select a length");
        return;
      }
    }
    
    // For standalone connectors, validate cable series and type are selected
    if (isStandaloneConnector) {
      if (!selectedCableSeriesSlug || !selectedCableTypeSlug) {
        toast.error("Please select both Cable Series and Cable Type");
        return;
      }
    }

    // Use quantity for both antenna and connector products
    const itemQuantity = quantity;
    // @ts-ignore
    addItemWithAutoOpen(cartItem, itemQuantity);

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        body: JSON.stringify([
          {
            ...cartItem,
            quantity: itemQuantity,
          },
        ]),
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      if (data?.url) {
        window.location.href = data?.url;
      }
    } catch (error: any) {
      console.log(error.message);
    }
  };

  const handleAddToCart = async () => {
    // For connector products, validate length is selected
    if (isConnectorProduct) {
      if (!selectedLength) {
        toast.error("Please select a length");
        return;
      }
    }
    
    // For cable products, validate length is selected
    if (isCableProduct) {
      if (selectedLengthIndex < 0 || !selectedLength) {
        toast.error("Please select a length");
        return;
      }
    }
    
    // For standalone connectors, validate cable series and type are selected
    if (isStandaloneConnector) {
      if (!selectedCableSeriesSlug || !selectedCableTypeSlug) {
        toast.error("Please select both Cable Series and Cable Type");
        return;
      }
    }

    // For connectors with variants, validate cable type (variant) is selected
    if (product.productType === "connector" && !isConnectorProduct && !isStandaloneConnector && (product as any).variants && (product as any).variants.length > 0) {
      if (selectedLengthIndex < 0 || !(product as any).variants[selectedLengthIndex]) {
        toast.error("Please select a Cable Type");
        return;
      }
    }
    
    // For simple connectors (legacy check)
    if (isSimpleConnector) {
      if (selectedLengthIndex < 0 || !(product as any).variants || !(product as any).variants[selectedLengthIndex]) {
        toast.error("Please select a Cable Type");
        return;
      }
    }

    // Use quantity for both antenna and connector products
    const itemQuantity = quantity;
    // @ts-ignore
    addItemWithAutoOpen(cartItem, itemQuantity);
    toast.success("Product added to cart!");
  };

  const handleToggleWishlist = () => {
    if (isProductInWishlist) {
      dispatch(removeItemFromWishlist(product._id));
      toast.success("Product removed from wishlist!");
    } else {
      dispatch(
        addItemToWishlist({
          _id: product._id,
          name: product.name,
          price: dynamicPrice,
          discountedPrice: product.discountedPrice || dynamicPrice,
          thumbnails: product.thumbnails,
          status: product.status,
          quantity: 1,
          reviews: product.reviews || [],
          slug: product.slug,
        })
      );
      toast.success("Product added to wishlist!");
    }
  };

  const [selectedAttributes, setSelectedAttributes] =
    useState<SelectedAttributesType>({});

  const toggleSelectedAttribute = (itemIndex: number, attributeId: string) => {
    setSelectedAttributes((prevSelected) => ({
      ...prevSelected,
      [itemIndex]: attributeId,
    }));
  };

  return (
    <>
      <section className="relative pt-10 pb-10 overflow-hidden lg:pt-[159px] xl:pt-[159px]">
        <div className="w-full px-4 mx-auto max-w-[1340px] sm:px-6 xl:px-0 ">
          <div className="flex flex-col lg:flex-row gap-7.5 xl:gap-16">
            {/* LEFT: GALLERY */}
            <div className="w-full lg:w-1/2">
              <div className="lg:min-h-[512px] rounded-lg border border-gray-3 p-4 sm:p-7.5 relative flex items-center justify-center">
                <div>
                  <button
                    onClick={handlePreviewSlider}
                    aria-label="button for zoom"
                    className="gallery__Image w-11 h-11 rounded-full bg-gray-1 shadow-1 flex items-center justify-center ease-out duration-200 text-dark hover:text-[#2958A4] absolute top-4 lg:top-6 right-4 lg:right-6 z-50"
                  >
                    <FullScreenIcon className="w-6 h-6" />
                  </button>

                  {mainImageUrl && (
                    <Image
                      src={mainImageUrl}
                      alt={product.name}
                      width={400}
                      height={400}
                    />
                  )}
                </div>
              </div>

              <div className="flex flex-wrap sm:flex-nowrap gap-4.5 mt-6">
                {product.thumbnails
                  ?.filter((thumb: any) => !!thumb?.image)
                  .map((item: any, key: number) => {
                    const thumbUrl = getImageUrl(item.image);
                    if (!thumbUrl) return null;

                    return (
                      <button
                        onClick={() => setPreviewImg(key)}
                        key={key}
                        className={`flex items-center justify-center w-15 sm:w-25 h-15 sm:h-25 overflow-hidden rounded-lg bg-gray-2 shadow-1 ease-out duration-200 border-2 hover:border-[#2958A4] ${key === previewImg ? "border-[#2958A4]" : "border-transparent"
                          }`}
                      >
                        <Image
                          width={50}
                          height={50}
                          src={thumbUrl}
                          alt="thumbnail"
                        />
                      </button>
                    );
                  })}
              </div>
            </div>

            {/* RIGHT: PRODUCT CONTENT */}
            <div className="w-full lg:w-1/2">
              {/* SKU Display - Use SKU from selected variant or product */}
              {(() => {
                // For connector products with cableSeries and cableType (isConnectorProduct)
                if (isConnectorProduct && (product as any).variants && (product as any).variants.length > 0) {
                  // Use selected variant if available, otherwise use first variant
                  const variantIndex = selectedLengthIndex >= 0 ? selectedLengthIndex : 0;
                  const selectedVariant = (product as any).variants[variantIndex];
                  const displaySku = selectedVariant?.sku || (product as any).sku;
                  return displaySku ? (
                    <div className="mb-3">
                      <span className="text-[#383838] text-[16px] font-medium">
                        <span className="bg-[#2958A4] text-white px-[30px] py-[10px] rounded-full font-normal">{displaySku}</span>
                      </span>
                    </div>
                  ) : null;
                }
                // For standalone connectors
                if (isStandaloneConnector) {
                  // Show product SKU or first variant SKU if available
                  const displaySku = (product as any).sku || 
                                    ((product as any).variants && (product as any).variants.length > 0 && (product as any).variants[0]?.sku);
                  return displaySku ? (
                    <div className="mb-3">
                      <span className="text-[#383838] text-[16px] font-medium">
                        <span className="bg-[#2958A4] text-white px-[30px] py-[10px] rounded-full font-normal">{displaySku}</span>
                      </span>
                    </div>
                  ) : null;
                }
                // For simple connectors and other connectors with variants, use SKU from selected variant (cable type)
                if (product.productType === "connector" && (product as any).variants && (product as any).variants.length > 0) {
                  // Use selected variant if available, otherwise use first variant
                  const variantIndex = selectedLengthIndex >= 0 ? selectedLengthIndex : 0;
                  const selectedVariant = (product as any).variants[variantIndex];
                  const displaySku = selectedVariant?.sku || (product as any).sku;
                  return displaySku ? (
                    <div className="mb-3">
                      <span className="text-[#383838] text-[16px] font-medium">
                        <span className="bg-[#2958A4] text-white px-[30px] py-[10px] rounded-full font-normal">{displaySku}</span>
                      </span>
                    </div>
                  ) : null;
                }
                // For cable products, use SKU from selected length option
                if (isCableProduct && lengthOptions.length > 0) {
                  const selectedLengthOption = selectedLengthIndex >= 0 ? lengthOptions[selectedLengthIndex] : lengthOptions[0];
                  const displaySku = (selectedLengthOption as any)?.sku || 
                                    (product as any).sku || 
                                    ((product as any).variants && (product as any).variants.length > 0 && 
                                     ((product as any).variants[selectedLengthIndex >= 0 ? selectedLengthIndex : 0]?.sku));
                  return displaySku ? (
                    <div className="mb-3">
                      <span className="text-[#383838] text-[16px] font-medium">
                        <span className="bg-[#2958A4] text-white px-[30px] py-[10px] rounded-full font-normal">{displaySku}</span>
                      </span>
                    </div>
                  ) : null;
                }
                // For antenna products, use SKU from selected gain option
                if (product.productType === "antenna" && currentGainOption) {
                  const displaySku = (currentGainOption as any)?.sku || 
                                    (product as any).sku || 
                                    ((product as any).variants && (product as any).variants.length > 0 && (product as any).variants[0]?.sku) ||
                                    (product.gainOptions && product.gainOptions.length > 0 && (product.gainOptions[0] as any)?.sku);
                  return displaySku ? (
                    <div className="mb-3">
                      <span className="text-[#383838] text-[16px] font-medium">
                        <span className="bg-[#2958A4] text-white px-[30px] py-[10px] rounded-full font-normal">{displaySku}</span>
                      </span>
                    </div>
                  ) : null;
                }
                // For other products, show SKU if available
                const displaySku = (product as any).sku || ((product as any).variants && (product as any).variants.length > 0 && (product as any).variants[0]?.sku);
                return displaySku ? (
                  <div className="mb-3">
                    <span className="text-[#383838] text-[16px] font-medium">
                      <span className="bg-[#2958A4] text-white px-[30px] py-[10px] rounded-full font-normal">{displaySku}</span>
                    </span>
                  </div>
                ) : null;
              })()}
              {/* Tags/Categories - Show for all products (remove duplicates) */}
              {/* For cable products, only show actual tags (not category names) */}
              {product.tags && Array.isArray(product.tags) && product.tags.length > 0 && (() => {
                // Helper function to normalize tag for comparison (lowercase, trim, remove plural 's')
                const normalizeTag = (tag: string): string => {
                  const normalized = tag.toLowerCase().trim();
                  // Remove trailing 's' for plural forms (e.g., "connectors" -> "connector")
                  // But keep it if the tag is just "s" or ends with "ss" (like "class")
                  if (normalized.length > 1 && normalized.endsWith('s') && !normalized.endsWith('ss')) {
                    return normalized.slice(0, -1);
                  }
                  return normalized;
                };
                
                // Remove duplicates using normalized comparison
                const seen = new Set<string>();
                const uniqueTags: string[] = [];
                for (const tag of product.tags) {
                  const tagText = typeof tag === 'string' ? tag : String(tag);
                  if (tagText && tagText.trim()) {
                    const normalized = normalizeTag(tagText);
                    if (!seen.has(normalized)) {
                      seen.add(normalized);
                      uniqueTags.push(tagText.trim());
                    }
                  }
                }
                
                return uniqueTags.length > 0 ? (
                  <ul className="flex flex-wrap items-center gap-2 mb-3">
                    {uniqueTags.map((tagText, index) => (
                      <li key={index} className="flex items-center gap-2 p-2">
                        <span className="text-black text-[20px] font-normal">•</span>
                        <span className="text-black text-[20px] font-normal">{tagText}</span>
                      </li>
                    ))}
                  </ul>
                ) : null;
              })()}

              {/* Product Title */}
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-[#2958A4] text-[48px] font-medium leading-[58px] tracking-[-1.92px]">
                  {product.name}
                </h2>
              </div>

              {/* Price */}
              <h3 className="font-medium text-custom-1 mb-4">
                <span className="text-black text-[36px] font-medium leading-9 tracking-[-1.08px] uppercase">
                  ${formatPrice(totalPrice * 100)}
                </span>
              </h3>

              <form onSubmit={(e) => e.preventDefault()}>
                <div className="flex flex-col mt-3 py-2">
                  {/* Subtitle - Under price (hide for cable products) */}
                  {!isCableProduct && (product as any).subtitle && (
                    <p className="text-black text-[24px] font-medium leading-[26px] mb-4">
                      {(product as any).subtitle}
                    </p>
                  )}

                  {/* Features - Display as plain text under subtitle (hide for cable products) */}
                  {!isCableProduct && (product as any).features && typeof (product as any).features === 'string' && (product as any).features.trim() && (
                    <div className="mt-2">
                      <p className="text-black text-[16px] font-medium leading-[26px] whitespace-pre-line">
                        {(product as any).features}
                      </p>
                    </div>
                  )}

                  {/* Applications - Display as plain text under features (hide for cable products) */}
                  {!isCableProduct && (product as any).applications && typeof (product as any).applications === 'string' && (product as any).applications.trim() && (
                    <div className="mt-2">
                      <p className="text-black text-[16px] font-medium leading-[26px] whitespace-pre-line">
                        {(product as any).applications}
                      </p>
                    </div>
                  )}

                  <div className="mt-2 w-full space-y-4">
                      {/* Gain - Full Width Row (Antenna products only) */}
                      {!isConnectorProduct && !isCableProduct && product.gainOptions && product.gainOptions.length > 0 && (
                        <div className="space-y-2">
                          <label className="text-black text-[20px] font-medium leading-[30px]">
                            Gains
                          </label>

                          <div className="flex flex-wrap gap-2">
                            {product.gainOptions?.map((gainOption: any, index: number) => {
                              if (gainOption === null || gainOption === undefined) return null;
                              // Use variant.title directly (like front project)
                              const gainTitle = gainOption.title || gainOption.value || "";
                              if (!gainTitle) return null;
                              const isSelected = gainIndex === index;
                              
                              return (
                                <button
                                  key={gainOption.id || index}
                                  type="button"
                                  onClick={() => setGainIndex(index)}
                                  className={`rounded border flex items-center justify-center text-center text-[16px] leading-[26px] font-medium transition-all duration-200 whitespace-nowrap px-4 py-2 w-20 ${
                                    isSelected
                                      ? "border-[#2958A4] bg-[#2958A4] text-white"
                                      : "border-[#2958A4] bg-white text-gray-800"
                                  }`}
                                >
                                  {gainTitle} dBi
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Connector Products: Cable Series, Cable Type, Length, and Quantity */}
                      {isConnectorProduct && (
                        <>
                          {/* Cable Series - Button style */}
                          {productCableSeries && (
                            <div className="space-y-2">
                              <label className="text-black text-[20px] font-medium leading-[30px]">
                                Cable Series
                              </label>
                              <div className="flex flex-wrap gap-2">
                                <button
                                  type="button"
                                  disabled
                                  className="rounded-full border-2 border-[#2958A4] bg-[#2958A4] text-white flex items-center justify-center text-center text-[16px] leading-[26px] font-medium transition-all duration-200 whitespace-nowrap px-4 py-2 cursor-default"
                                >
                                  {productCableSeries}
                                </button>
                              </div>
                            </div>
                          )}

                          {/* Cable Type - Button style */}
                          {cableTypeName && (
                            <div className="space-y-2">
                              <label className="text-black text-[20px] font-medium leading-[30px]">
                                Cable Type
                              </label>
                              <div className="flex flex-wrap gap-2">
                                <button
                                  type="button"
                                  disabled
                                  className="rounded-full border-2 border-[#2958A4] bg-[#2958A4] text-white flex items-center justify-center text-center text-[16px] leading-[26px] font-medium transition-all duration-200 whitespace-nowrap px-4 py-2 cursor-default"
                                >
                                  {cableTypeName}
                                </button>
                              </div>
                            </div>
                          )}

                          {/* Length - Button style (like gain options) */}
                          {lengthOptions.length > 0 && (
                            <div className="space-y-2 mb-4">
                              <label className="text-black text-[20px] font-medium leading-[30px]">
                                Length:
                              </label>
                              <div className="flex flex-wrap gap-2">
                                {lengthOptions.map((lengthOption, index) => {
                                  if (lengthOption === null || lengthOption === undefined) return null;
                                  const lengthValue = getLengthValue(lengthOption);
                                  if (!lengthValue) return null;
                                  const isSelected = selectedLengthIndex === index;
                                  // Ensure "ft" is in the display value
                                  const displayValue = lengthValue.includes('ft') ? lengthValue : `${lengthValue} ft`;
                                  return (
                                    <button
                                      key={index}
                                      type="button"
                                      onClick={() => {
                                        setSelectedLengthIndex(index);
                                        setSelectedLength(lengthValue);
                                      }}
                                      className={`rounded border flex items-center justify-center text-center text-[16px] leading-[26px] font-medium transition-all duration-200 whitespace-nowrap px-4 py-2 ${
                                        isSelected
                                          ? "border-[#2958A4] bg-[#2958A4] text-white"
                                          : "border-[#2958A4] bg-white text-gray-800"
                                      }`}
                                    >
                                      {displayValue}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          {/* Quantity - Full Width Row */}
                          <div className="space-y-2">
                            <label className="text-black text-[20px] font-medium leading-[30px]">
                              Quantity
                            </label>

                            <div className="flex items-center divide-x divide-[#2958A4] border border-[#2958A4] rounded-full quantity-controls w-fit">
                              <button
                                type="button"
                                onClick={() => {
                                  if (quantity > 1) {
                                    setQuantity((prev) => prev - 1);
                                  }
                                }}
                                className="flex items-center justify-center w-10 h-10 text-[#2958A4] ease-out duration-200 hover:text-[#1F4480] disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={quantity <= 1}
                              >
                                <span className="sr-only">Decrease quantity</span>
                                <MinusIcon className="w-4 h-4" />
                              </button>

                              <span className="flex items-center justify-center w-16 h-10 font-medium text-[#2958A4]">
                                {quantity}
                              </span>

                              <button
                                type="button"
                                onClick={() => setQuantity((prev) => prev + 1)}
                                className="flex items-center justify-center w-10 h-10 text-[#2958A4] ease-out duration-200 hover:text-[#1F4480]"
                              >
                                <span className="sr-only">Increase quantity</span>
                                <PlusIcon className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </>
                      )}

                      {/* Connectors with Variants: Cable Type Dropdown (like frontend project) */}
                      {product.productType === "connector" && !isConnectorProduct && !isStandaloneConnector && (product as any).variants && (product as any).variants.length > 0 && (
                        <>
                          {/* Cable Type Dropdown */}
                          <div className="flex flex-col gap-2 mb-4">
                            <label className="text-black text-[20px] font-medium leading-[30px]">
                              Cable Type:
                            </label>
                            <div className="relative w-fit">
                              <select
                                value={selectedLengthIndex >= 0 && (product as any).variants[selectedLengthIndex]?.id || ""}
                                onChange={(e) => {
                                  const variantIndex = (product as any).variants.findIndex((v: any) => v.id === e.target.value);
                                  if (variantIndex >= 0) {
                                    setSelectedLengthIndex(variantIndex);
                                  }
                                }}
                                className="w-fit min-w-[200px] rounded-lg border border-[#2958A4] bg-white text-[16px] font-medium text-gray-800 pl-4 pr-10 py-3 appearance-none transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#2958A4] focus:border-[#2958A4]"
                                style={{
                                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%232958A4' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                                  backgroundRepeat: 'no-repeat',
                                  backgroundPosition: 'right 12px center',
                                  paddingRight: '2.5rem'
                                }}
                              >
                                <option value="">Select Cable Type</option>
                                {(product as any).variants.map((variant: any) => (
                                  <option key={variant.id} value={variant.id}>
                                    {variant.title || variant.sku || "Cable Type"}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>

                          {/* Quantity */}
                          <div className="space-y-2">
                            <label className="text-black text-[20px] font-medium leading-[30px]">
                              Quantity
                            </label>
                            <div className="flex items-center divide-x divide-[#2958A4] border border-[#2958A4] rounded-full quantity-controls w-fit">
                              <button
                                type="button"
                                onClick={() => {
                                  if (quantity > 1) {
                                    setQuantity((prev) => prev - 1);
                                  }
                                }}
                                className="flex items-center justify-center w-10 h-10 text-[#2958A4] ease-out duration-200 hover:text-[#1F4480] disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={quantity <= 1}
                              >
                                <span className="sr-only">Decrease quantity</span>
                                <MinusIcon className="w-4 h-4" />
                              </button>
                              <span className="flex items-center justify-center w-16 h-10 font-medium text-[#2958A4]">
                                {quantity}
                              </span>
                              <button
                                type="button"
                                onClick={() => setQuantity((prev) => prev + 1)}
                                className="flex items-center justify-center w-10 h-10 text-[#2958A4] ease-out duration-200 hover:text-[#1F4480]"
                              >
                                <span className="sr-only">Increase quantity</span>
                                <PlusIcon className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </>
                      )}

                      {/* Standalone Connectors: Cable Series and Cable Type Dropdowns */}
                      {isStandaloneConnector && cableSeries && cableTypes && (
                        <>
                          {/* Cable Series Dropdown */}
                          <div className="flex flex-col space-y-2">
                            <label className="text-black text-[20px] font-medium leading-[30px]">
                              Cable Series *
                            </label>
                            <select
                              value={selectedCableSeriesSlug}
                              onChange={(e) => {
                                setSelectedCableSeriesSlug(e.target.value);
                                setSelectedCableTypeSlug(""); // Reset cable type when series changes
                              }}
                              className="w-fit min-w-[250px] py-3 pl-4 pr-10 border-2 border-[#2958A4] bg-white text-[#383838] text-[16px] focus:outline-none focus:ring-2 focus:ring-[#2958A4] rounded-lg appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%232958A4%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-no-repeat"
                              style={{ backgroundPosition: 'right 0.75rem center' }}
                            >
                              <option value="">Select Cable Series</option>
                              {cableSeries.map((series: any) => (
                                <option key={series._id} value={series.slug}>
                                  {series.name}
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Cable Type Dropdown */}
                          <div className="flex flex-col space-y-2">
                            <label className="text-black text-[20px] font-medium leading-[30px]">
                              Cable Type *
                            </label>
                            <select
                              value={selectedCableTypeSlug}
                              onChange={(e) => setSelectedCableTypeSlug(e.target.value)}
                              disabled={!selectedCableSeriesSlug}
                              className={`w-fit min-w-[250px] py-3 pl-4 pr-10 border-2 border-[#2958A4] bg-white text-[#383838] text-[16px] focus:outline-none focus:ring-2 focus:ring-[#2958A4] rounded-lg appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%232958A4%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-no-repeat ${
                                !selectedCableSeriesSlug ? "opacity-50 cursor-not-allowed" : ""
                              }`}
                              style={{ backgroundPosition: 'right 0.75rem center' }}
                            >
                              <option value="">
                                {selectedCableSeriesSlug ? "Select Cable Type" : "Select Cable Series first"}
                              </option>
                              {availableCableTypes.map((type: any) => (
                                <option key={type._id} value={type.slug}>
                                  {type.name}
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Price Display when both are selected */}
                          {selectedCableTypeSlug && standaloneConnectorPrice > 0 && (
                            <div className="space-y-2 pt-2 border-t border-gray-3">
                              <div className="flex justify-between items-center">
                                <span className="text-black text-[18px] font-medium">Connector Price:</span>
                                <span className="text-[#2958A4] text-[24px] font-bold">
                                  ${formatPrice(standaloneConnectorPrice * 100)}
                                </span>
                              </div>
                            </div>
                          )}

                          {/* Quantity */}
                          <div className="space-y-2">
                            <label className="text-black text-[20px] font-medium leading-[30px]">
                              Quantity
                            </label>
                            <div className="flex items-center divide-x divide-[#2958A4] border border-[#2958A4] rounded-full quantity-controls w-fit">
                              <button
                                type="button"
                                onClick={() => {
                                  if (quantity > 1) {
                                    setQuantity((prev) => prev - 1);
                                  }
                                }}
                                className="flex items-center justify-center w-10 h-10 text-[#2958A4] ease-out duration-200 hover:text-[#1F4480] disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={quantity <= 1}
                              >
                                <span className="sr-only">Decrease quantity</span>
                                <MinusIcon className="w-4 h-4" />
                              </button>
                              <span className="flex items-center justify-center w-16 h-10 font-medium text-[#2958A4]">
                                {quantity}
                              </span>
                              <button
                                type="button"
                                onClick={() => setQuantity((prev) => prev + 1)}
                                className="flex items-center justify-center w-10 h-10 text-[#2958A4] ease-out duration-200 hover:text-[#1F4480]"
                              >
                                <span className="sr-only">Increase quantity</span>
                                <PlusIcon className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </>
                      )}

                      {/* Length - Full Width Row (Cable products only) - Same style as Gains */}
                      {isCableProduct && lengthOptions.length > 0 && (
                        <div className="space-y-2">
                          <label className="text-black text-[20px] font-medium leading-[30px]">
                            Length
                          </label>

                          <div className="flex flex-wrap gap-2">
                            {lengthOptions.map((lengthOption: any, index: number) => {
                              if (lengthOption === null || lengthOption === undefined) return null;
                              const lengthValue = getLengthValue(lengthOption);
                              if (!lengthValue) return null;
                              const isSelected = selectedLengthIndex === index;
                              // Ensure "ft" is in the display value (like "10 ft")
                              const displayValue = lengthValue.includes('ft') ? lengthValue : `${lengthValue} ft`;
                              
                              return (
                                <button
                                  key={lengthOption.variantId || lengthOption.id || index}
                                  type="button"
                                  onClick={() => {
                                    setSelectedLengthIndex(index);
                                    setSelectedLength(lengthValue);
                                  }}
                                  className={`rounded border flex items-center justify-center text-center text-[16px] leading-[26px] font-medium transition-all duration-200 whitespace-nowrap px-4 py-2 w-20 ${
                                    isSelected
                                      ? "border-[#2958A4] bg-[#2958A4] text-white"
                                      : "border-[#2958A4] bg-white text-gray-800"
                                  }`}
                                >
                                  {displayValue}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Quantity - Full Width Row (Antenna products only) */}
                      {product.productType === "antenna" && !isConnectorProduct && !isStandaloneConnector && !isCableProduct && (
                        <div className="space-y-2">
                          <label className="text-black text-[20px] font-medium leading-[30px]">
                            Quantity
                          </label>
                          <div className="flex items-center divide-x divide-[#2958A4] border border-[#2958A4] rounded-full quantity-controls w-fit">
                            <button
                              type="button"
                              onClick={() => {
                                if (quantity > 1) {
                                  setQuantity((prev) => prev - 1);
                                }
                              }}
                              className="flex items-center justify-center w-10 h-10 text-[#2958A4] ease-out duration-200 hover:text-[#1F4480] disabled:opacity-50 disabled:cursor-not-allowed"
                              disabled={quantity <= 1}
                            >
                              <span className="sr-only">Decrease quantity</span>
                              <MinusIcon className="w-4 h-4" />
                            </button>

                            <span className="flex items-center justify-center w-16 h-10 font-medium text-[#2958A4]">
                              {quantity}
                            </span>

                            <button
                              type="button"
                              onClick={() => setQuantity((prev) => prev + 1)}
                              className="flex items-center justify-center w-10 h-10 text-[#2958A4] ease-out duration-200 hover:text-[#1F4480]"
                            >
                              <span className="sr-only">Increase quantity</span>
                              <PlusIcon className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Quantity - Under Length for Cable Products */}
                      {isCableProduct && (
                        <div className="space-y-2">
                          <label className="text-black text-[20px] font-medium leading-[30px]">
                            Quantity
                          </label>
                          <div className="flex items-center divide-x divide-[#2958A4] border border-[#2958A4] rounded-full quantity-controls w-fit">
                            <button
                              type="button"
                              onClick={() => {
                                if (quantity > 1) {
                                  setQuantity((prev) => prev - 1);
                                }
                              }}
                              className="flex items-center justify-center w-10 h-10 text-[#2958A4] ease-out duration-200 hover:text-[#1F4480] disabled:opacity-50 disabled:cursor-not-allowed"
                              disabled={quantity <= 1}
                            >
                              <span className="sr-only">Decrease quantity</span>
                              <MinusIcon className="w-4 h-4" />
                            </button>
                            <span className="flex items-center justify-center w-16 h-10 font-medium text-[#2958A4]">
                              {quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => setQuantity((prev) => prev + 1)}
                              className="flex items-center justify-center w-10 h-10 text-[#2958A4] ease-out duration-200 hover:text-[#1F4480]"
                            >
                              <span className="sr-only">Increase quantity</span>
                              <PlusIcon className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      )}

                  </div>

                  {/* Buttons */}
                  <div className="pt-2 space-y-3 mt-4">
                      <button
                        type="button"
                        onClick={handleAddToCart}
                        disabled={isProductInCart}
                        className={`w-full inline-flex items-center justify-center rounded-full border border-transparent bg-[#2958A4] text-white text-sm font-medium px-6 py-3 transition-colors hover:border-[#2958A4] hover:bg-white hover:text-[#2958A4] ${
                          isProductInCart
                            ? "opacity-70 cursor-not-allowed disabled:hover:border-transparent disabled:hover:bg-[#2958A4] disabled:hover:text-white"
                            : ""
                        }`}
                      >
                        {isProductInCart ? "Added to Cart" : "Add to Cart"}
                      </button>

                      <button
                        type="button"
                        onClick={() => router.push("/request-a-quote")}
                        className="w-full inline-flex items-center justify-center rounded-full border border-transparent bg-[#2958A4] text-white text-sm font-medium px-6 py-3 transition-colors hover:border-[#2958A4] hover:bg-white hover:text-[#2958A4]"
                      >
                        Request a Quote
                      </button>
                    </div>
                </div>

              </form>
            </div>
          </div>
        </div>
      </section>
      <div className="w-full">
        <div className="w-full">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-px mt-5">
            {productDetailsHeroData.map((item, index) => {
              return (
                <div
                  key={index}
                  className="flex flex-col items-center justify-center gap-4 bg-[#F6F7F7] py-6 px-4 sm:px-6 w-full text-center"
                >
                  <div className="flex items-center justify-center flex-shrink-0">
                    <Image
                      src={item.img}
                      alt="icon"
                      width={60}
                      height={60}
                      className=""
                    />
                  </div>

                  <h3 className="text-[#2958A4] text-[20px] font-medium leading-[30px]">
                    {item.title}
                  </h3>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      {/* Description Section - Hide for cable products */}
      {!isCableProduct && (
        <Description 
          product={product}
          metadata={{
            description: product.description,
            specifications: (product as any).specifications,
            datasheetImage: (product as any).datasheetImage || (product.metadata as any)?.datasheetImage,
            datasheetPdf: (product as any).datasheetPdf || (product.metadata as any)?.datasheetPdf,
            features: (product as any).features,
            applications: (product as any).applications,
          }}
        />
      )}
      <RequestAQuote variant="two-column" showProductOrService={false} />
      <FaqSection />
      <Newsletter />
    </>
  );
};

export default ShopDetails;
