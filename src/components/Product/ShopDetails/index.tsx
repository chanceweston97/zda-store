"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { HttpTypes } from "@medusajs/types";
import toast from "react-hot-toast";
import LocalizedClientLink from "@modules/common/components/localized-client-link";
import Description from "./Description";
import Newsletter from "@components/Common/Newsletter";
import FaqSection from "@components/Home/Faq";
import { useCartSidebar } from "@components/Common/CartSidebar/CartSidebarProvider";
import ImagePreviewModal from "./ImagePreviewModal";

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
  product: HttpTypes.StoreProduct;
  region: HttpTypes.StoreRegion;
  images: HttpTypes.StoreProductImage[];
};

const ShopDetails = ({ product, region, images }: ShopDetailsProps) => {
  const router = useRouter();
  const { openCart } = useCartSidebar();
  const [previewImg, setPreviewImg] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  // Get product metadata
  const metadata = product.metadata || {};
  const productType = metadata.productType as "antenna" | "cable" | "connector" | undefined;
  // Handle tags - check both product.tags (array) and metadata.tags
  const tags = useMemo(() => {
    // First check product.tags (Medusa's native tags field)
    if (product.tags && Array.isArray(product.tags) && product.tags.length > 0) {
      return product.tags.map(tag => tag.value || tag);
    }
    // Fallback to metadata.tags
    const tagsData = metadata.tags;
    if (!tagsData) return undefined;
    if (Array.isArray(tagsData)) return tagsData;
    if (typeof tagsData === 'string') {
      // If it's a comma-separated string, split it
      return tagsData.includes(',') ? tagsData.split(',').map(t => t.trim()) : [tagsData];
    }
    return undefined;
  }, [product.tags, metadata.tags]);
  // Features and Applications are now plain text, not arrays
  const features = typeof metadata.features === 'string' ? metadata.features : (Array.isArray(metadata.features) ? metadata.features.join('\n') : undefined);
  const applications = typeof metadata.applications === 'string' ? metadata.applications : (Array.isArray(metadata.applications) ? metadata.applications.join('\n') : undefined);
  const featureTitle = metadata.featureTitle as string | undefined;
  // Get subtitle from metadata - check multiple possible field names
  const subtitle = useMemo(() => {
    // Try metadata fields first
    if (metadata.subtitle && typeof metadata.subtitle === 'string') return metadata.subtitle;
    if (metadata.shortDescription && typeof metadata.shortDescription === 'string') return metadata.shortDescription;
    // Try product fields
    if (product.subtitle && typeof product.subtitle === 'string') return product.subtitle;
    // Try extracting first line from description if it exists
    if (product.description && typeof product.description === 'string') {
      const firstLine = product.description.split('\n')[0].trim();
      if (firstLine && firstLine.length > 0) return firstLine;
    }
    return undefined;
  }, [metadata.subtitle, metadata.shortDescription, product.subtitle, product.description]);
  const datasheetImage = metadata.datasheetImage as string | undefined;
  const datasheetPdf = metadata.datasheetPdf as string | undefined;
  const specifications = metadata.specifications as string | undefined;

  // Get product variants
  const variants = product.variants || [];

  // For antennas: gain options from variants
  const gainOptions = useMemo(() => {
    if (productType === "antenna" && variants.length > 0) {
      return variants.map((variant) => ({
        id: variant.id,
        title: variant.title || "",
        price: variant.calculated_price?.calculated_amount || 0,
      }));
    }
    return [];
  }, [productType, variants]);

  // For cables: length options from variants
  const lengthOptions = useMemo(() => {
    if (productType === "cable" && variants.length > 0) {
      return variants.map((variant) => ({
        id: variant.id,
        title: variant.title || "",
        price: variant.calculated_price?.calculated_amount || 0,
      }));
    }
    return [];
  }, [productType, variants]);

  // For connectors: variant options from variants
  const connectorOptions = useMemo(() => {
    if (productType === "connector" && variants.length > 0) {
      return variants.map((variant) => ({
        id: variant.id,
        title: variant.title || "",
        price: variant.calculated_price?.calculated_amount || 0,
      }));
    }
    return [];
  }, [productType, variants]);

  // Auto-select first variant
  useEffect(() => {
    if (variants.length > 0 && !selectedVariantId) {
      setSelectedVariantId(variants[0].id);
    }
  }, [variants, selectedVariantId]);

  // Get selected variant
  const selectedVariant = useMemo(() => {
    if (!selectedVariantId) return variants[0] || null;
    return variants.find((v) => v.id === selectedVariantId) || variants[0] || null;
  }, [variants, selectedVariantId]);

  // Calculate price - use original calculated_amount without division
  const dynamicPrice = useMemo(() => {
    if (selectedVariant?.calculated_price?.calculated_amount) {
      return selectedVariant.calculated_price.calculated_amount;
    }
    // Fallback to product price
    if (product.variants?.[0]?.calculated_price?.calculated_amount) {
      return product.variants[0].calculated_price.calculated_amount;
    }
    return 0;
  }, [selectedVariant, product.variants]);

  // Calculate total price
  const totalPrice = useMemo(() => {
    return dynamicPrice * quantity;
  }, [dynamicPrice, quantity]);

  // Get main image
  const mainImageUrl = useMemo(() => {
    if (images && images.length > 0) {
      const selectedImage = images[previewImg] || images[0];
      return selectedImage?.url || null;
    }
    return null;
  }, [images, previewImg]);

  // Get thumbnail images
  const thumbnailImages = useMemo(() => {
    return images || [];
  }, [images]);

  // Handle add to cart
  const handleAddToCart = async () => {
    if (!selectedVariant) {
      toast.error("Please select a variant");
      return;
    }

    if (!region || !region.id) {
      toast.error("Unable to determine region. Please refresh the page.");
      return;
    }

    setIsAddingToCart(true);

    try {
      const countryCode = region.countries?.[0]?.iso_2?.toLowerCase() || "us";

      const response = await fetch("/api/cart/add-item", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          variantId: selectedVariant.id,
          quantity: quantity,
          countryCode: countryCode,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Failed to add item to cart (${response.status})`);
      }

      toast.success("Product added to cart!");

      // Trigger cart update event for header cart count
      window.dispatchEvent(new Event("cart-updated"));

      // Open cart sidebar - this will automatically load the updated cart
      openCart();
    } catch (error: any) {
      console.error("Error adding to cart:", error);
      const errorMessage = error?.message || "Failed to add product to cart. Please try again.";
      toast.error(errorMessage);
    } finally {
      setIsAddingToCart(false);
    }
  };

  // Get SKU
  const sku = selectedVariant?.sku || product.metadata?.sku as string | undefined;

  return (
    <>
      <section className="relative pt-10 pb-10 overflow-hidden lg:pt-[159px] xl:pt-[159px]">
        <div className="w-full px-4 mx-auto max-w-[1340px] sm:px-6 xl:px-0">
          <div className="flex flex-col lg:flex-row gap-7.5 xl:gap-16">
            {/* LEFT: GALLERY */}
            <div className="w-full lg:w-1/2">
              <div className="lg:min-h-[512px] rounded-lg shadow-sm bg-gray-100 p-4 sm:p-7.5 relative flex items-center justify-center">
                <div>
                  <button
                    onClick={() => {
                      if (thumbnailImages.length > 0) {
                        setIsImageModalOpen(true);
                      }
                    }}
                    aria-label="button for zoom"
                    className="gallery__Image w-11 h-11 rounded-full bg-white shadow-sm flex items-center justify-center ease-out duration-200 text-gray-800 hover:text-[#2958A4] absolute top-4 lg:top-6 right-4 lg:right-6 z-50"
                  >
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
                      />
                    </svg>
                  </button>

                  {mainImageUrl && (
                    <Image
                      src={mainImageUrl}
                      alt={product.title || "Product"}
                      width={400}
                      height={400}
                    />
                  )}
                </div>
              </div>

              {/* Thumbnails */}
              {thumbnailImages.length > 1 && (
                <div className="flex flex-wrap sm:flex-nowrap gap-3 mt-6">
                  {thumbnailImages.map((image, key) => {
                    if (!image?.url) return null;

                    return (
                      <button
                        onClick={() => setPreviewImg(key)}
                        key={key}
                        className={`flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 overflow-hidden rounded-lg bg-gray-100 shadow-sm ease-out duration-200 border-[1px] hover:border-[#2958A4] ${key === previewImg ? "border-[#2958A4]" : "border-transparent"
                          }`}
                      >
                        <Image
                          width={64}
                          height={64}
                          src={image.url}
                          alt="thumbnail"
                          className="w-full h-full object-cover"
                        />
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* RIGHT: PRODUCT CONTENT */}
            <div className="w-full lg:w-1/2">
              {/* SKU Display */}
              {sku && (
                <div className="mb-3">
                  <span className="text-[#383838] text-[16px] font-medium">
                    <span className="bg-[#2958A4] text-white px-[30px] py-[10px] rounded-full font-normal">{sku}</span>
                  </span>
                </div>
              )}

              {/* Tags */}
              {tags && Array.isArray(tags) && tags.length > 0 && (
                <ul className="flex flex-wrap items-center gap-2 mb-3">
                  {tags.map((tag, index) => {
                    const tagText = typeof tag === 'string' ? tag : String(tag);
                    if (!tagText || tagText.trim() === '') return null;
                    return (
                      <li key={index} className="flex items-center gap-2 p-2">
                        <span className="text-black text-[20px] font-normal">•</span>
                        <span className="text-black text-[20px] font-normal">{tagText}</span>
                      </li>
                    );
                  })}
                </ul>
              )}

              {/* Product Title */}
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-[#2958A4] text-[48px] font-medium leading-[58px] tracking-[-1.92px]">
                  {product.title}
                </h2>
              </div>

              {/* Price */}
              <h3 className="font-medium text-custom-1 mb-4">
                <span className="text-black text-[36px] font-medium leading-9 tracking-[-1.08px] uppercase">
                  ${totalPrice.toFixed(2)}
                </span>
              </h3>


              <form onSubmit={(e) => e.preventDefault()}>
                <div className="flex flex-col gap-4.5 mt-3 py-2">
                  {/* Subtitle */}
                  {subtitle && (
                    <p className="text-black text-[24px] font-medium leading-[26px] mb-4">
                      {subtitle}
                    </p>
                  )}

                  {/* Feature Title */}
                  {featureTitle && (
                    <span className="text-black font-satoshi text-[24px] font-bold leading-[26px]">{featureTitle}</span>
                  )}

                  {/* Features - Plain text */}
                  {features && features.trim() && (
                    <div className="mt-2">
                      <p className="text-black text-[16px] font-medium leading-[26px] whitespace-pre-line">
                        {features}
                      </p>
                    </div>
                  )}

                  {/* Applications - Plain text */}
                  {applications && applications.trim() && (
                    <div className="mt-2">
                      <p className="text-black text-[16px] font-medium leading-[26px] whitespace-pre-line">
                        {applications}
                      </p>
                    </div>
                  )}

                  <div className="mt-2 w-full space-y-4">
                    {/* Gain Options (Antenna products only) */}
                    {productType === "antenna" && gainOptions.length > 0 && (
                      <div className="space-y-2">
                        <label className="text-black text-[20px] font-medium leading-[30px]">
                          Gains
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {gainOptions.map((option, index) => {
                            const isSelected = selectedVariantId === option.id;
                            return (
                              <button
                                key={option.id}
                                type="button"
                                onClick={() => setSelectedVariantId(option.id)}
                                className={`rounded border flex items-center justify-center text-center text-[16px] leading-[26px] font-medium transition-all duration-200 whitespace-nowrap px-4 py-2 w-20 ${isSelected
                                    ? "border-[#2958A4] bg-[#2958A4] text-white"
                                    : "border-[#2958A4] bg-white text-gray-800"
                                  }`}
                              >
                                {option.title} dBi
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Length Options (Cable products only) */}
                    {productType === "cable" && lengthOptions.length > 0 && (
                      <div className="space-y-2 mb-4">
                        <label className="text-black text-[20px] font-medium leading-[30px]">
                          Length:
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {lengthOptions.map((option) => {
                            const isSelected = selectedVariantId === option.id;
                            return (
                              <button
                                key={option.id}
                                type="button"
                                onClick={() => setSelectedVariantId(option.id)}
                                className={`rounded border flex items-center justify-center text-center text-[16px] leading-[26px] font-medium transition-all duration-200 whitespace-nowrap px-4 py-2 ${isSelected
                                    ? "border-[#2958A4] bg-[#2958A4] text-white"
                                    : "border-[#2958A4] bg-white text-gray-800"
                                  }`}
                              >
                                {option.title}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Variant Options (Connector products only) */}
                    {productType === "connector" && connectorOptions.length > 0 && (
                      <div className="flex flex-col gap-2 mb-4">
                        <label className="text-black text-[20px] font-medium leading-[30px]">
                          Cable Type:
                        </label>
                        <div className="relative w-fit">
                          <select
                            value={selectedVariantId || ""}
                            onChange={(e) => setSelectedVariantId(e.target.value)}
                            className="w-fit min-w-[200px] rounded-lg border border-[#2958A4] bg-white text-[16px] font-medium text-gray-800 pl-4 pr-10 py-3 appearance-none transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#2958A4] focus:border-[#2958A4]"
                            style={{
                              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%232958A4' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                              backgroundRepeat: 'no-repeat',
                              backgroundPosition: 'right 12px center',
                              paddingRight: '2.5rem'
                            }}
                          >
                            {connectorOptions.map((option) => (
                              <option key={option.id} value={option.id}>
                                {option.title}
                              </option>
                            ))}
                          </select>
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
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                          </svg>
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
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Buttons */}
                  <div className="pt-2 space-y-3 mt-4">
                    <button
                      type="button"
                      onClick={handleAddToCart}
                      disabled={isAddingToCart || !selectedVariant}
                      className={`w-full inline-flex items-center justify-center rounded-full border border-transparent bg-[#2958A4] text-white text-sm font-medium px-6 py-3 transition-colors hover:border-[#2958A4] hover:bg-white hover:text-[#2958A4] ${isAddingToCart || !selectedVariant
                          ? "opacity-70 cursor-not-allowed disabled:hover:border-transparent disabled:hover:bg-[#2958A4] disabled:hover:text-white"
                          : ""
                        }`}
                    >
                      {isAddingToCart ? "Adding..." : "Add to Cart"}
                    </button>

                    <LocalizedClientLink
                      href="/request-a-quote"
                      className="w-full inline-flex items-center justify-center rounded-full border border-transparent bg-[#2958A4] text-white text-sm font-medium px-6 py-3 transition-colors hover:border-[#2958A4] hover:bg-white hover:text-[#2958A4]"
                    >
                      Request a Quote
                    </LocalizedClientLink>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Hero Section */}
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

      {/* Description Section - Hide for connector products */}
      {productType !== "connector" && (
        <Description
          product={product}
          metadata={{
            description: product.description,
            specifications,
            datasheetImage,
            datasheetPdf,
            features,
            applications,
          }}
        />
      )}

      {/* FAQ Section */}
      <FaqSection />

      {/* Newsletter */}
      <Newsletter />

      {/* Image Preview Modal */}
      <ImagePreviewModal
        isOpen={isImageModalOpen}
        onClose={() => setIsImageModalOpen(false)}
        images={thumbnailImages}
        initialIndex={previewImg}
      />
    </>
  );
};

export default ShopDetails;

