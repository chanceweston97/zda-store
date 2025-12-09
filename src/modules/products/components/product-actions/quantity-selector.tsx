"use client"

import { useState } from "react"

type QuantitySelectorProps = {
  initialQuantity?: number
  onQuantityChange?: (quantity: number) => void
  disabled?: boolean
}

export default function QuantitySelector({
  initialQuantity = 1,
  onQuantityChange,
  disabled,
}: QuantitySelectorProps) {
  const [quantity, setQuantity] = useState(initialQuantity)

  const handleDecrease = () => {
    if (quantity > 1) {
      const newQuantity = quantity - 1
      setQuantity(newQuantity)
      onQuantityChange?.(newQuantity)
    }
  }

  const handleIncrease = () => {
    const newQuantity = quantity + 1
    setQuantity(newQuantity)
    onQuantityChange?.(newQuantity)
  }

  return (
    <div className="space-y-2 mb-4">
      <label className="text-black text-[20px] font-medium leading-[30px]">
        Quantity
      </label>
      <div className="flex items-center divide-x divide-[#2958A4] border border-[#2958A4] rounded-full quantity-controls w-fit">
        <button
          type="button"
          onClick={handleDecrease}
          disabled={disabled || quantity <= 1}
          className="flex items-center justify-center w-10 h-10 text-[#2958A4] ease-out duration-200 hover:text-[#1F4480] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="sr-only">Decrease quantity</span>
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20 12H4"
            />
          </svg>
        </button>

        <span className="flex items-center justify-center w-16 h-10 font-medium text-[#2958A4]">
          {quantity}
        </span>

        <button
          type="button"
          onClick={handleIncrease}
          disabled={disabled}
          className="flex items-center justify-center w-10 h-10 text-[#2958A4] ease-out duration-200 hover:text-[#1F4480] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="sr-only">Increase quantity</span>
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
        </button>
      </div>
    </div>
  )
}

