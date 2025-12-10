"use client"

import { HttpTypes } from "@medusajs/types"
import { getProductPrice } from "@lib/util/get-product-price"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Image from "next/image"
import { useState } from "react"
import { addToCart } from "@lib/data/cart"
import toast from "react-hot-toast"

type ProductGridItemProps = {
  product: HttpTypes.StoreProduct
  region?: HttpTypes.StoreRegion
}

export default function ProductGridItem({ product, region }: ProductGridItemProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [isAdding, setIsAdding] = useState(false)

  const { cheapestPrice } = getProductPrice({
    product,
  })

  const productImage = product.thumbnail || product.images?.[0]?.url || null
  const productTitle = product.title || "Product"
  const productHandle = product.handle || product.id

  const handleAddToCart = async () => {
    if (!product.variants || product.variants.length === 0) {
      toast.error("This product is not available")
      return
    }

    setIsAdding(true)
    try {
      const variant = product.variants[0]
      await addToCart({
        variantId: variant.id!,
        quantity: 1,
        countryCode: "us", // Use default US region
      })
      toast.success("Product added to cart!")
    } catch (error: any) {
      toast.error(error.message || "Failed to add product to cart")
    } finally {
      setIsAdding(false)
    }
  }

  return (
    <div className="group w-full">
      {/* Product Image Container - Fixed dimensions like sanity */}
      <div className="relative overflow-hidden flex items-center justify-center rounded-lg bg-white shadow-sm h-[270px] mb-4 w-full">
        <LocalizedClientLink href={`/products/${productHandle}`} className="w-full h-full flex items-center justify-center p-4">
          {productImage ? (
            <Image
              src={productImage}
              alt={productTitle}
              width={250}
              height={250}
              className="object-contain transition-transform duration-300 group-hover:scale-105 w-auto h-auto max-w-full max-h-full"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <svg
                className="w-24 h-24"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
          )}
        </LocalizedClientLink>

        {/* Hover Actions */}
        <div className="absolute left-0 bottom-0 translate-y-full w-full flex items-center justify-center gap-2.5 pb-5 ease-linear duration-200 group-hover:translate-y-0">
          <button
            onClick={handleAddToCart}
            disabled={isAdding}
            className="inline-flex items-center rounded-full border border-transparent bg-[#2958A4] text-white text-sm font-medium px-6 py-3 transition-colors hover:border-[#2958A4] hover:bg-white hover:text-[#2958A4] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isAdding ? "Adding..." : "Add to cart"}
          </button>
        </div>
      </div>

      {/* Product Info */}
      <LocalizedClientLink href={`/products/${productHandle}`}>
        <h3 className="font-medium text-[#2958A4] line-clamp-1 ease-out duration-200 hover:text-[#2958A4]/80 mb-1.5">
          {productTitle}
        </h3>

        {/* Price */}
        <span className="flex items-center gap-2 text-lg font-medium">
          {cheapestPrice ? (
            <span className="text-[#2958A4]">
              {cheapestPrice.calculated_price_number
                ? `$${(cheapestPrice.calculated_price_number / 100).toFixed(2)}`
                : cheapestPrice.calculated_price || "Price unavailable"}
            </span>
          ) : (
            <span className="text-gray-400">Price unavailable</span>
          )}
        </span>
      </LocalizedClientLink>
    </div>
  )
}

