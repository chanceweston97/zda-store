"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRequestQuoteModal } from "@/app/context/RequestQuoteModalContext";
import Breadcrumb from "../Common/Breadcrumb";
import { useAutoOpenCart } from "../Providers/AutoOpenCartProvider";
import toast from "react-hot-toast";
import { MinusIcon, PlusIcon } from "@/assets/icons";
import { ButtonArrowHomepage } from "../Common/ButtonArrowHomepage";
import Newsletter from "../Common/Newsletter";
import { formatPrice } from "@/utils/price";
import WorkWithUs from "../Home/Hero/WorkWithUs";

// Types for CMS data
interface CableCustomizerData {
  cableSeries: Array<{ id: string; name: string; slug: string }>;
  cableTypes: Array<{
    id: string;
    name: string;
    slug: string;
    series: string;
    seriesName: string;
    pricePerFoot: number;
    image: string | null;
    maxLength?: number | null;
    allowedConnectors?: string[] | null;
  }>;
  connectors: Array<{
    id: string;
    name: string;
    slug: string;
    image: string | null;
    pricing: Array<{
      cableTypeSlug: string;
      cableTypeName: string;
      price: number;
    }>;
  }>;
}

interface CableConfig {
  cableSeries: string;
  cableType: string;
  connector1: string;
  connector2: string;
  length: number | "";
  quantity: number;
}

interface CableCustomizerClientProps {
  data: CableCustomizerData;
}

interface ValidationErrors {
  cableSeries?: string;
  cableType?: string;
  connector1?: string;
  connector2?: string;
  length?: string;
}

