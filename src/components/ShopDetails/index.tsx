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
import WorkWithUs from "../Home/Hero/WorkWithUs";
import FaqSection from "../Home/Faq";
import { useRouter } from "next/navigation";
import { formatPrice } from "@/utils/price";
import { ButtonArrowHomepage } from "../Common/ButtonArrowHomepage";

type SelectedAttributesType = {
  [key: number]: string | undefined;
};
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
      let url: string | null = null;
      
      // If img is already a string URL (from Medusa/WordPress), validate it
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
        // Otherwise, try to use imageBuilder for Sanity assets
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

  // Auto-select first length option (for cables) or first variant (for simple connectors or antenna products)
  useEffect(() => {
    // For cable products with variants (WooCommerce) - work like antennas: sort and select index 0
    if (isCableProduct && (product as any).variants && (product as any).variants.length > 0 && selectedLengthIndex < 0) {
      // Sort variants by length (smallest to largest) - same as display sorting
      const sortedVariants = [...(product as any).variants].sort((a: any, b: any) => {
        const getLengthNumber = (variant: any): number => {
          const title = variant.title || "";
          const cleaned = title.replace(/Length:\s*/gi, "").replace(/\s*dBi/gi, "").trim();
          const match = cleaned.match(/(\d+(?:\.\d+)?)\s*ft/i);
          return match ? parseFloat(match[1]) : 0;
        };
        return getLengthNumber(a) - getLengthNumber(b);
      });
      
      // After sorting, the first variant (index 0) is the smallest - select it
      // Find its original index in the unsorted array for price calculation
      if (sortedVariants.length > 0) {
        const firstVariant = sortedVariants[0];
        
        // Extract length from first variant to find matching variant in original array
        const firstVariantTitle = firstVariant.title || "";
        const firstCleaned = firstVariantTitle.replace(/Length:\s*/gi, "").replace(/\s*dBi/gi, "").trim();
        const firstMatch = firstCleaned.match(/(\d+(?:\.\d+)?)\s*ft/i);
        const firstLength = firstMatch ? parseFloat(firstMatch[1]) : 0;
        
        console.log("[ShopDetails] Finding smallest variant - sorted first:", {
          title: firstVariantTitle,
          length: firstLength,
          id: firstVariant.id
        });
        
        // Find original index by matching length value (most reliable method)
        let originalIndex = (product as any).variants.findIndex((v: any) => {
          const vTitle = v.title || "";
          const vCleaned = vTitle.replace(/Length:\s*/gi, "").replace(/\s*dBi/gi, "").trim();
          const vMatch = vCleaned.match(/(\d+(?:\.\d+)?)\s*ft/i);
          const vLength = vMatch ? parseFloat(vMatch[1]) : 0;
          return vLength === firstLength && firstLength > 0;
        });
        
        // Fallback: try matching by ID
        if (originalIndex < 0 && firstVariant.id) {
          originalIndex = (product as any).variants.findIndex((v: any) => v.id === firstVariant.id);
        }
        
        // Fallback: try matching by title
        if (originalIndex < 0) {
          originalIndex = (product as any).variants.findIndex((v: any) => v.title === firstVariantTitle);
        }
        
        // Fallback: try matching by reference
        if (originalIndex < 0) {
          originalIndex = (product as any).variants.findIndex((v: any) => v === firstVariant);
        }
        
        if (originalIndex >= 0) {
          setSelectedLengthIndex(originalIndex);
          const lengthValue = firstMatch ? `${firstMatch[1]} ft` : firstCleaned;
          setSelectedLength(lengthValue);
          console.log("[ShopDetails] ✅ Auto-selected smallest length variant (original index:", originalIndex, "):", firstVariantTitle, "→", lengthValue);
        } else {
          console.error("[ShopDetails] ❌ Could not find original index for smallest variant. Variants:", (product as any).variants.map((v: any) => v.title));
          // Don't set selectedLengthIndex - let display logic handle selection
        }
      }
    } else if (isCableProduct && lengthOptions.length > 0 && selectedLengthIndex < 0) {
      // For cable products with lengthOptions (Medusa) - sort and select smallest
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
      
      if (sortedLengthOptions.length > 0) {
        const firstLength = sortedLengthOptions[0];
        const originalIndex = lengthOptions.findIndex((opt: any) => 
          (opt.variantId && opt.variantId === firstLength.variantId) ||
          (opt.id && opt.id === firstLength.id) ||
          opt === firstLength
        );
        if (originalIndex >= 0) {
          setSelectedLengthIndex(originalIndex);
          setSelectedLength(getLengthValue(firstLength));
          console.log("[ShopDetails] Auto-selected smallest length option for cable product:", firstLength);
        }
      }
    } else if (isSimpleConnector && (product as any).variants && (product as any).variants.length > 0 && selectedLengthIndex < 0) {
      setSelectedLengthIndex(0);
    } else if (product.productType === "antenna" && (product as any).variants && (product as any).variants.length > 0 && selectedLengthIndex < 0) {
      // Auto-select first variant for antenna products with variants (WooCommerce)
      // Variants are already sorted by gain value (smallest to largest)
      setSelectedLengthIndex(0);
      console.log("[ShopDetails] Auto-selected first variant for antenna product:", (product as any).variants[0]);
    }
  }, [lengthOptions, selectedLengthIndex, isCableProduct, isSimpleConnector, product, (product as any).variants]);

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
    // For Medusa: price is in cents, convert to dollars
    // For WooCommerce: price might be in dollars already (check if > 1000, assume cents if so)
    if (option && typeof option === 'object' && option !== null && 'price' in option && typeof option.price === 'number') {
      const optionPrice = option.price;
      // If price is >= 1000, assume it's in cents (Medusa format)
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
        // Try calculated_price first (for Medusa format), then price field (for WooCommerce format)
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
        // Try calculated_price first (for Medusa format), then price field (for WooCommerce format)
        if (selectedVariant?.calculated_price?.calculated_amount) {
          return selectedVariant.calculated_price.calculated_amount / 100; // Convert cents to dollars
        }
        // WooCommerce variations have price directly in dollars
        if (selectedVariant?.price) {
          return selectedVariant.price;
        }
      }
      // Fallback to first variant's price if no selection (sorted by length, smallest first)
      const sortedVariants = [...(product as any).variants].sort((a: any, b: any) => {
        const getLengthNumber = (variant: any): number => {
          const title = variant.title || "";
          const cleaned = title.replace(/Length:\s*/gi, "").replace(/\s*dBi/gi, "").trim();
          const match = cleaned.match(/(\d+(?:\.\d+)?)\s*ft/i);
          return match ? parseFloat(match[1]) : 0;
        };
        return getLengthNumber(a) - getLengthNumber(b);
      });
      if (sortedVariants.length > 0) {
        const firstVariant = sortedVariants[0];
        if (firstVariant?.calculated_price?.calculated_amount) {
          return firstVariant.calculated_price.calculated_amount / 100;
        }
        if (firstVariant?.price) {
          return firstVariant.price;
        }
      }
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
    
    // For antenna products with variants (WooCommerce): use price from selected variant
    if (product.productType === "antenna" && (product as any).variants && (product as any).variants.length > 0) {
      // Use selectedLengthIndex to track selected variant (for antenna products, this represents the selected gain/variant)
      if (selectedLengthIndex >= 0 && (product as any).variants[selectedLengthIndex]) {
        const selectedVariant = (product as any).variants[selectedLengthIndex];
        // Try calculated_price first (for Medusa format), then price field (for WooCommerce format)
        if (selectedVariant?.calculated_price?.calculated_amount) {
          return selectedVariant.calculated_price.calculated_amount / 100; // Convert cents to dollars
        }
        // WooCommerce variations have price directly in dollars
        if (selectedVariant?.price) {
          return selectedVariant.price;
        }
      }
      // Fallback to first variant's price if no selection
      const firstVariant = (product as any).variants[0];
      if (firstVariant?.calculated_price?.calculated_amount) {
        return firstVariant.calculated_price.calculated_amount / 100;
      }
      if (firstVariant?.price) {
        return firstVariant.price;
      }
    }
    
    // For antenna products, use gain options (legacy/Medusa format)
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

  // Console log when variant selection changes (must be after selectedLengthIndex, dynamicPrice, and totalPrice are declared)
  useEffect(() => {
    if (selectedLengthIndex >= 0 && (product as any).variants && (product as any).variants[selectedLengthIndex]) {
      const selectedVariant = (product as any).variants[selectedLengthIndex];
      console.log("[ShopDetails] Selected Variant Changed:");
      console.log("Selected Variant Index:", selectedLengthIndex);
      console.log("Selected Variant:", JSON.stringify(selectedVariant, null, 2));
      console.log("Variant Price:", selectedVariant.price);
      console.log("Variant Calculated Price:", selectedVariant.calculated_price?.calculated_amount);
      console.log("Dynamic Price:", dynamicPrice);
      console.log("Total Price:", totalPrice);
    }
  }, [selectedLengthIndex, product, dynamicPrice, totalPrice]);

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
              <div className="relative min-h-[400px] lg:min-h-[512px] rounded-lg border border-gray-3 flex items-center justify-center">
                <button
                  onClick={handlePreviewSlider}
                  aria-label="button for zoom"
                  className="gallery__Image w-11 h-11 rounded-full bg-gray-1 shadow-1 flex items-center justify-center ease-out duration-200 text-dark hover:text-[#2958A4] absolute top-4 lg:top-6 right-4 lg:right-6 z-50"
                >
                  <FullScreenIcon className="w-6 h-6" />
                </button>

                {mainImageUrl && (
                  <div className="relative w-full lg:h-[512px] rounded-lg overflow-hidden">
                    <Image
                      src={mainImageUrl}
                      alt={product.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 100vw, 50vw"
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

            {/* RIGHT: PRODUCT CONTENT */}
            <div className="w-full lg:w-1/2">
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
                className="mb-4"
              >
                {/* SKU Display - Use SKU from selected variant or product */}
                {(() => {
                  // For connector products with cableSeries and cableType (isConnectorProduct)
                  if (isConnectorProduct && (product as any).variants && (product as any).variants.length > 0) {
                    // Use selected variant if available, otherwise use first variant
                    const variantIndex = selectedLengthIndex >= 0 ? selectedLengthIndex : 0;
                    const selectedVariant = (product as any).variants[variantIndex];
                    const displaySku = selectedVariant?.sku || (product as any).sku;
                    return displaySku ? (
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
                    ) : null;
                  }
                  // For standalone connectors
                  if (isStandaloneConnector) {
                    // Show product SKU or first variant SKU if available
                    const displaySku = (product as any).sku || 
                                      ((product as any).variants && (product as any).variants.length > 0 && (product as any).variants[0]?.sku);
                    return displaySku ? (
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
                    ) : null;
                  }
                  // For simple connectors and other connectors with variants, use SKU from selected variant (cable type)
                  if (product.productType === "connector" && (product as any).variants && (product as any).variants.length > 0) {
                    // Use selected variant if available, otherwise use first variant
                    const variantIndex = selectedLengthIndex >= 0 ? selectedLengthIndex : 0;
                    const selectedVariant = (product as any).variants[variantIndex];
                    const displaySku = selectedVariant?.sku || (product as any).sku;
                    return displaySku ? (
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
                    ) : null;
                  }
                  // For antenna products, use SKU from selected gain option
                  if (product.productType === "antenna" && currentGainOption) {
                    const displaySku = (currentGainOption as any)?.sku || 
                                      (product as any).sku || 
                                      ((product as any).variants && (product as any).variants.length > 0 && (product as any).variants[0]?.sku) ||
                                      (product.gainOptions && product.gainOptions.length > 0 && (product.gainOptions[0] as any)?.sku);
                    return displaySku ? (
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
                    ) : null;
                  }
                  // For other products, show SKU if available
                  const displaySku = (product as any).sku || ((product as any).variants && (product as any).variants.length > 0 && (product as any).variants[0]?.sku);
                  return displaySku ? (
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
                  ) : null;
                })()}

                {/* Product Title */}
                <h2
                  style={{
                    color: '#000',
                    fontFamily: 'Satoshi, sans-serif',
                    fontSize: '48px',
                    fontStyle: 'normal',
                    fontWeight: 400,
                    lineHeight: '58px',
                    letterSpacing: '-1.92px',
                    margin: 0
                  }}
                >
                  {product.name}
                </h2>

                {/* Price */}
                <h3
                  style={{
                    color: '#000',
                    fontFamily: 'Satoshi, sans-serif',
                    fontSize: '36px',
                    fontStyle: 'normal',
                    fontWeight: 400,
                    lineHeight: '36px',
                    letterSpacing: '-1.08px',
                    textTransform: 'uppercase',
                    margin: 0
                  }}
                >
                  ${formatPrice(totalPrice)}
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
                    fontWeight: 500,
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

                          <div className="flex flex-wrap gap-2">
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
                              
                              return sortedVariants.map((variant: any, sortedIndex: number) => {
                                // Find the original index for selection tracking
                                const originalVariantIndex = (product as any).variants.findIndex((v: any) => 
                                  (v.id && variant.id && v.id === variant.id) || 
                                  v === variant
                                );
                                if (!variant) return null;
                                // Extract length value from variant title (e.g., "Length: 10 ft dBi" -> "10 ft")
                                const variantTitle = variant.title || "";
                                console.log(`[ShopDetails] Processing variant title: "${variantTitle}"`);
                                // Remove "Length:" prefix if present (case insensitive, anywhere in string)
                                let cleanedTitle = variantTitle.replace(/Length:\s*/gi, "").trim();
                                // Remove "dBi" if present (case insensitive)
                                cleanedTitle = cleanedTitle.replace(/\s*dBi/gi, "").trim();
                                // Try to extract length (e.g., "10 ft", "25 ft", "1000 ft")
                                const lengthMatch = cleanedTitle.match(/(\d+(?:\.\d+)?)\s*ft/i);
                                let lengthValue;
                                if (lengthMatch) {
                                  // Format as "10 ft" (no dBi, no "Length:" prefix)
                                  lengthValue = `${lengthMatch[1]} ft`;
                                } else {
                                  // Fallback: ensure "ft" is present, remove any remaining "Length:" or "dBi"
                                  let fallback = cleanedTitle.replace(/Length:\s*/gi, "").replace(/\s*dBi/gi, "").trim();
                                  lengthValue = fallback.includes('ft') ? fallback : `${fallback} ft`;
                                }
                                console.log(`[ShopDetails] Extracted length value: "${lengthValue}" from "${variantTitle}"`);
                                // Use original index for selection check - if nothing selected yet, select first (smallest) after sorting
                                const isSelected = originalVariantIndex >= 0 && (
                                  selectedLengthIndex === originalVariantIndex || 
                                  (selectedLengthIndex < 0 && sortedIndex === 0)
                                );
                              
                                return (
                                  <button
                                    key={variant.id || originalVariantIndex}
                                    type="button"
                                    onClick={() => {
                                      // Set to original index so price calculation works correctly
                                      setSelectedLengthIndex(originalVariantIndex >= 0 ? originalVariantIndex : sortedIndex);
                                      setSelectedLength(lengthValue);
                                    }}
                                  className={`rounded-lg border flex items-center justify-center text-center text-[20px] leading-[26px] transition-all duration-200 whitespace-nowrap px-5 py-2.5 min-w-[80px] shadow-sm ${
                                    isSelected
                                      ? "border-[#2958A4] bg-[#2958A4] text-white shadow-md"
                                      : "border-[#2958A4] bg-white text-[#2958A4] hover:bg-[#2958A4] hover:text-white"
                                  }`}
                                >
                                    {lengthValue}
                                  </button>
                                );
                              });
                            })()}
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
                                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='16' viewBox='0 0 12 16'%3E%3Cpath fill='none' stroke='%23383838' stroke-width='1' stroke-linecap='round' stroke-linejoin='round' d='m3 7 3-3 3 3'/%3E%3Cpath fill='none' stroke='%23383838' stroke-width='1' stroke-linecap='round' stroke-linejoin='round' d='m3 9 3 3 3-3'/%3E%3C/svg%3E")`,
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
                      {/* Legacy gainOptions display (for Medusa products) - Convert to dropdown */}
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
                                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='16' viewBox='0 0 12 16'%3E%3Cpath fill='none' stroke='%23383838' stroke-width='1' stroke-linecap='round' stroke-linejoin='round' d='m3 7 3-3 3 3'/%3E%3Cpath fill='none' stroke='%23383838' stroke-width='1' stroke-linecap='round' stroke-linejoin='round' d='m3 9 3 3 3-3'/%3E%3C/svg%3E")`,
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
                                style={{ background: 'none', border: 'none', padding: 0, cursor: quantity <= 1 ? 'not-allowed' : 'pointer' }}
                              >
                                <span className="sr-only">Decrease quantity</span>
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#383838" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="m15 18-6-6 6-6"/>
                                </svg>
                              </button>

                              <span className="flex items-center justify-center font-medium text-[#2958A4]" style={{ fontFamily: 'Satoshi, sans-serif' }}>
                                {quantity}
                              </span>

                              <button
                                type="button"
                                onClick={() => setQuantity((prev) => prev + 1)}
                                className="flex items-center justify-center ease-out duration-200 hover:opacity-70"
                                style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
                              >
                                <span className="sr-only">Increase quantity</span>
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#383838" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="m9 18 6-6-6-6"/>
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
                                style={{ background: 'none', border: 'none', padding: 0, cursor: quantity <= 1 ? 'not-allowed' : 'pointer' }}
                              >
                                <span className="sr-only">Decrease quantity</span>
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#383838" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="m15 18-6-6 6-6"/>
                                </svg>
                              </button>

                              <span className="flex items-center justify-center font-medium text-[#2958A4]" style={{ fontFamily: 'Satoshi, sans-serif' }}>
                                {quantity}
                              </span>

                              <button
                                type="button"
                                onClick={() => setQuantity((prev) => prev + 1)}
                                className="flex items-center justify-center ease-out duration-200 hover:opacity-70"
                                style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
                              >
                                <span className="sr-only">Increase quantity</span>
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#383838" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="m9 18 6-6-6-6"/>
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
                                style={{ background: 'none', border: 'none', padding: 0, cursor: quantity <= 1 ? 'not-allowed' : 'pointer' }}
                              >
                                <span className="sr-only">Decrease quantity</span>
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#383838" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="m15 18-6-6 6-6"/>
                                </svg>
                              </button>

                              <span className="flex items-center justify-center font-medium text-[#2958A4]" style={{ fontFamily: 'Satoshi, sans-serif' }}>
                                {quantity}
                              </span>

                              <button
                                type="button"
                                onClick={() => setQuantity((prev) => prev + 1)}
                                className="flex items-center justify-center ease-out duration-200 hover:opacity-70"
                                style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
                              >
                                <span className="sr-only">Increase quantity</span>
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#383838" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="m9 18 6-6-6-6"/>
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
                              style={{ background: 'none', border: 'none', padding: 0, cursor: quantity <= 1 ? 'not-allowed' : 'pointer' }}
                            >
                              <span className="sr-only">Decrease quantity</span>
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#383838" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="m15 18-6-6 6-6"/>
                              </svg>
                            </button>

                            <span className="flex items-center justify-center font-medium text-[#2958A4]" style={{ fontFamily: 'Satoshi, sans-serif' }}>
                              {quantity}
                            </span>

                            <button
                              type="button"
                              onClick={() => setQuantity((prev) => prev + 1)}
                              className="flex items-center justify-center ease-out duration-200 hover:opacity-70"
                              style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
                            >
                              <span className="sr-only">Increase quantity</span>
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#383838" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="m9 18 6-6-6-6"/>
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
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="m15 18-6-6 6-6"/>
                              </svg>
                            </button>
                            <span className="flex items-center justify-center font-medium text-[#2958A4]" style={{ fontFamily: 'Satoshi, sans-serif' }}>
                              {quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => setQuantity((prev) => prev + 1)}
                              className="flex items-center justify-center text-[#2958A4] ease-out duration-200 hover:text-[#1F4480]"
                              style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
                            >
                              <span className="sr-only">Increase quantity</span>
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="m9 18 6-6-6-6"/>
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
                        onClick={handleAddToCart}
                        disabled={isProductInCart}
                        className={`btn filled group relative inline-flex items-center justify-center rounded-[10px] border border-transparent bg-[#2958A4] text-white text-[14px] sm:text-[16px] font-medium transition-all duration-300 ease-in-out hover:bg-[#214683] w-full ${
                          isProductInCart
                            ? "opacity-70 cursor-not-allowed"
                            : ""
                        }`}
                        style={{ 
                          fontFamily: 'Satoshi, sans-serif',
                          padding: '10px 30px',
                          paddingRight: '30px',
                          cursor: isProductInCart ? 'not-allowed' : 'pointer',
                          minWidth: 'fit-content'
                        }}
                        onMouseEnter={(e) => {
                          if (!isProductInCart) {
                            e.currentTarget.style.paddingRight = 'calc(30px + 17px)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isProductInCart) {
                            e.currentTarget.style.paddingRight = '30px';
                          }
                        }}
                      >
                        <ButtonArrowHomepage />
                        <p className="transition-transform duration-300 ease-in-out group-hover:translate-x-[11px] m-0">
                          {isProductInCart ? "Added to Cart" : "Add to Cart"}
                        </p>
                      </button>

                      <button
                        type="button"
                        onClick={() => router.push("/request-a-quote")}
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
                        <p className="transition-transform duration-300 ease-in-out group-hover:translate-x-[11px] m-0">Request a Quote</p>
                      </button>
                    </div>
                </div>

              </form>
            </div>
          </div>
        </div>
      </section>
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
      <WorkWithUs />
      <FaqSection />
      <Newsletter />
    </>
  );
};

export default ShopDetails;
