"use client"

import { HttpTypes } from "@medusajs/types"
import { useState, useEffect } from "react"

type VariantSelectorProps = {
  product: HttpTypes.StoreProduct
  selectedVariantId?: string
  onVariantChange: (variantId: string) => void
  disabled?: boolean
}

// Extract gain/length value from variant title (e.g., "6dBi", "10 ft")
const extractValue = (title: string): string => {
  // Remove common suffixes and extract the value
  const match = title.match(/(\d+(?:\.\d+)?)\s*(dbi|ft|feet)?/i)
  return match ? match[1] : title
}

export default function VariantSelector({
  product,
  selectedVariantId,
  onVariantChange,
  disabled,
}: VariantSelectorProps) {
  const metadata = (product.metadata || {}) as Record<string, any>
  const productType = metadata.productType || ""
  
  const variants = product.variants || []
  const [selectedIndex, setSelectedIndex] = useState<number>(-1)

  // Initialize selected variant
  useEffect(() => {
    if (selectedVariantId) {
      const index = variants.findIndex((v) => v.id === selectedVariantId)
      if (index >= 0) {
        setSelectedIndex(index)
      }
    } else if (variants.length > 0) {
      // Auto-select first variant if none selected
      setSelectedIndex(0)
      onVariantChange(variants[0].id!)
    }
  }, [selectedVariantId, variants, onVariantChange])

  if (variants.length <= 1) {
    return null
  }

  // Determine label based on product type
  const label = productType === "antenna" ? "Gain" : productType === "cable" ? "Length" : "Option"

  const handleVariantSelect = (index: number) => {
    if (disabled) return
    setSelectedIndex(index)
    if (variants[index]?.id) {
      onVariantChange(variants[index].id!)
    }
  }

  return (
    <div className="space-y-2 mb-4">
      <label className="text-black text-[20px] font-medium leading-[30px]">
        {label}
      </label>
      <div className="flex flex-wrap gap-2">
        {variants.map((variant, index) => {
          const isSelected = selectedIndex === index
          const displayValue = variant.title || extractValue(variant.sku || "")
          
          return (
            <button
              key={variant.id}
              type="button"
              onClick={() => handleVariantSelect(index)}
              disabled={disabled}
              className={`rounded border flex items-center justify-center text-center text-[16px] leading-[26px] font-medium transition-all duration-200 whitespace-nowrap px-4 py-2 min-w-[80px] ${
                isSelected
                  ? "border-[#2958A4] bg-[#2958A4] text-white"
                  : "border-[#2958A4] bg-white text-gray-800 hover:bg-gray-50"
              } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
            >
              {displayValue}
            </button>
          )
        })}
      </div>
    </div>
  )
}