export default function CableCustomizerClient({ data }: CableCustomizerClientProps) {
  const router = useRouter();
  const { addItemWithAutoOpen } = useAutoOpenCart();
  const { openRequestQuoteModal } = useRequestQuoteModal();
  const [config, setConfig] = useState<CableConfig>({
    cableSeries: "",
    cableType: "",
    connector1: "",
    connector2: "",
    length: "",
    quantity: 1,
  });
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Build lookup maps from CMS data
  const cableSeriesMap = useMemo(() => {
    const map = new Map<string, { id: string; name: string; slug: string }>();
    data.cableSeries.forEach((series) => {
      map.set(series.slug, series);
    });
    return map;
  }, [data.cableSeries]);

  const cableTypesMap = useMemo(() => {
    const map = new Map<string, typeof data.cableTypes[0]>();
    data.cableTypes.forEach((type) => {
      map.set(type.slug, type);
    });
    return map;
  }, [data.cableTypes]);

  const connectorsMap = useMemo(() => {
    const map = new Map<string, typeof data.connectors[0]>();
    data.connectors.forEach((connector) => {
      map.set(connector.slug, connector);
    });
    return map;
  }, [data.connectors]);

  // Get available cable types based on selected series
  const availableCableTypes = useMemo(() => {
    if (!config.cableSeries) return [];
    const selectedSeries = cableSeriesMap.get(config.cableSeries);
    if (!selectedSeries) return [];
    
    return data.cableTypes
      .filter((type) => type.series === selectedSeries.slug)
      .sort((a, b) => (a.name > b.name ? 1 : -1));
  }, [config.cableSeries, data.cableTypes, cableSeriesMap]);

  // Get available connectors - show ALL connectors from admin (like frontend project)
  const availableConnectors = useMemo(() => {
    const sorted = data.connectors.sort((a, b) => (a.name > b.name ? 1 : -1));
    return sorted;
  }, [data.connectors]);

  // Get connector price for a specific cable type
  const getConnectorPrice = (connectorSlug: string, cableTypeSlug: string): number => {
    const connector = connectorsMap.get(connectorSlug);
    if (!connector) {
      return 0;
    }
    
    if (!cableTypeSlug) {
      return 0;
    }
    
    // Get the actual cable type object to ensure we have the correct slug
    const cableType = cableTypesMap.get(cableTypeSlug);
    const actualCableTypeSlug = cableType?.slug || cableTypeSlug;
    
    // Normalize slugs for comparison (lowercase, trim)
    const normalizedCableTypeSlug = actualCableTypeSlug.toLowerCase().trim();
    
    // Try exact match first
    let pricing = connector.pricing.find((p) => {
      if (!p.cableTypeSlug) return false;
      const pSlug = p.cableTypeSlug.toLowerCase().trim();
      return pSlug === normalizedCableTypeSlug;
    });
    
    // If no exact match, try matching with the cable type slug from the map
    if (!pricing && cableType) {
      pricing = connector.pricing.find((p) => {
        if (!p.cableTypeSlug) return false;
        const pSlug = p.cableTypeSlug.toLowerCase().trim();
        const cableTypeSlugLower = cableType.slug.toLowerCase().trim();
        return pSlug === cableTypeSlugLower;
      });
    }
    
    // If still no match, try partial match (in case of slug variations)
    if (!pricing) {
      pricing = connector.pricing.find((p) => {
        if (!p.cableTypeSlug) return false;
        const pSlug = p.cableTypeSlug.toLowerCase().trim();
        return pSlug.includes(normalizedCableTypeSlug) || normalizedCableTypeSlug.includes(pSlug);
      });
    }
    
    return pricing?.price || 0;
  };

  // Calculate price based on CMS data
  const calculatePrice = (config: CableConfig & { cableType: string; connector1: string; connector2: string; length: number }): number => {
    const cableType = cableTypesMap.get(config.cableType);
    if (!cableType) return 0;

    const connector1 = connectorsMap.get(config.connector1);
    const connector2 = connectorsMap.get(config.connector2);
    
    if (!connector1 || !connector2) return 0;

    // Find connector prices for this cable type
    const connector1Price = getConnectorPrice(config.connector1, config.cableType);
    const connector2Price = getConnectorPrice(config.connector2, config.cableType);

    // Calculate cable footage cost
    const cableFootageCost = cableType.pricePerFoot * config.length;

    // Apply formula: ((Connector 1 cost + Cable footage cost + Connect 2 cost) x 1.35)
    const unitPrice = (connector1Price + cableFootageCost + connector2Price) * 1.35;

    // Return price in dollars, rounded to 2 decimal places to avoid floating point precision issues
    return Math.round(unitPrice * 100) / 100;
  };

  // Get connector image from CMS or fallback
  const getConnectorImage = (connectorSlug: string): string => {
    const connector = connectorsMap.get(connectorSlug);
    if (connector?.image) {
      return connector.image;
    }
    
    // Fallback to static images
    const connectorLower = connectorSlug.toLowerCase().replace(/\s+/g, "-");
    if (connectorLower.includes("n-male")) {
      return "/images/cable-customizer/n-male-main.png";
    }
    if (connectorLower.includes("n-female") && !connectorLower.includes("bulkhead")) {
      return "/images/cable-customizer/n-female-main.png";
    }
    if (connectorLower.includes("sma-male")) {
      return "/images/cable-customizer/sma-male-main.png";
    }
    if (connectorLower.includes("sma-female")) {
      return "/images/cable-customizer/sma-female-main.png";
    }
    
    return "/images/cable-customizer/n-male-main.png";
  };

  const validateField = (field: keyof ValidationErrors, value: any): string | undefined => {
    switch (field) {
      case "cableSeries":
        return !value ? "Please select a Cable Series" : undefined;
      case "cableType":
        return !value ? "Please select a Cable Type" : undefined;
      case "connector1":
        return !value ? "Please select Connector A" : undefined;
      case "connector2":
        return !value ? "Please select Connector B" : undefined;
      case "length":
        if (!value || value === "") {
          return "Please enter a cable length";
        }
        if (typeof value === "number" && value <= 0) {
          return "Length must be greater than 0";
        }
        if (typeof value === "number" && value > 150) {
          return "Maximum length is 150 ft";
        }
        return undefined;
      default:
        return undefined;
    }
  };

  const validateAll = (): boolean => {
    const newErrors: ValidationErrors = {};
    let isValid = true;

    const fieldsToValidate: Array<keyof ValidationErrors> = [
      "cableSeries",
      "cableType",
      "connector1",
      "connector2",
      "length",
    ];

    fieldsToValidate.forEach((field) => {
      const value = config[field];
      const error = validateField(field, value);
      if (error) {
        newErrors[field] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    
    // Mark all fields as touched
    setTouched({
      cableSeries: true,
      cableType: true,
      connector1: true,
      connector2: true,
      length: true,
    });

    return isValid;
  };

  const handleAddToCart = () => {
    // Validate all fields
    if (!validateAll()) {
      return;
    }

    const cableType = cableTypesMap.get(config.cableType);
    const connector1 = connectorsMap.get(config.connector1);
    const connector2 = connectorsMap.get(config.connector2);

    if (!cableType || !connector1 || !connector2) {
      toast.error("Invalid configuration. Please try again.");
      return;
    }

    const priceInDollars = calculatePrice({
      ...config,
      cableType: config.cableType,
      connector1: config.connector1,
      connector2: config.connector2,
      length: typeof config.length === 'number' ? config.length : 0,
    });

    // Convert to cents for cart (shopping cart expects prices in cents)
    const priceInCents = Math.round(priceInDollars * 100);

    const cableName = `Custom Cable - ${connector1.name} to ${connector2.name} (${config.length}ft, ${cableType.name})`;
    
    // Create a unique ID for this custom cable configuration
    const customId = `custom-cable-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Create unique key to prevent cart item merging (timestamp-based)
    const uniqueKey = `cc_${Date.now()}`;
    
    const cartItem = {
      id: customId,
      name: cableName,
      price: priceInCents,
      currency: "usd",
      image: "/images/cable-customizer/hero-cable.png",
      price_id: null,
      slug: "custom-cable",
      // WooCommerce product ID for custom cables (virtual product)
      product_id: 3365,
      // Unique key to prevent cart item merging
      unique_key: uniqueKey,
      metadata: {
        // WooCommerce product ID (for convertCartItemToWC function)
        woocommerce_product_id: 3365,
        wc_product_id: 3365,
        // WooCommerce meta_data format (will be converted in convertCartItemToWC)
        cable: cableType.name,
        length: `${config.length}ft`,
        from: connector1.name,
        to: connector2.name,
        display_name: cableName,
        // Additional metadata for internal use
        cableSeries: config.cableSeries,
        cableType: config.cableType,
        cableTypeName: cableType.name,
        connector1: config.connector1,
        connector1Name: connector1.name,
        connector2: config.connector2,
        connector2Name: connector2.name,
        lengthInFeet: config.length, // Use different key to avoid conflict
        isCustom: true,
        unique_key: uniqueKey,
      },
    };

    // Add to cart with quantity
    addItemWithAutoOpen(cartItem, config.quantity);
    toast.success("Custom cable added to cart!");
    
    // Clear errors after successful submission
    setErrors({});
    setTouched({});
  };

  const totalPrice = config.cableType && config.connector1 && config.connector2 && config.length && typeof config.length === 'number' && config.length > 0
    ? calculatePrice({
        ...config,
        cableType: config.cableType,
        connector1: config.connector1,
        connector2: config.connector2,
        length: config.length,
      })
    : 0;

  // Get connector prices for display
  const connector1Price = config.cableType && config.connector1 
    ? getConnectorPrice(config.connector1, config.cableType)
    : 0;
  const connector2Price = config.cableType && config.connector2
    ? getConnectorPrice(config.connector2, config.cableType)
    : 0;

  return (
    <>      
      {/* Hero Section */}
      <section 
        className="relative mt-[80px] overflow-hidden flex items-center p-5 md:p-0"
        style={{
          height: 'auto',
          minHeight: '350px',
          background: 'radial-gradient(143.61% 142.34% at 55.45% -16%, #2958A4 34.13%, #1870D5 74.53%, #70C8FF 100%)'
        }}
      >
        {/* Dot Background SVG */}
        <div className="absolute inset-0 pointer-events-none">
          <Image
            src="/images/xetawave-dot.svg"
            alt=""
            fill
            className="object-cover"
            sizes="100vw"
          />
        </div>
        <div className="relative z-10 w-full px-4 mx-auto max-w-7xl sm:px-6 xl:px-0">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div className="text-center md:text-left">
              <h1 
                className="text-white"
                style={{
                  color: '#FFF',
                  fontFamily: 'Satoshi, sans-serif',
                  fontSize: 'clamp(32px, 8vw, 60px)',
                  fontStyle: 'normal',
                  fontWeight: 400,
                  lineHeight: 'clamp(40px, 8vw, 50px)',
                  letterSpacing: '-2.4px',
                  marginBottom: 'clamp(20px, 5vw, 50px)'
                }}
              >
                Custom Cable Builder
              </h1>
              <p 
                className="text-white"
                style={{
                  color: '#FFF',
                  fontFamily: 'Satoshi, sans-serif',
                  fontSize: 'clamp(16px, 4vw, 24px)',
                  fontStyle: 'normal',
                  fontWeight: 400,
                  lineHeight: 'clamp(24px, 4vw, 28px)'
                }}
              >
                Engineered to carry what matters, built to length for the links you rely on.
              </p>
            </div>
            <div className="flex justify-center lg:justify-end">
              <div className="relative w-full max-w-md h-64 lg:h-80 flex items-center justify-center">
                <div 
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: 'radial-gradient(circle, rgba(61, 107, 184, 0.6) 0%, rgba(41, 88, 164, 0.4) 40%, rgba(31, 68, 128, 0.2) 70%, transparent 100%)',
                    filter: 'blur(40px)',
                    transform: 'scale(1.2)',
                  }}
                ></div>
                <div 
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: 'radial-gradient(circle, rgba(41, 88, 164, 0.3) 0%, transparent 60%)',
                    filter: 'blur(60px)',
                    transform: 'scale(1.5)',
                  }}
                ></div>
                <div className="relative w-full h-full flex items-center justify-center z-10">
                  <Image
                    src="/images/cable-customizer/hero-cable.png"
                    alt="Custom Cable"
                    fill
                    className="object-contain"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative py-10 mb-[50px]">
        <div className="w-full px-4 mx-auto max-w-7xl sm:px-6 xl:px-0">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Left: Configuration Panel */}
            <div className="space-y-6">
              {/* Order Summary Card */}
              <div className="bg-white rounded-lg border border-gray-3 p-6">
                <h3 
                  style={{
                    color: '#2958A4',
                    fontFamily: 'Satoshi, sans-serif',
                    fontSize: '24px',
                    fontStyle: 'normal',
                    fontWeight: 400,
                    letterSpacing: '-0.48px',
                    marginBottom: '24px'
                  }}
                >
                    Order Summary
                  </h3>

                {/* Cable Series */}
                <div className="mb-4">
                  <label className="block text-[#383838] text-[16px] mb-2">
                    Cable Series *
                  </label>
                  <select
                    value={config.cableSeries}
                    onChange={(e) => {
                      const series = e.target.value;
                      setConfig((prev) => ({ 
                        ...prev, 
                        cableSeries: series,
                        cableType: "" // Reset cable type when series changes
                      }));
                      // Clear error when field changes
                      if (errors.cableSeries) {
                        setErrors((prev) => ({ ...prev, cableSeries: undefined }));
                      }
                    }}
                    onBlur={() => setTouched((prev) => ({ ...prev, cableSeries: true }))}
                    className={`w-full appearance-none transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#2958A4] focus:border-[#2958A4] ${
                      touched.cableSeries && errors.cableSeries
                        ? "border-red-500 focus:border-red-500"
                        : ""
                    }`}
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
                      color: '#383838',
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='20' viewBox='0 0 14 20' fill='none'%3E%3Cpath d='M7 0.88477L6.68555 1.18555L1.2168 6.6543L1.8457 7.2832L7 2.12891L12.1543 7.2832L12.7832 6.6543L7.31445 1.18555L7 0.88477Z' fill='%23383838'/%3E%3Cpath d='M7 19.1152L6.68555 18.8144L1.2168 13.3457L1.8457 12.7168L7 17.87109L12.1543 12.7168L12.7832 13.3457L7.31445 18.8144L7 19.1152Z' fill='%23383838'/%3E%3C/svg%3E")`,
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'right 16px center',
                      paddingRight: '2.5rem'
                    }}
                  >
                    <option value="" style={{ color: '#383838' }}>Select Cable Series</option>
                    {data.cableSeries.map((series) => (
                      <option key={series.id} value={series.slug} style={{ color: '#383838' }}>
                        {series.name}
                      </option>
                    ))}
                  </select>
                  {touched.cableSeries && errors.cableSeries && (
                    <p className="mt-1 text-sm text-red">{errors.cableSeries}</p>
                  )}
                </div>

                {/* Cable Type */}
                <div className="mb-4">
                  <label className="block text-[#383838] text-[16px] mb-2">
                    Cable Type *
                  </label>
                  <select
                    value={config.cableType}
                    onChange={(e) => {
                      const newCableType = e.target.value;
                      const selectedCableType = newCableType ? cableTypesMap.get(newCableType) : null;
                      
                      // Reset connectors if they're not valid for the new cable type
                      let newConnector1 = config.connector1;
                      let newConnector2 = config.connector2;
                      
                      if (newCableType && selectedCableType) {
                        // Get available connectors for the new cable type
                        let availableForNewType: typeof data.connectors;
                        
                        if (selectedCableType.slug === "lmr-600") {
                          // For LMR 600, only allow N-Male and N-Female
                          availableForNewType = data.connectors.filter((connector) => {
                            const connectorLower = connector.slug.toLowerCase();
                            return connectorLower === "n-male" || connectorLower === "n-female";
                          });
                        } else {
                          // For other cable types, filter connectors that have pricing for this cable type
                          availableForNewType = data.connectors.filter((connector) => {
                            return connector.pricing.some((p) => p.cableTypeSlug === newCableType);
                          });
                        }
                        
                        const availableSlugs = new Set(availableForNewType.map(c => c.slug));
                        
                        // Reset connector1 if it's not available
                        if (newConnector1 && !availableSlugs.has(newConnector1)) {
                          newConnector1 = "";
                        }
                        
                        // Reset connector2 if it's not available
                        if (newConnector2 && !availableSlugs.has(newConnector2)) {
                          newConnector2 = "";
                        }
                      } else {
                        // If no cable type selected, reset connectors
                        newConnector1 = "";
                        newConnector2 = "";
                      }
                      
                      setConfig((prev) => ({ 
                        ...prev, 
                        cableType: newCableType,
                        connector1: newConnector1,
                        connector2: newConnector2,
                      }));
                      
                      // Clear errors when field changes
                      if (errors.cableType) {
                        setErrors((prev) => ({ ...prev, cableType: undefined }));
                      }
                    }}
                    onBlur={() => setTouched((prev) => ({ ...prev, cableType: true }))}
                    disabled={!config.cableSeries}
                    className={`w-full appearance-none transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#2958A4] focus:border-[#2958A4] disabled:cursor-not-allowed disabled:opacity-50 ${
                      touched.cableType && errors.cableType
                        ? "border-red-500 focus:border-red-500"
                        : ""
                    }`}
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
                      color: '#383838',
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='20' viewBox='0 0 14 20' fill='none'%3E%3Cpath d='M7 0.88477L6.68555 1.18555L1.2168 6.6543L1.8457 7.2832L7 2.12891L12.1543 7.2832L12.7832 6.6543L7.31445 1.18555L7 0.88477Z' fill='%23383838'/%3E%3Cpath d='M7 19.1152L6.68555 18.8144L1.2168 13.3457L1.8457 12.7168L7 17.87109L12.1543 12.7168L12.7832 13.3457L7.31445 18.8144L7 19.1152Z' fill='%23383838'/%3E%3C/svg%3E")`,
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'right 16px center',
                      paddingRight: '2.5rem'
                    }}
                  >
                    <option value="" style={{ color: '#383838' }}>
                      {config.cableSeries ? "Select Cable Type" : "Select Cable Series first"}
                    </option>
                    {availableCableTypes.map((type) => (
                      <option key={type.id} value={type.slug} style={{ color: '#383838' }}>
                        {type.name}
                      </option>
                    ))}
                  </select>
                  {touched.cableType && errors.cableType && (
                    <p className="mt-1 text-sm text-red">{errors.cableType}</p>
                  )}
                </div>

                {/* Connector 1 Dropdown */}
                <div className="mb-4">
                  <label className="block text-[#383838] text-[16px] mb-2">
                    Step 1: Connector A *
                  </label>
                  <select
                    value={config.connector1}
                    onChange={(e) => {
                      setConfig((prev) => ({ ...prev, connector1: e.target.value }));
                      // Clear error when field changes
                      if (errors.connector1) {
                        setErrors((prev) => ({ ...prev, connector1: undefined }));
                      }
                    }}
                    onBlur={() => setTouched((prev) => ({ ...prev, connector1: true }))}
                    className={`w-full appearance-none transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#2958A4] focus:border-[#2958A4] ${
                      touched.connector1 && errors.connector1
                        ? "border-red-500 focus:border-red-500"
                        : ""
                    }`}
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
                      color: '#383838',
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='20' viewBox='0 0 14 20' fill='none'%3E%3Cpath d='M7 0.88477L6.68555 1.18555L1.2168 6.6543L1.8457 7.2832L7 2.12891L12.1543 7.2832L12.7832 6.6543L7.31445 1.18555L7 0.88477Z' fill='%23383838'/%3E%3Cpath d='M7 19.1152L6.68555 18.8144L1.2168 13.3457L1.8457 12.7168L7 17.87109L12.1543 12.7168L12.7832 13.3457L7.31445 18.8144L7 19.1152Z' fill='%23383838'/%3E%3C/svg%3E")`,
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'right 16px center',
                      paddingRight: '2.5rem'
                    }}
                  >
                    <option value="" style={{ color: '#383838' }}>Select Connector A</option>
                    {availableConnectors.map((connector) => (
                      <option key={connector.id} value={connector.slug} style={{ color: '#383838' }}>
                        {connector.name}
                      </option>
                    ))}
                  </select>
                  {touched.connector1 && errors.connector1 && (
                    <p className="mt-1 text-sm text-red">{errors.connector1}</p>
                  )}
                </div>

                {/* Connector 2 Dropdown */}
                <div className="mb-4">
                  <label className="block text-[#383838] text-[16px] mb-2">
                    Step 2: Connector B *
                  </label>
                  <select
                    value={config.connector2}
                    onChange={(e) => {
                      setConfig((prev) => ({ ...prev, connector2: e.target.value }));
                      // Clear error when field changes
                      if (errors.connector2) {
                        setErrors((prev) => ({ ...prev, connector2: undefined }));
                      }
                    }}
                    onBlur={() => setTouched((prev) => ({ ...prev, connector2: true }))}
                    className={`w-full appearance-none transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#2958A4] focus:border-[#2958A4] ${
                      touched.connector2 && errors.connector2
                        ? "border-red-500 focus:border-red-500"
                        : ""
                    }`}
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
                      color: '#383838',
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='20' viewBox='0 0 14 20' fill='none'%3E%3Cpath d='M7 0.88477L6.68555 1.18555L1.2168 6.6543L1.8457 7.2832L7 2.12891L12.1543 7.2832L12.7832 6.6543L7.31445 1.18555L7 0.88477Z' fill='%23383838'/%3E%3Cpath d='M7 19.1152L6.68555 18.8144L1.2168 13.3457L1.8457 12.7168L7 17.87109L12.1543 12.7168L12.7832 13.3457L7.31445 18.8144L7 19.1152Z' fill='%23383838'/%3E%3C/svg%3E")`,
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'right 16px center',
                      paddingRight: '2.5rem'
                    }}
                  >
                    <option value="" style={{ color: '#383838' }}>Select Connector B</option>
                    {availableConnectors.map((connector) => (
                      <option key={connector.id} value={connector.slug} style={{ color: '#383838' }}>
                        {connector.name}
                      </option>
                    ))}
                  </select>
                  {touched.connector2 && errors.connector2 && (
                    <p className="mt-1 text-sm text-red">{errors.connector2}</p>
                  )}
                </div>

                {/* Cable Length */}
                <div className="mb-4">
                  <label className="block text-[#383838] text-[16px] mb-2">
                    Step 3: Cable Length *
                  </label>
                  <div className="space-y-3">
                    <input
                      type="number"
                      min="1"
                      max={150}
                      step="1"
                      value={config.length}
                      onChange={(e) => {
                        const value = e.target.value ? parseInt(e.target.value) : "";
                        if (typeof value === "number" && value > 150) {
                          setErrors((prev) => ({ ...prev, length: "Maximum length is 150 ft" }));
                          return;
                        }
                        
                        setConfig((prev) => ({ ...prev, length: value }));
                        // Clear error when field changes
                        if (errors.length) {
                          setErrors((prev) => ({ ...prev, length: undefined }));
                        }
                      }}
                      onBlur={() => {
                        setTouched((prev) => ({ ...prev, length: true }));
                        // Validate on blur
                        const error = validateField("length", config.length);
                        if (error) {
                          setErrors((prev) => ({ ...prev, length: error }));
                        }
                      }}
                      placeholder="Enter length in feet"
                      className={`w-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#2958A4] focus:border-[#2958A4] ${
                        touched.length && errors.length
                          ? "border-red-500 focus:border-red-500"
                          : ""
                      }`}
                      style={{
                        height: '50px',
                        padding: '0 16px',
                        borderRadius: '10px',
                        background: '#F6F7F7',
                        border: 'none',
                        fontFamily: 'Satoshi, sans-serif',
                        fontSize: '16px',
                        fontWeight: 400,
                        color: '#383838'
                      }}
                      onInvalid={(e) => {
                        e.preventDefault();
                      }}
                    />
                    <div className="space-y-1">
                      <p className="text-sm text-gray-4">Minimum length: 1 foot</p>
                      <p className="text-sm text-gray-4">Maximum length: 150 ft</p>
                    </div>
                    {touched.length && errors.length && (
                      <p className="mt-1 text-sm text-red">{errors.length}</p>
                    )}
                  </div>
                </div>

                {/* Quantity */}
                <div className="mb-4">
                  <label className="block text-[#383838] text-[16px] mb-2">
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
                      onClick={() => setConfig((prev) => ({ ...prev, quantity: Math.max(1, prev.quantity - 1) }))}
                      className="flex items-center justify-center ease-out duration-200 hover:opacity-70 disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={config.quantity <= 1}
                      style={{ background: 'none', border: 'none', padding: 0, cursor: config.quantity <= 1 ? 'not-allowed' : 'pointer' }}
                    >
                      <span className="sr-only">Decrease quantity</span>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#383838" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="m15 18-6-6 6-6"/>
                      </svg>
                    </button>

                    <span className="flex items-center justify-center text-[#383838]" style={{ fontFamily: 'Satoshi, sans-serif' }}>
                      {config.quantity}
                    </span>

                    <button
                      type="button"
                      onClick={() => setConfig((prev) => ({ ...prev, quantity: prev.quantity + 1 }))}
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

                {/* Price Display */}
                {totalPrice > 0 && (
                  <div className="mb-4 pt-4 border-t border-gray-3">
                    <div className="flex justify-between items-center">
                      <span className="text-[#383838] text-[18px]">Total Price:</span>
                      <span className="text-[#2958A4] text-[24px] font-normal">${formatPrice(totalPrice)}</span>
                    </div>
                  </div>
                )}

                {/* Request for Quote Button - same flow as PDP, title = customized cable contents */}
                <button
                  type="button"
                  onClick={() => {
                    const connectorAName = config.connector1
                      ? connectorsMap.get(config.connector1)?.name ?? "Not selected"
                      : "Not selected";
                    const connectorBName = config.connector2
                      ? connectorsMap.get(config.connector2)?.name ?? "Not selected"
                      : "Not selected";
                    const cableTypeName = config.cableType
                      ? cableTypesMap.get(config.cableType)?.name ?? "Not selected"
                      : "Not selected";
                    const lengthStr =
                      config.length !== "" && typeof config.length === "number" && config.length > 0
                        ? `${config.length} ft`
                        : "Not selected";
                    const customizedCableTitle = `Customized Cable: Connector A: ${connectorAName}, Connector B: ${connectorBName}, Cable Length: ${lengthStr}, Quantity: ${config.quantity}`;
                    openRequestQuoteModal({
                      products: [
                        {
                          id: "custom-cable",
                          title: customizedCableTitle,
                          sku: "Custom Cable",
                          price: totalPrice,
                          quantity: config.quantity,
                          url:
                            typeof window !== "undefined"
                              ? `${window.location.origin}/cable-builder`
                              : "/cable-builder",
                        },
                      ],
                    });
                  }}
                  className="btn filled group relative inline-flex items-center justify-center rounded-[10px] border border-transparent text-[14px] sm:text-[16px] transition-all duration-300 ease-in-out hover:opacity-90 w-full"
                  style={{ 
                    fontFamily: 'Satoshi, sans-serif',
                    backgroundColor: '#2958A4',
                    color: '#FFF',
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

            {/* Right: Visual Preview */}
            <div className="bg-white rounded-lg border border-gray-3 p-6 lg:p-8">
                <h3 
                  style={{
                    color: '#2958A4',
                    fontFamily: 'Satoshi, sans-serif',
                    fontSize: '24px',
                    fontStyle: 'normal',
                    fontWeight: 400,
                    letterSpacing: '-0.48px',
                    marginBottom: '24px',
                    textAlign: 'center'
                  }}
                >
                  Preview
                </h3>
              
              <div className="flex items-center justify-center gap-4 lg:gap-8 mb-8">
                {/* Connector 1 */}
                <div className="flex flex-col items-center">
                  {config.connector1 ? (
                    <>
                      <div className="w-24 h-24 lg:w-32 lg:h-32 relative">
                        <Image
                          src={getConnectorImage(config.connector1)}
                          alt={connectorsMap.get(config.connector1)?.name || "Connector A"}
                          fill
                          className="object-contain"
                        />
                      </div>
                      <p className="mt-2 text-[#383838] text-sm text-center max-w-[100px]">
                        {connectorsMap.get(config.connector1)?.name || "Connector A"}
                      </p>
                    </>
                  ) : (
                    <div className="w-24 h-24 lg:w-32 lg:h-32 flex items-center justify-center border-2 border-dashed border-gray-3 rounded-lg">
                      <span className="text-gray-4 text-xs text-center">Select Connector A</span>
                    </div>
                  )}
                </div>

                {/* Cable */}
                <div className="flex-1 flex flex-col items-center justify-center relative">
                  <div className="relative w-full h-16 lg:h-20">
                    <Image
                      src="/images/cable-customizer/cable.png"
                      alt="Cable"
                      fill
                      className="object-contain"
                    />
                  </div>
                  <div className="mt-2 text-center text-[#383838] text-sm">
                    {config.length ? `${config.length} ft` : "—"}
                  </div>
                </div>

                {/* Connector 2 */}
                <div className="flex flex-col items-center">
                  {config.connector2 ? (
                    <>
                      <div className="w-24 h-24 lg:w-32 lg:h-32 relative">
                        <Image
                          src={getConnectorImage(config.connector2)}
                          alt={connectorsMap.get(config.connector2)?.name || "Connector B"}
                          fill
                          className="object-contain scale-x-[-1]"
                        />
                      </div>
                      <p className="mt-2 text-[#383838] text-sm text-center max-w-[100px]">
                        {connectorsMap.get(config.connector2)?.name || "Connector B"}
                      </p>
                    </>
                  ) : (
                    <div className="w-24 h-24 lg:w-32 lg:h-32 flex items-center justify-center border-2 border-dashed border-gray-3 rounded-lg">
                      <span className="text-gray-4 text-xs text-center">Select Connector B</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Configuration Summary */}
              <div className="pt-6 border-t border-gray-3">
                <h4 className="text-[#2958A4] text-[18px] mb-4">
                  Configuration Summary
                </h4>
                <div className="space-y-2 text-[#383838] text-[14px]">
                  <div className="flex justify-between">
                    <span>Cable Series:</span>
                    <span>{cableSeriesMap.get(config.cableSeries)?.name || "Not selected"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Cable Type:</span>
                    <span>{cableTypesMap.get(config.cableType)?.name || "Not selected"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Connector A:</span>
                    <span>
                      {config.connector1 
                        ? connectorsMap.get(config.connector1)?.name || "Not selected"
                        : "Not selected"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Connector B:</span>
                    <span>
                      {config.connector2 
                        ? connectorsMap.get(config.connector2)?.name || "Not selected"
                        : "Not selected"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Length:</span>
                    <span>{config.length ? `${config.length} ft` : "Not selected"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Quantity:</span>
                    <span>{config.quantity}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

     

      {/* Request for Quote Section */}
      <WorkWithUs />

      {/* Newsletter Section */}
      <Newsletter />
    </>
  );
}

