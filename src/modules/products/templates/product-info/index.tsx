"use client"

import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { useState, useMemo } from "react"
import Image from "next/image"

type ProductInfoProps = {
  product: HttpTypes.StoreProduct
}

const ProductInfo = ({ product }: ProductInfoProps) => {
  const metadata = (product.metadata || {}) as Record<string, any>
  const productType = metadata.productType || ""
  
  // Extract metadata fields
  const tags = metadata.tags || []
  const features = metadata.features || []
  const applications = metadata.applications || []
  const datasheetImage = metadata.datasheetImage || ""
  const datasheetPdf = metadata.datasheetPdf || ""
  const specifications = metadata.specifications || ""
  const description = metadata.description || ""
  
  // Get categories
  const categories = product.categories || []
  const categoryNames = categories.map((cat) => cat.name).filter(Boolean)
  
  // Combine tags and categories for display
  const displayTags = [...categoryNames, ...(Array.isArray(tags) ? tags : [])]

  return (
    <div id="product-info" className="flex flex-col gap-y-6">
      {/* SKU */}
      {product.sku && (
        <div className="mb-2">
          <span className="bg-[#2958A4] text-white px-[30px] py-[10px] rounded-full text-[16px] font-normal">
            {product.sku}
          </span>
        </div>
      )}

      {/* Tags/Categories */}
      {displayTags.length > 0 && (
        <ul className="flex flex-wrap items-center gap-2 mb-2">
          {displayTags.map((tag, index) => (
            <li key={index} className="flex items-center gap-2">
              <span className="text-black text-[20px] font-normal">•</span>
              <span className="text-black text-[20px] font-normal">{tag}</span>
            </li>
          ))}
        </ul>
      )}

      {/* Product Title */}
      <h1 className="text-[#2958A4] text-[48px] font-medium leading-[58px] tracking-[-1.92px] mb-3">
        {product.title}
      </h1>

      {/* Short Description */}
      {product.description && (
        <p className="text-[#383838] text-[18px] font-normal leading-7 mb-4">
          {product.description}
        </p>
      )}

      {/* Features (Antenna & Cable) */}
      {features.length > 0 && (
        <div className="mb-4">
          <ul className="flex flex-col gap-2">
            {features.map((feature: string, index: number) => (
              <li key={index} className="flex items-center gap-2">
                <span className="text-black text-[16px] leading-6">•</span>
                <span className="text-black text-[16px] font-medium leading-[26px]">
                  {feature}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Applications (Antenna only) */}
      {productType === "antenna" && applications.length > 0 && (
        <div className="mb-4">
          <ul className="flex flex-col gap-2">
            {applications.map((application: string, index: number) => (
              <li key={index} className="flex items-center gap-2">
                <span className="text-black text-[16px] leading-6">•</span>
                <span className="text-black text-[16px] font-medium leading-[26px]">
                  {application}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Datasheet Image (Antenna only) */}
      {productType === "antenna" && datasheetImage && (
        <div className="mb-4">
          <div className="relative w-full h-auto rounded-lg overflow-hidden bg-gray-100">
            <Image
              src={datasheetImage}
              alt={`${product.title} datasheet`}
              width={600}
              height={800}
              className="w-full h-auto object-contain"
            />
          </div>
        </div>
      )}

      {/* Download Data Sheet Button (Antenna only) */}
      {productType === "antenna" && datasheetPdf && (
        <div className="mb-4">
          <a
            href={datasheetPdf}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center rounded-full border border-transparent bg-[#2958A4] text-white text-sm font-medium px-6 py-3 transition-colors hover:border-[#2958A4] hover:bg-white hover:text-[#2958A4]"
          >
            Download Data Sheet
          </a>
        </div>
      )}

      {/* Warranty/Shipping/Support Icons */}
      <div className="flex flex-col gap-4 mt-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="w-6 h-6 text-[#2958A4]"
            >
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <span className="text-[#383838] text-[16px] font-medium">
            1 Year Warranty
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="w-6 h-6 text-[#2958A4]"
            >
              <path d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
            </svg>
          </div>
          <span className="text-[#383838] text-[16px] font-medium">
            Orders Shipped Within 24 Business Hours
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="w-6 h-6 text-[#2958A4]"
            >
              <path d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <span className="text-[#383838] text-[16px] font-medium">
            Complete Technical Support
          </span>
        </div>
      </div>
    </div>
  )
}

export default ProductInfo
