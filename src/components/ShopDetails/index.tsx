"use client";

import { usePreviewSlider } from "@/app/context/PreviewSliderContext";
import {
  FullScreenIcon,
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

import { useState, useEffect, useMemo, useRef } from "react";
import useSWR from "swr";
import { useDispatch } from "react-redux";
import { useShoppingCart } from "use-shopping-cart";
import toast from "react-hot-toast";
import { useAutoOpenCart } from "../Providers/AutoOpenCartProvider";
import Newsletter from "../Common/Newsletter";
import Description from "./Description";
import WorkWithUs from "../Home/Hero/WorkWithUs";
import { useRouter } from "next/navigation";
import { useRequestQuoteModal } from "@/app/context/RequestQuoteModalContext";
import { formatPrice } from "@/utils/price";
import { ButtonArrowHomepage } from "../Common/ButtonArrowHomepage";
import { trackViewItem, trackAddToCart } from "@/lib/ga4";

type SelectedAttributesType = {
  [key: number]: string | undefined;
};
type ShopDetailsProps = {
  product: Product;
  cableSeries?: any[] | null;
  cableTypes?: any[] | null;
};

const ShopDetails = ({ product: initialProduct, cableSeries, cableTypes }: ShopDetailsProps) => {
  const { openPreviewModal } = usePreviewSlider();
  const [previewImg, setPreviewImg] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [mounted, setMounted] = useState(false);

  const { cartDetails, incrementItem, decrementItem } = useShoppingCart();
  const { addItemWithAutoOpen } = useAutoOpenCart();
  const wishlistItems = useAppSelector((state) => state.wishlistReducer.items);

  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { isOpen: isQuoteModalOpen, products: quoteModalProducts, openRequestQuoteModal } = useRequestQuoteModal();

  // ✅ Lazy-load WooCommerce variations on the client (prevents SSR 504s)
  const wcProductId = (initialProduct as any)?._wcProductId as number | undefined;
  const variationsLazy = Boolean((initialProduct as any)?._variationsLazy && wcProductId);

  const { data: variationsResp } = useSWR(
    variationsLazy ? `/api/product-variations?id=${wcProductId}&name=${encodeURIComponent(initialProduct.name || "Product")}` : null,
    async (url: string) => {
      const res = await fetch(url);
      return res.json();
    },
    {
      dedupingInterval: 5000,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      refreshInterval: 0,
    }
  );

  const product = useMemo(() => {
    const variants = variationsResp?.variants;
    if (Array.isArray(variants) && variants.length > 0) {
      return {
        ...(initialProduct as any),
        variants,
        _variationsLazy: false,
      } as Product;
    }
    return initialProduct;
  }, [initialProduct, variationsResp?.variants]);

  const prevQuoteModalOpenRef = useRef(false);
  useEffect(() => {
    const wasOpen = prevQuoteModalOpenRef.current;
    prevQuoteModalOpenRef.current = isQuoteModalOpen;
    if (wasOpen && !isQuoteModalOpen && quoteModalProducts.length === 1) {
      const p = quoteModalProducts[0];
      const productId = (product as any)?._id ?? (product as any)?.id;
      if (productId != null && String(p.id) === String(productId)) {
        setQuantity(p.quantity);
      }
    }
  }, [isQuoteModalOpen, quoteModalProducts, product]);

  // Console log product details from API for debugging
  useEffect(() => {
    console.log("========================================");
    console.log("[ShopDetails] Product Details from API:");
    console.log("Product:", JSON.stringify(product, null, 2));
    console.log("Product Variants:", JSON.stringify((product as any).variants, null, 2));
    console.log("Product Short Description:", product.shortDescription);
    console.log("Product Subtitle:", (product as any).subtitle);
    console.log("========================================");
  }, [product]);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  // GA4: Track product view
  useEffect(() => {
    if (!product) return;
    
    const category = product.categories?.[0]?.name || product.category?.name || undefined;
    
    trackViewItem({
      id: product._id,
      name: product.name,
      price: product.discountedPrice || product.price || 0,
      category,
    });
  }, [product._id, product.name]);

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
      let url: string | null = null;
      
      // If img is already a string URL (from WordPress), validate it
      if (typeof img === 'string') {
        if (img.startsWith('http://') || img.startsWith('https://')) {
          // Validate it's a proper URL before returning
          try {
            new URL(img); // This will throw if invalid
            url = img;
          } catch {
            // Invalid URL, skip it
            return null;
          }
        } else {
          // Relative URL or invalid format, skip it
          return null;
        }
      } else {
      // Otherwise, try to use imageBuilder for image objects
        const builtUrl = imageBuilder(img).url();
        if (builtUrl && typeof builtUrl === 'string' && builtUrl.length > 0) {
          // Validate the built URL
          if (builtUrl.startsWith('http://') || builtUrl.startsWith('https://')) {
            try {
              new URL(builtUrl); // This will throw if invalid
              url = builtUrl;
            } catch {
              // Invalid URL, skip it
              return null;
            }
          } else {
            // Relative URL, skip it
            return null;
          }
        }
      }
      
      return url;
    } catch (error) {
      // If anything fails, return null to prevent invalid URLs
      console.warn('[ShopDetails] Failed to get image URL:', error, img);
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
  
  // Debug: Log product type for troubleshooting
  useEffect(() => {
    if (product.productType) {
      console.log(`[ShopDetails] Product type: ${product.productType}, isCableProduct: ${isCableProduct}`);
    }
  }, [product.productType, isCableProduct]);
  
  // For connector products (products with productType="connector")
  const productCableSeries = product.cableSeries?.name || "";
  // Support both direct cableType (from product) and nested cableType (from cableTypeData query)
  const cableType = product.cableType || (product as any).cableType?.cableType || null;
  const cableTypeName = cableType?.name || "";
  const cableTypePricePerFoot = cableType?.pricePerFoot ?? 0;
  // For cable products, lengthOptions come from variant data
  // Length options have structure: { value, price, sku, variantId }
  const rawLengthOptions = product.lengthOptions;
  const lengthOptions = Array.isArray(rawLengthOptions) && rawLengthOptions.length > 0
    ? rawLengthOptions.filter((opt: any) => {
        if (!opt) return false;
        // For cable products, check for 'value' field (e.g., "10", "25", "50")
        if (typeof opt === 'object' && opt !== null) {
          // Check if it has a value field (structure) - this is the key field
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
  
  // Check if the exact same variant is in cart (not just the product)
  // Create a unique ID based on product and variant selection
  const currentCartItemId = useMemo(() => {
    if (isCableProduct && selectedLengthIndex >= 0 && (product as any).variants?.[selectedLengthIndex]) {
      return `${product._id}-${(product as any).variants[selectedLengthIndex].id}`;
    }
    if (product.productType === "antenna" && selectedLengthIndex >= 0 && (product as any).variants?.[selectedLengthIndex]) {
      return `${product._id}-${(product as any).variants[selectedLengthIndex].id}`;
    }
    if (isSimpleConnector && selectedLengthIndex >= 0 && (product as any).variants?.[selectedLengthIndex]) {
      return `${product._id}-${(product as any).variants[selectedLengthIndex].id}`;
    }
    if (isConnectorProduct && selectedLength) {
      return `${product._id}-${selectedLength}`;
    }
    if (isStandaloneConnector && selectedCableSeriesSlug && selectedCableTypeSlug) {
      return `${product._id}-${selectedCableSeriesSlug}-${selectedCableTypeSlug}`;
    }
    return product._id;
  }, [product._id, selectedLengthIndex, selectedLength, selectedCableSeriesSlug, selectedCableTypeSlug, isCableProduct, isSimpleConnector, isConnectorProduct, isStandaloneConnector, product]);

  // Update isProductInCart to check for exact variant match
  const isProductInCart = useMemo(
    () => Object.values(cartDetails ?? {}).some((cartItem) => cartItem.id === currentCartItemId),
    [cartDetails, currentCartItemId]
  );
  
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
  // For cable products, lengthOptions have: { value, price, sku, variantId }
  const getLengthValue = (option: any): string => {
    if (!option) return "";
    if (typeof option === 'string') {
      return option;
    }
    if (typeof option === 'object' && option !== null) {
      // For cable products, use 'value' field (e.g., "10", "25", "50")
      // Also check 'title' for compatibility with other formats
      return option.value || option.title || option.length || "";
    }
    return "";
  };

  const getLengthPrice = (option: any): number => {
    if (!option) return 0;
    
    // For cable products, get price from the variant's calculated_price
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

  // Helper function to get variant price
  const getVariantPrice = (variant: any): number => {
    if (variant?.calculated_price?.calculated_amount) {
      return variant.calculated_price.calculated_amount / 100;
    }
    if (variant?.price) {
      return parseFloat(variant.price) || 0;
    }
    return 0;
  };

  // Don't auto-select - keep dropdown showing "Select Gain" or "Select Length" by default
  // The price will still show the lowest price via dynamicPrice calculation

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
    // New format: object with price
    // If price is in cents, convert to dollars
    // For WooCommerce: price might be in dollars already (check if > 1000, assume cents if so)
    if (option && typeof option === 'object' && option !== null && 'price' in option && typeof option.price === 'number') {
      const optionPrice = option.price;
      // If price is >= 1000, assume it's in cents format
      // If price is < 1000, assume it's already in dollars (WooCommerce format)
      return optionPrice >= 1000 ? optionPrice / 100 : optionPrice;
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

  const displaySku = useMemo(() => {
    const variants = ((product as any).variants ?? []) as any[];
    const selectedVariant = selectedLengthIndex >= 0 ? variants[selectedLengthIndex] : variants[0];

    if (isConnectorProduct && variants.length > 0) {
      return selectedVariant?.sku || (product as any).sku;
    }

    if (isStandaloneConnector) {
      return (product as any).sku || variants[0]?.sku;
    }

    if (product.productType === "connector" && variants.length > 0) {
      return selectedVariant?.sku || (product as any).sku;
    }

    if (isCableProduct && lengthOptions.length > 0) {
      const selectedLengthOption = selectedLengthIndex >= 0 ? lengthOptions[selectedLengthIndex] : lengthOptions[0];
      return (selectedLengthOption as any)?.sku || (product as any).sku || selectedVariant?.sku;
    }

    if (product.productType === "antenna") {
      if (variants.length > 0) {
        return selectedVariant?.sku || (product as any).sku;
      }
      if (currentGainOption) {
        return (currentGainOption as any)?.sku ||
          (product as any).sku ||
          variants[0]?.sku ||
          (product.gainOptions && (product.gainOptions[0] as any)?.sku);
      }
    }

    return (product as any).sku || variants[0]?.sku;
  }, [
    product,
    isCableProduct,
    isConnectorProduct,
    isStandaloneConnector,
    lengthOptions,
    selectedLengthIndex,
    currentGainOption,
  ]);

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
        // Try calculated_price first, then price field (WooCommerce format)
        if (selectedVariant?.calculated_price?.calculated_amount) {
          return selectedVariant.calculated_price.calculated_amount / 100; // Convert cents to dollars
        }
        // WooCommerce variations have price directly in dollars
        if (selectedVariant?.price) {
          return selectedVariant.price;
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
    
    // For cable products with variants (WooCommerce): use price from selected variant
    if (isCableProduct && (product as any).variants && (product as any).variants.length > 0) {
      if (selectedLengthIndex >= 0 && (product as any).variants[selectedLengthIndex]) {
        const selectedVariant = (product as any).variants[selectedLengthIndex];
        // Try calculated_price first, then price field (WooCommerce format)
        if (selectedVariant?.calculated_price?.calculated_amount) {
          return selectedVariant.calculated_price.calculated_amount / 100; // Convert cents to dollars
        }
        // WooCommerce variations have price directly in dollars
        if (selectedVariant?.price) {
          return selectedVariant.price;
        }
      }
      // Fallback to lowest price variant if no selection (for display purposes)
      const sortedVariants = [...(product as any).variants].sort((a: any, b: any) => {
        return getVariantPrice(a) - getVariantPrice(b);
      });
      if (sortedVariants.length > 0) {
        const lowestPriceVariant = sortedVariants[0];
        return getVariantPrice(lowestPriceVariant);
      }
    }
    
    // For cable products: calculate price from pricePerFoot × selected length
    if (isCableProduct && lengthOptions.length > 0) {
      if (selectedLengthIndex >= 0 && selectedLengthIndex < lengthOptions.length && selectedLength) {
        // Calculate price from selected length
        return getLengthPrice(lengthOptions[selectedLengthIndex]);
      }
      // Fallback to lowest price length option if no selection (for display purposes)
      const sortedLengthOptions = [...lengthOptions].sort((a: any, b: any) => {
        return getLengthPrice(a) - getLengthPrice(b);
      });
      if (sortedLengthOptions.length > 0) {
        return getLengthPrice(sortedLengthOptions[0]);
      }
    }
    // Fallback to pricePerFoot if no lengthOptions
    if (isCableProduct && cableTypePricePerFoot > 0) {
      return cableTypePricePerFoot;
    }
    
    // For antenna products with variants (WooCommerce): use price from selected variant
    if (product.productType === "antenna" && (product as any).variants && (product as any).variants.length > 0) {
      // Use selectedLengthIndex to track selected variant (for antenna products, this represents the selected gain/variant)
      if (selectedLengthIndex >= 0 && (product as any).variants[selectedLengthIndex]) {
        const selectedVariant = (product as any).variants[selectedLengthIndex];
        // Try calculated_price first, then price field (WooCommerce format)
        if (selectedVariant?.calculated_price?.calculated_amount) {
          return selectedVariant.calculated_price.calculated_amount / 100; // Convert cents to dollars
        }
        // WooCommerce variations have price directly in dollars
        if (selectedVariant?.price) {
          return selectedVariant.price;
        }
      }
      // Fallback to lowest price variant if no selection (for display purposes)
      const sortedVariants = [...(product as any).variants].sort((a: any, b: any) => {
        return getVariantPrice(a) - getVariantPrice(b);
      });
      if (sortedVariants.length > 0) {
        const lowestPriceVariant = sortedVariants[0];
        return getVariantPrice(lowestPriceVariant);
      }
    }
    
    // For antenna products, use gain options (legacy format)
    if (gainIndex < 0 || !currentGainOption) {
      // Fallback to first gain option's price, or product price if no gain options
      const firstGain = product.gainOptions?.[0];
      if (firstGain) {
        return getGainPrice(firstGain, 0);
      }
      // If no gain options, use product price (for WooCommerce products without variants)
      return product.price ?? 0;
    }
    return getGainPrice(currentGainOption, gainIndex);
  }, [currentGainOption, gainIndex, product.gainOptions, isConnectorProduct, isStandaloneConnector, isSimpleConnector, isCableProduct, selectedLength, selectedLengthIndex, lengthOptions, cableTypePricePerFoot, connectorPrice, product.price, selectedCableTypeSlug, standaloneConnectorPrice, (product as any).variants]);

  // Calculate total price for display (unit price × quantity) - REMOVED: Price should not scale with quantity
  // Price display will show dynamicPrice (unit price) only

  const cartItem = useMemo(() => ({
    id: currentCartItemId, // Use unique ID that includes variant
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
  }), [currentCartItemId, product.name, dynamicPrice, cartImageUrl, product?.price_id, product?.slug?.current, currentGain, isConnectorProduct, productCableSeries, cableType, product.cableType?._id, selectedLength, isCableProduct, isStandaloneConnector, selectedCableSeriesSlug, selectedCableTypeSlug, selectedCableType?._id, product.productType, selectedLengthIndex, isSimpleConnector, product]);

  // Console log when variant selection changes
  useEffect(() => {
    if (selectedLengthIndex >= 0 && (product as any).variants && (product as any).variants[selectedLengthIndex]) {
      const selectedVariant = (product as any).variants[selectedLengthIndex];
      console.log("[ShopDetails] Selected Variant Changed:");
      console.log("Selected Variant Index:", selectedLengthIndex);
      console.log("Selected Variant:", JSON.stringify(selectedVariant, null, 2));
      console.log("Variant Price:", selectedVariant.price);
      console.log("Variant Calculated Price:", selectedVariant.calculated_price?.calculated_amount);
      console.log("Dynamic Price (Unit Price):", dynamicPrice);
    }
  }, [selectedLengthIndex, product, dynamicPrice]);

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

    // GA4: Track add to cart
    const category = product.categories?.[0]?.name || product.category?.name || undefined;
    trackAddToCart({
      id: product._id,
      name: product.name,
      price: dynamicPrice || product.discountedPrice || product.price || 0,
      category,
      quantity: itemQuantity,
    });

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

    // Check if item is already in cart with same variant
    if (isProductInCart) {
      // Update quantity using incrementItem/decrementItem
      const existingCartItem = Object.values(cartDetails ?? {}).find((item) => item.id === currentCartItemId);
      if (existingCartItem) {
        const currentQuantity = existingCartItem.quantity || 1;
        const quantityDifference = quantity - currentQuantity;
        
        if (quantityDifference > 0) {
          // Increase quantity
          for (let i = 0; i < quantityDifference; i++) {
            incrementItem(currentCartItemId);
          }
          toast.success(`Quantity updated to ${quantity}`);
        } else if (quantityDifference < 0) {
          // Decrease quantity
          for (let i = 0; i < Math.abs(quantityDifference); i++) {
            if (currentQuantity - i > 1) {
              decrementItem(currentCartItemId);
            }
          }
          toast.success(`Quantity updated to ${quantity}`);
        } else {
          toast.success("Quantity unchanged");
        }
      }
    } else {
      // Add new item to cart
      const itemQuantity = quantity;
      // @ts-ignore
      addItemWithAutoOpen(cartItem, itemQuantity);
      
      // GA4: Track add to cart
      const category = product.categories?.[0]?.name || product.category?.name || undefined;
      trackAddToCart({
        id: product._id,
        name: product.name,
        price: dynamicPrice || product.discountedPrice || product.price || 0,
        category,
        quantity: itemQuantity,
      });
      
      toast.success("Product added to cart!");
    }
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
      <section className="relative pt-[100px] pb-10 overflow-hidden lg:pt-[120px] xl:pt-[120px]">
        <div className="w-full px-4 sm:px-6 lg:px-[50px] xl:px-0 mx-auto max-w-[1340px]">
          <div className="flex flex-col lg:flex-row gap-8 xl:gap-20 items-start">
            {/* LEFT: GALLERY - 500x500 per design */}
            <div className="w-full lg:w-[500px] lg:flex-shrink-0">
              <div className="relative w-full aspect-square max-w-[500px] rounded-lg border border-gray-3 flex items-center justify-center overflow-hidden bg-gray-1">
                <button
                  onClick={handlePreviewSlider}
                  aria-label="button for zoom"
                  className="gallery__Image w-11 h-11 rounded-full bg-gray-1 shadow-1 flex items-center justify-center ease-out duration-200 text-dark hover:text-[#2958A4] absolute top-4 lg:top-6 right-4 lg:right-6 z-50"
                >
                  <FullScreenIcon className="w-6 h-6" />
                </button>

                {mainImageUrl && (
                  <div className="relative w-full aspect-square">
                    <Image
                      src={mainImageUrl}
                      alt={product.name}
                      fill
                      className="object-contain"
                      sizes="(max-width: 1024px) 100vw, 500px"
                    />
                  </div>
                )}
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

            {/* RIGHT: PRODUCT CONTENT - 750px max per design, gap 20px */}
            <div className="w-full lg:max-w-[750px] flex flex-col gap-5">
              {/* Section for SKU, Title, Price with background */}
              <div
                style={{
                  display: 'flex',
                  padding: '15px',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  gap: '15px',
                  alignSelf: 'stretch',
                  borderRadius: '10px',
                  backgroundColor: '#F1F6FF'
                }}
              >
                {/* SKU Display - Use SKU from selected variant or product */}
                {displaySku ? (
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
                    {displaySku}
                  </span>
                ) : null}

                {/* Product Title - 48px / 58px per design */}
                <h2
                  style={{
                    color: '#000',
                    fontFamily: 'Satoshi, sans-serif',
                    fontSize: 'clamp(28px, 4vw, 48px)',
                    fontStyle: 'normal',
                    fontWeight: 400,
                    lineHeight: 'clamp(34px, 5vw, 58px)',
                    letterSpacing: '-1.92px',
                    margin: 0
                  }}
                >
                  {product.name}
                </h2>

                {/* Price - 36px per design */}
                <h3
                  style={{
                    color: '#000',
                    fontFamily: 'Satoshi, sans-serif',
                    fontSize: 'clamp(24px, 3vw, 36px)',
                    fontStyle: 'normal',
                    fontWeight: 400,
                    lineHeight: '36px',
                    letterSpacing: '-1.08px',
                    textTransform: 'uppercase',
                    margin: 0
                  }}
                >
                  ${formatPrice(dynamicPrice)}
                </h3>
              </div>

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

              {/* Short Description - Under price (from WordPress admin) */}
              {product.shortDescription && (
                <p
                  style={{
                    color: '#000',
                    fontFamily: 'Satoshi, sans-serif',
                    fontSize: '24px',
                    fontStyle: 'normal',
                    fontWeight: 400,
                    lineHeight: '26px',
                    margin: 0,
                    marginBottom: '16px'
                  }}
                >
                  {product.shortDescription}
                </p>
              )}

              {/* Features - Under price (from WordPress admin) */}
              {!isCableProduct && (product as any).features && (() => {
                const features = (product as any).features;
                
                // Check if features is an array
                if (Array.isArray(features) && features.length > 0) {
                  return (
                    <div className="mb-4">
                      <ul className="space-y-2">
                        {features.map((feature: string, index: number) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="text-black text-[16px] leading-[24px]">•</span>
                            <span
                              style={{
                                color: '#000',
                                fontFamily: 'Satoshi, sans-serif',
                                fontSize: '16px',
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
                
                // Check if features is a string with HTML list
                if (typeof features === 'string' && features.trim()) {
                  const hasHTMLList = /<ul|<li/i.test(features);
                  if (hasHTMLList) {
                    // Parse HTML and extract list items
                    if (typeof window !== 'undefined') {
                      const parser = new DOMParser();
                      const doc = parser.parseFromString(features, 'text/html');
                      const listItems = doc.querySelectorAll('li');
                      
                      if (listItems.length > 0) {
                        return (
                          <div className="mb-4">
                            <ul className="space-y-2">
                              {Array.from(listItems).map((li, index) => {
                                const text = li.textContent || li.innerText || '';
                                return (
                                  <li key={index} className="flex items-start gap-2">
                                    <span className="text-black text-[16px] leading-[24px]">•</span>
                                    <span
                                      style={{
                                        color: '#000',
                                        fontFamily: 'Satoshi, sans-serif',
                                        fontSize: '16px',
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
                      }
                    }
                  }
                  // Plain text - render as is
                  return (
                    <div className="mb-4">
                      <p
                        style={{
                          color: '#000',
                          fontFamily: 'Satoshi, sans-serif',
                          fontSize: '16px',
                          fontStyle: 'normal',
                          fontWeight: 400,
                          lineHeight: '26px'
                        }}
                        className="whitespace-pre-line"
                      >
                        {features}
                      </p>
                    </div>
                  );
                }
                
                return null;
              })()}

              <form onSubmit={(e) => e.preventDefault()}>
                <div className="flex flex-col mt-3 py-2">

                  <div className="mt-2 w-full space-y-4">
                      {/* Length/Variants - Full Width Row (Cable products with variants) */}
                      {/* For WooCommerce cable products with variations, show length options */}
                      {/* Check if product is cable OR if variants contain "Length:" in title */}
                      {(() => {
                        const hasVariants = (product as any).variants && (product as any).variants.length > 0;
                        const hasLengthVariants = hasVariants && (product as any).variants.some((v: any) => v.title && /Length:/i.test(v.title));
                        return (isCableProduct || hasLengthVariants) && hasVariants;
                      })() && (
                        <div className="space-y-2">
                          <label className="text-black text-[20px] font-medium leading-[30px]">
                            Length
                          </label>

                          <div className="relative w-full">
                            <select
                              value={selectedLengthIndex >= 0 ? (product as any).variants[selectedLengthIndex]?.id || "" : ""}
                              onChange={(e) => {
                                const variantIndex = (product as any).variants.findIndex((v: any) => v.id === e.target.value);
                                if (variantIndex >= 0) {
                                  setSelectedLengthIndex(variantIndex);
                                  // Extract length value from variant title
                                  const variant = (product as any).variants[variantIndex];
                                  const variantTitle = variant?.title || "";
                                  let cleanedTitle = variantTitle.replace(/Length:\s*/gi, "").trim();
                                  cleanedTitle = cleanedTitle.replace(/\s*dBi/gi, "").trim();
                                  const lengthMatch = cleanedTitle.match(/(\d+(?:\.\d+)?)\s*ft/i);
                                  let lengthValue;
                                  if (lengthMatch) {
                                    lengthValue = `${lengthMatch[1]} ft`;
                                  } else {
                                    let fallback = cleanedTitle.replace(/Length:\s*/gi, "").replace(/\s*dBi/gi, "").trim();
                                    lengthValue = fallback.includes('ft') ? fallback : `${fallback} ft`;
                                  }
                                  setSelectedLength(lengthValue);
                                }
                              }}
                              className="w-full appearance-none transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#2958A4] focus:border-[#2958A4]"
                              style={{
                                display: 'flex',
                                height: '50px',
                                padding: '0 16px',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                alignSelf: 'stretch',
                                borderRadius: '10px',
                                background: '#F6F7F7',
                                border: 'none',
                                fontFamily: 'Satoshi, sans-serif',
                                fontSize: '16px',
                                fontWeight: 400,
                                color: '#000',
                                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='20' viewBox='0 0 14 20' fill='none'%3E%3Cpath d='M7 0.88477L6.68555 1.18555L1.2168 6.6543L1.8457 7.2832L7 2.12891L12.1543 7.2832L12.7832 6.6543L7.31445 1.18555L7 0.88477Z' fill='%23383838'/%3E%3Cpath d='M7 19.1152L6.68555 18.8144L1.2168 13.3457L1.8457 12.7168L7 17.87109L12.1543 12.7168L12.7832 13.3457L7.31445 18.8144L7 19.1152Z' fill='%23383838'/%3E%3C/svg%3E")`,
                                backgroundRepeat: 'no-repeat',
                                backgroundPosition: 'right 16px center',
                                paddingRight: '2.5rem'
                              }}
                            >
                              <option value="">Select Length</option>
                              {(() => {
                                // Sort variants by length value (smallest to largest)
                                const sortedVariants = [...(product as any).variants].sort((a: any, b: any) => {
                                  const getLengthNumber = (variant: any): number => {
                                    const title = variant.title || "";
                                    const cleaned = title.replace(/Length:\s*/gi, "").replace(/\s*dBi/gi, "").trim();
                                    const match = cleaned.match(/(\d+(?:\.\d+)?)\s*ft/i);
                                    return match ? parseFloat(match[1]) : 0;
                                  };
                                  return getLengthNumber(a) - getLengthNumber(b);
                                });
                                
                                return sortedVariants.map((variant: any) => {
                                  if (!variant) return null;
                                  // Extract length value from variant title
                                  const variantTitle = variant.title || "";
                                  let cleanedTitle = variantTitle.replace(/Length:\s*/gi, "").trim();
                                  cleanedTitle = cleanedTitle.replace(/\s*dBi/gi, "").trim();
                                  const lengthMatch = cleanedTitle.match(/(\d+(?:\.\d+)?)\s*ft/i);
                                  let lengthValue;
                                  if (lengthMatch) {
                                    lengthValue = `${lengthMatch[1]} ft`;
                                  } else {
                                    let fallback = cleanedTitle.replace(/Length:\s*/gi, "").replace(/\s*dBi/gi, "").trim();
                                    lengthValue = fallback.includes('ft') ? fallback : `${fallback} ft`;
                                  }
                                  return (
                                    <option key={variant.id} value={variant.id}>
                                      {lengthValue}
                                    </option>
                                  );
                                });
                              })()}
                            </select>
                          </div>
                        </div>
                      )}

                      {/* Gain/Variants - Dropdown (Antenna products only) */}
                      {/* For WooCommerce products with variations, show variants instead of gainOptions */}
                      {/* Only show Gain if NOT a cable product and variants don't contain "Length:" */}
                      {!isConnectorProduct && 
                       !isCableProduct && 
                       product.productType === "antenna" && 
                       (product as any).variants && 
                       (product as any).variants.length > 0 &&
                       !(product as any).variants.some((v: any) => v.title && /Length:/i.test(v.title)) && (
                        <div className="space-y-2">
                          <label className="text-black text-[20px] leading-[30px] font-medium">
                            Gain
                          </label>

                          <div className="relative w-full">
                            <select
                              value={selectedLengthIndex >= 0 ? (product as any).variants[selectedLengthIndex]?.id || "" : ""}
                              onChange={(e) => {
                                const variantIndex = (product as any).variants.findIndex((v: any) => v.id === e.target.value);
                                if (variantIndex >= 0) {
                                  setSelectedLengthIndex(variantIndex);
                                }
                              }}
                              className="w-full appearance-none transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#2958A4] focus:border-[#2958A4]"
                              style={{
                                display: 'flex',
                                height: '50px',
                                padding: '0 16px',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                alignSelf: 'stretch',
                                borderRadius: '10px',
                                background: '#F6F7F7',
                                border: 'none',
                                fontFamily: 'Satoshi, sans-serif',
                                fontSize: '16px',
                                fontWeight: 400,
                                color: '#000',
                                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='20' viewBox='0 0 14 20' fill='none'%3E%3Cpath d='M7 0.88477L6.68555 1.18555L1.2168 6.6543L1.8457 7.2832L7 2.12891L12.1543 7.2832L12.7832 6.6543L7.31445 1.18555L7 0.88477Z' fill='%23383838'/%3E%3Cpath d='M7 19.1152L6.68555 18.8144L1.2168 13.3457L1.8457 12.7168L7 17.87109L12.1543 12.7168L12.7832 13.3457L7.31445 18.8144L7 19.1152Z' fill='%23383838'/%3E%3C/svg%3E")`,
                                backgroundRepeat: 'no-repeat',
                                backgroundPosition: 'right 16px center',
                                paddingRight: '2.5rem'
                              }}
                            >
                              <option value="">Select Gain</option>
                              {(product as any).variants.map((variant: any, index: number) => {
                                if (!variant) return null;
                                const variantTitle = variant.title || "";
                                const gainMatch = variantTitle.match(/(\d+(?:\.\d+)?)\s*dBi/i);
                                const gainValue = gainMatch ? gainMatch[1] : variantTitle.replace("Gain: ", "");
                                return (
                                  <option key={variant.id || index} value={variant.id || index}>
                                    {gainValue} dBi
                                  </option>
                                );
                              })}
                            </select>
                          </div>
                        </div>
                      )}
                      {/* Legacy gainOptions display - Convert to dropdown */}
                      {!isConnectorProduct && !isCableProduct && product.gainOptions && product.gainOptions.length > 0 && !((product as any).variants && (product as any).variants.length > 0) && (
                        <div className="space-y-2">
                          <label className="text-black text-[20px] leading-[30px]">
                            Gain
                          </label>

                          <div className="relative w-full">
                            <select
                              value={gainIndex >= 0 ? (product.gainOptions[gainIndex] as any)?.id || gainIndex : ""}
                              onChange={(e) => {
                                const selectedIndex = product.gainOptions.findIndex((opt: any) => 
                                  (opt?.id && opt.id === e.target.value) || 
                                  opt === product.gainOptions[parseInt(e.target.value)]
                                );
                                if (selectedIndex >= 0) {
                                  setGainIndex(selectedIndex);
                                } else {
                                  setGainIndex(parseInt(e.target.value));
                                }
                              }}
                              className="w-full appearance-none transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#2958A4] focus:border-[#2958A4]"
                              style={{
                                display: 'flex',
                                height: '50px',
                                padding: '0 16px',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                alignSelf: 'stretch',
                                borderRadius: '10px',
                                background: '#F6F7F7',
                                border: 'none',
                                fontFamily: 'Satoshi, sans-serif',
                                fontSize: '16px',
                                fontWeight: 400,
                                color: '#000',
                                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='20' viewBox='0 0 14 20' fill='none'%3E%3Cpath d='M7 0.88477L6.68555 1.18555L1.2168 6.6543L1.8457 7.2832L7 2.12891L12.1543 7.2832L12.7832 6.6543L7.31445 1.18555L7 0.88477Z' fill='%23383838'/%3E%3Cpath d='M7 19.1152L6.68555 18.8144L1.2168 13.3457L1.8457 12.7168L7 17.87109L12.1543 12.7168L12.7832 13.3457L7.31445 18.8144L7 19.1152Z' fill='%23383838'/%3E%3C/svg%3E")`,
                                backgroundRepeat: 'no-repeat',
                                backgroundPosition: 'right 16px center',
                                paddingRight: '2.5rem'
                              }}
                            >
                              <option value="">Select Gain</option>
                              {product.gainOptions.map((gainOption: any, index: number) => {
                                if (gainOption === null || gainOption === undefined) return null;
                                const gainTitle = gainOption.title || gainOption.value || "";
                                if (!gainTitle) return null;
                                return (
                                  <option key={gainOption.id || index} value={gainOption.id || index}>
                                    {gainTitle} dBi
                                  </option>
                                );
                              })}
                            </select>
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
                                Length
                              </label>
                              <div className="flex flex-wrap gap-2">
                                {lengthOptions.map((lengthOption, index) => {
                                  if (lengthOption === null || lengthOption === undefined) return null;
                                  const lengthValue = getLengthValue(lengthOption);
                                  if (!lengthValue) return null;
                                  const isSelected = selectedLengthIndex === index;
                                  // Remove "Length:" prefix if present, and remove "dBi"
                                  let cleanValue = lengthValue.replace(/^Length:\s*/i, "").trim();
                                  cleanValue = cleanValue.replace(/\s*dBi/gi, "").trim();
                                  // Ensure "ft" is in the display value (no dBi for cables)
                                  let displayValue = cleanValue.includes('ft') ? cleanValue : `${cleanValue} ft`;
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

                            <div 
                              className="quantity-controls w-full"
                              style={{
                                display: 'flex',
                                height: '50px',
                                padding: '0 10px',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                alignSelf: 'stretch',
                                borderRadius: '10px',
                                background: '#F6F7F7',
                                border: 'none'
                              }}
                            >
                              <button
                                type="button"
                                onClick={() => {
                                  if (quantity > 1) {
                                    setQuantity((prev) => prev - 1);
                                  }
                                }}
                                className="flex items-center justify-center ease-out duration-200 hover:opacity-70 disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={quantity <= 1}
                                style={{ background: 'none', border: 'none', padding: 0, cursor: quantity <= 1 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}
                              >
                                <span className="sr-only">Decrease quantity</span>
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#383838" strokeWidth="1" style={{ transform: 'scaleX(-1)', transformOrigin: 'center', margin: 0, padding: 0, lineHeight: 0 }}>
                                  <path d="M4.7168 12.1543L5.3457 12.7832L10.8145 7.31445L11.1152 7L10.8145 6.68555L5.3457 1.2168L4.7168 1.8457L9.87109 7L4.7168 12.1543Z" fill="#383838"/>
                                </svg>
                              </button>

                              <span className="flex items-center justify-center font-medium text-[#383838]" style={{ fontFamily: 'Satoshi, sans-serif' }}>
                                {quantity}
                              </span>

                              <button
                                type="button"
                                onClick={() => setQuantity((prev) => prev + 1)}
                                className="flex items-center justify-center ease-out duration-200 hover:opacity-70"
                                style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}
                              >
                                <span className="sr-only">Increase quantity</span>
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#383838" strokeWidth="1">
                                  <path d="M4.7168 12.1543L5.3457 12.7832L10.8145 7.31445L11.1152 7L10.8145 6.68555L5.3457 1.2168L4.7168 1.8457L9.87109 7L4.7168 12.1543Z" fill="#383838"/>
                                </svg>
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
                            <div 
                              className="quantity-controls w-full"
                              style={{
                                display: 'flex',
                                height: '50px',
                                padding: '0 10px',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                alignSelf: 'stretch',
                                borderRadius: '10px',
                                background: '#F6F7F7',
                                border: 'none'
                              }}
                            >
                              <button
                                type="button"
                                onClick={() => {
                                  if (quantity > 1) {
                                    setQuantity((prev) => prev - 1);
                                  }
                                }}
                                className="flex items-center justify-center ease-out duration-200 hover:opacity-70 disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={quantity <= 1}
                                style={{ background: 'none', border: 'none', padding: 0, cursor: quantity <= 1 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}
                              >
                                <span className="sr-only">Decrease quantity</span>
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#383838" strokeWidth="1" style={{ transform: 'scaleX(-1)', transformOrigin: 'center', margin: 0, padding: 0, lineHeight: 0 }}>
                                  <path d="M4.7168 12.1543L5.3457 12.7832L10.8145 7.31445L11.1152 7L10.8145 6.68555L5.3457 1.2168L4.7168 1.8457L9.87109 7L4.7168 12.1543Z" fill="#383838"/>
                                </svg>
                              </button>

                              <span className="flex items-center justify-center font-medium text-[#383838]" style={{ fontFamily: 'Satoshi, sans-serif' }}>
                                {quantity}
                              </span>

                              <button
                                type="button"
                                onClick={() => setQuantity((prev) => prev + 1)}
                                className="flex items-center justify-center ease-out duration-200 hover:opacity-70"
                                style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}
                              >
                                <span className="sr-only">Increase quantity</span>
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#383838" strokeWidth="1">
                                  <path d="M4.7168 12.1543L5.3457 12.7832L10.8145 7.31445L11.1152 7L10.8145 6.68555L5.3457 1.2168L4.7168 1.8457L9.87109 7L4.7168 12.1543Z" fill="#383838"/>
                                </svg>
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
                                  ${formatPrice(standaloneConnectorPrice)}
                                </span>
                              </div>
                            </div>
                          )}

                          {/* Quantity */}
                          <div className="space-y-2">
                            <label className="text-black text-[20px] font-medium leading-[30px]">
                              Quantity
                            </label>
                            <div 
                              className="quantity-controls w-full"
                              style={{
                                display: 'flex',
                                height: '50px',
                                padding: '0 16px',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                alignSelf: 'stretch',
                                borderRadius: '10px',
                                background: '#F6F7F7',
                                border: 'none'
                              }}
                            >
                              <button
                                type="button"
                                onClick={() => {
                                  if (quantity > 1) {
                                    setQuantity((prev) => prev - 1);
                                  }
                                }}
                                className="flex items-center justify-center ease-out duration-200 hover:opacity-70 disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={quantity <= 1}
                                style={{ background: 'none', border: 'none', padding: 0, cursor: quantity <= 1 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}
                              >
                                <span className="sr-only">Decrease quantity</span>
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#383838" strokeWidth="1" style={{ transform: 'scaleX(-1)', transformOrigin: 'center', margin: 0, padding: 0, lineHeight: 0 }}>
                                  <path d="M4.7168 12.1543L5.3457 12.7832L10.8145 7.31445L11.1152 7L10.8145 6.68555L5.3457 1.2168L4.7168 1.8457L9.87109 7L4.7168 12.1543Z" fill="#383838"/>
                                </svg>
                              </button>

                              <span className="flex items-center justify-center font-medium text-[#383838]" style={{ fontFamily: 'Satoshi, sans-serif' }}>
                                {quantity}
                              </span>

                              <button
                                type="button"
                                onClick={() => setQuantity((prev) => prev + 1)}
                                className="flex items-center justify-center ease-out duration-200 hover:opacity-70"
                                style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}
                              >
                                <span className="sr-only">Increase quantity</span>
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#383838" strokeWidth="1">
                                  <path d="M4.7168 12.1543L5.3457 12.7832L10.8145 7.31445L11.1152 7L10.8145 6.68555L5.3457 1.2168L4.7168 1.8457L9.87109 7L4.7168 12.1543Z" fill="#383838"/>
                                </svg>
                              </button>
                            </div>
                          </div>
                        </>
                      )}

                      {/* Length - Full Width Row (Cable products only) - Same style as Gains */}
                      {isCableProduct && lengthOptions.length > 0 && !((product as any).variants && (product as any).variants.length > 0) && (
                        <div className="space-y-2">
                          <label className="text-black text-[20px] font-medium leading-[30px]">
                            Length
                          </label>

                          <div className="flex flex-wrap gap-2">
                            {(() => {
                              // Sort lengthOptions by numeric length value (smallest to largest)
                              const sortedLengthOptions = [...lengthOptions].sort((a: any, b: any) => {
                                const getLengthNumber = (option: any): number => {
                                  const value = getLengthValue(option);
                                  if (!value) return 0;
                                  const cleaned = value.replace(/^Length:\s*/i, "").replace(/\s*dBi/gi, "").trim();
                                  const match = cleaned.match(/(\d+(?:\.\d+)?)\s*ft/i);
                                  return match ? parseFloat(match[1]) : 0;
                                };
                                return getLengthNumber(a) - getLengthNumber(b);
                              });
                              
                              return sortedLengthOptions.map((lengthOption: any, sortedIndex: number) => {
                                // Find original index for selection tracking
                                const originalIndex = lengthOptions.findIndex((opt: any) => 
                                  (opt.variantId && opt.variantId === lengthOption.variantId) ||
                                  (opt.id && opt.id === lengthOption.id) ||
                                  opt === lengthOption
                                );
                                if (lengthOption === null || lengthOption === undefined) return null;
                                const lengthValue = getLengthValue(lengthOption);
                                if (!lengthValue) return null;
                                const actualIndex = originalIndex >= 0 ? originalIndex : sortedIndex;
                                const isSelected = selectedLengthIndex === actualIndex;
                                // Remove "Length:" prefix if present, and remove "dBi"
                                let cleanValue = lengthValue.replace(/^Length:\s*/i, "").trim();
                                cleanValue = cleanValue.replace(/\s*dBi/gi, "").trim();
                                // Ensure "ft" is in the display value (no dBi for cables)
                                let displayValue = cleanValue.includes('ft') ? cleanValue : `${cleanValue} ft`;
                                return (
                                  <button
                                    key={lengthOption.variantId || lengthOption.id || actualIndex}
                                    type="button"
                                    onClick={() => {
                                      setSelectedLengthIndex(actualIndex);
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
                              });
                            })()}
                          </div>
                        </div>
                      )}

                      {/* Quantity - Full Width Row (Antenna products only) */}
                      {product.productType === "antenna" && !isConnectorProduct && !isStandaloneConnector && !isCableProduct && (
                        <div className="space-y-2">
                          <label className="text-black text-[20px] font-medium leading-[30px]">
                            Quantity
                          </label>
                          <div 
                            className="quantity-controls w-full"
                            style={{
                              display: 'flex',
                              height: '50px',
                              padding: '0 16px',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              alignSelf: 'stretch',
                              borderRadius: '10px',
                              background: '#F6F7F7',
                              border: 'none'
                            }}
                          >
                            <button
                              type="button"
                              onClick={() => {
                                if (quantity > 1) {
                                  setQuantity((prev) => prev - 1);
                                }
                              }}
                              className="flex items-center justify-center ease-out duration-200 hover:opacity-70 disabled:opacity-50 disabled:cursor-not-allowed"
                              disabled={quantity <= 1}
                              style={{ background: 'none', border: 'none', padding: 0, cursor: quantity <= 1 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}
                            >
                              <span className="sr-only">Decrease quantity</span>
                              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#383838" strokeWidth="1" style={{ transform: 'scaleX(-1)', transformOrigin: 'center' }}>
                                <path d="M4.7168 12.1543L5.3457 12.7832L10.8145 7.31445L11.1152 7L10.8145 6.68555L5.3457 1.2168L4.7168 1.8457L9.87109 7L4.7168 12.1543Z" fill="#383838"/>
                              </svg>
                            </button>

                            <span className="flex items-center justify-center font-medium text-[#383838]" style={{ fontFamily: 'Satoshi, sans-serif' }}>
                              {quantity}
                            </span>

                            <button
                              type="button"
                              onClick={() => setQuantity((prev) => prev + 1)}
                              className="flex items-center justify-center ease-out duration-200 hover:opacity-70"
                              style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}
                            >
                              <span className="sr-only">Increase quantity</span>
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#383838" strokeWidth="1">
                                <path d="M4.7168 12.1543L5.3457 12.7832L10.8145 7.31445L11.1152 7L10.8145 6.68555L5.3457 1.2168L4.7168 1.8457L9.87109 7L4.7168 12.1543Z" fill="#383838"/>
                              </svg>
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
                          <div 
                            className="quantity-controls w-full"
                            style={{
                              display: 'flex',
                              height: '50px',
                              padding: '0 16px',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              alignSelf: 'stretch',
                              borderRadius: '10px',
                              background: '#F6F7F7',
                              border: '1px solid #2958A4'
                            }}
                          >
                            <button
                              type="button"
                              onClick={() => {
                                if (quantity > 1) {
                                  setQuantity((prev) => prev - 1);
                                }
                              }}
                              className="flex items-center justify-center text-[#2958A4] ease-out duration-200 hover:text-[#1F4480] disabled:opacity-50 disabled:cursor-not-allowed"
                              disabled={quantity <= 1}
                              style={{ background: 'none', border: 'none', padding: 0, cursor: quantity <= 1 ? 'not-allowed' : 'pointer' }}
                            >
                              <span className="sr-only">Decrease quantity</span>
                              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#383838" strokeWidth="1" style={{ transform: 'scaleX(-1)', transformOrigin: 'center' }}>
                                <path d="M4.7168 12.1543L5.3457 12.7832L10.8145 7.31445L11.1152 7L10.8145 6.68555L5.3457 1.2168L4.7168 1.8457L9.87109 7L4.7168 12.1543Z" fill="#383838"/>
                              </svg>
                            </button>
                            <span className="flex items-center justify-center font-medium text-[#383838]" style={{ fontFamily: 'Satoshi, sans-serif' }}>
                              {quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => setQuantity((prev) => prev + 1)}
                              className="flex items-center justify-center text-[#2958A4] ease-out duration-200 hover:text-[#1F4480]"
                              style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
                            >
                              <span className="sr-only">Increase quantity</span>
                              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#383838" strokeWidth="1">
                                <path d="M4.7168 12.1543L5.3457 12.7832L10.8145 7.31445L11.1152 7L10.8145 6.68555L5.3457 1.2168L4.7168 1.8457L9.87109 7L4.7168 12.1543Z" fill="#383838"/>
                              </svg>
                            </button>
                          </div>
                        </div>
                      )}

                  </div>

                  {/* Buttons */}
                  <div className="pt-2 space-y-3 mt-4">
                      <button
                        type="button"
                        onClick={() =>
                          openRequestQuoteModal({
                            products: [
                              {
                                id: product._id,
                                title: product.name ?? "Product",
                                sku: displaySku ?? (product as any).sku ?? undefined,
                                price: dynamicPrice ?? product.price ?? 0,
                                quantity,
                                url:
                                  typeof window !== "undefined"
                                    ? `${window.location.origin}/products/${product?.slug?.current ?? product._id}`
                                    : `/products/${product?.slug?.current ?? product._id}`,
                              },
                            ],
                          })
                        }
                        className="btn filled group relative inline-flex items-center justify-center rounded-[10px] border border-transparent bg-[#2958A4] text-white text-[14px] sm:text-[16px] font-medium transition-all duration-300 ease-in-out hover:bg-[#214683] w-full"
                        style={{ 
                          fontFamily: 'Satoshi, sans-serif',
                          padding: '10px 30px',
                          paddingRight: '30px',
                          cursor: 'pointer',
                          minWidth: 'fit-content'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.paddingRight = 'calc(30px + 17px)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.paddingRight = '30px';
                        }}
                      >
                        <ButtonArrowHomepage />
                        <p className="transition-transform duration-300 ease-in-out group-hover:translate-x-[11px] m-0">Request for Quote</p>
                      </button>
                    </div>
                </div>

              </form>
            </div>
          </div>
        </div>
      </section>
      {/* Description Section - Show for all products including cables */}
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
      <WorkWithUs />
      <Newsletter />
    </>
  );
};

export default ShopDetails;
