"use client"

import { addToCart } from "@lib/data/cart"
import { HttpTypes } from "@medusajs/types"
import { Button } from "@medusajs/ui"
import { useParams } from "next/navigation"
import { useState, useEffect, useMemo } from "react"
import ProductPrice from "../product-price"
import VariantSelector from "./variant-selector"
import QuantitySelector from "./quantity-selector"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import toast from "react-hot-toast"

type EnhancedProductActionsProps = {
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
  disabled?: boolean
}

export default function EnhancedProductActions({
  product,
  region,
  disabled,
}: EnhancedProductActionsProps) {
  const [selectedVariantId, setSelectedVariantId] = useState<string | undefined>()
  const [quantity, setQuantity] = useState(1)
  const [isAdding, setIsAdding] = useState(false)
  const countryCode = useParams().countryCode as string

  const metadata = (product.metadata || {}) as Record<string, any>
  const productType = metadata.productType || ""

  // Get selected variant
  const selectedVariant = useMemo(() => {
    if (!selectedVariantId || !product.variants) return undefined
    return product.variants.find((v) => v.id === selectedVariantId)
  }, [selectedVariantId, product.variants])

  // Auto-select first variant if available
  useEffect(() => {
    if (!selectedVariantId && product.variants && product.variants.length > 0) {
      setSelectedVariantId(product.variants[0].id)
    }
  }, [product.variants, selectedVariantId])

  // Check if variant is in stock
  const inStock = useMemo(() => {
    if (!selectedVariant) return false
    if (!selectedVariant.manage_inventory) return true
    if (selectedVariant.allow_backorder) return true
    return (selectedVariant.inventory_quantity || 0) > 0
  }, [selectedVariant])

  // Handle add to cart
  const handleAddToCart = async () => {
    if (!selectedVariant?.id) {
      toast.error("Please select a variant")
      return
    }

    setIsAdding(true)
    try {
      await addToCart({
        variantId: selectedVariant.id,
        quantity: quantity,
        countryCode,
      })
      toast.success("Product added to cart!")
    } catch (error: any) {
      toast.error(error.message || "Failed to add product to cart")
    } finally {
      setIsAdding(false)
    }
  }

  // Show variant selector for products with multiple variants
  const showVariantSelector = (product.variants?.length || 0) > 1

  return (
    <div className="flex flex-col gap-y-4">
      {/* Price Display */}
      <div className="mb-2">
        <ProductPrice product={product} variant={selectedVariant} />
      </div>

      {/* Variant Selector (Gain for Antenna, Length for Cable) */}
      {showVariantSelector && (
        <VariantSelector
          product={product}
          selectedVariantId={selectedVariantId}
          onVariantChange={setSelectedVariantId}
          disabled={disabled || isAdding}
        />
      )}

      {/* Quantity Selector */}
      <QuantitySelector
        initialQuantity={quantity}
        onQuantityChange={setQuantity}
        disabled={disabled || isAdding}
      />

      {/* Action Buttons */}
      <div className="flex flex-col gap-3 mt-4">
        <Button
          onClick={handleAddToCart}
          disabled={!inStock || !selectedVariant || disabled || isAdding}
          variant="primary"
          className="w-full h-12 text-base font-medium rounded-full border border-transparent bg-[#2958A4] text-white hover:border-[#2958A4] hover:bg-white hover:text-[#2958A4] transition-colors"
          isLoading={isAdding}
        >
          {!selectedVariant
            ? "Select variant"
            : !inStock
            ? "Out of stock"
            : "Add to Cart"}
        </Button>

        <LocalizedClientLink
          href="/request-a-quote"
          className="inline-flex items-center justify-center rounded-full border border-[#2958A4] bg-white text-[#2958A4] text-base font-medium px-6 py-3 h-12 transition-colors hover:bg-[#2958A4] hover:text-white"
        >
          Request a Quote
        </LocalizedClientLink>
      </div>
    </div>
  )
}

