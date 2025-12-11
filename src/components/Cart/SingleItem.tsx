"use client";

import Image from "next/image";
import Link from "next/link";
import { HttpTypes } from "@medusajs/types";
import { useState } from "react";
import toast from "react-hot-toast";
import LocalizedClientLink from "@modules/common/components/localized-client-link";

type SingleItemProps = {
  item: HttpTypes.StoreCartLineItem;
  onUpdate: () => void;
};

const SingleItem = ({ item, onUpdate }: SingleItemProps) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [localQuantity, setLocalQuantity] = useState(item.quantity);

  const handleRemove = async () => {
    setIsUpdating(true);
    try {
      const response = await fetch("/api/cart/remove-item", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lineId: item.id }),
      });

      if (response.ok) {
        onUpdate();
        window.dispatchEvent(new Event("cart-updated"));
        toast.success("Item removed from cart");
      } else {
        const errorData = await response.json().catch(() => ({}));
        toast.error(errorData.error || "Failed to remove item");
      }
    } catch (error: any) {
      toast.error("Failed to remove item. Please try again.");
      console.error("Error removing item:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUpdateQuantity = async (newQuantity: number) => {
    if (newQuantity < 1) return;

    const previousQuantity = localQuantity;
    setLocalQuantity(newQuantity);

    try {
      const response = await fetch("/api/cart/update-item", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lineId: item.id,
          quantity: newQuantity,
        }),
      });

      if (response.ok) {
        onUpdate();
        window.dispatchEvent(new Event("cart-updated"));
      } else {
        setLocalQuantity(previousQuantity);
        const errorData = await response.json().catch(() => ({}));
        toast.error(errorData.error || "Failed to update quantity");
      }
    } catch (error: any) {
      setLocalQuantity(previousQuantity);
      toast.error("Failed to update quantity. Please try again.");
      console.error("Error updating quantity:", error);
    }
  };

  const productImage = item.thumbnail || item.variant?.product?.thumbnail;
  const unitPrice = item.unit_price || 0;
  const totalPrice = unitPrice * localQuantity;

  return (
    <tr className="border-t border-gray-3 hover:bg-gray-1/50 transition-colors duration-200">
      <td className="py-5 px-7.5">
        <div className="flex items-center gap-5.5">
          <div className="flex items-center justify-center rounded-lg bg-gray-2 max-w-[80px] w-full h-17.5 flex-shrink-0">
            {productImage ? (
              <Image
                width={200}
                height={200}
                src={productImage}
                alt={item.title || "Product"}
                className="object-contain max-w-full max-h-full"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <svg
                  className="w-12 h-12"
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
          </div>

          <div className="min-w-0 flex-1">
            <h3 className="duration-200 ease-out text-dark hover:text-[#2958A4] font-medium">
              <LocalizedClientLink
                href={`/products/${item.variant?.product?.handle || item.variant?.product_id}`}
                className="hover:underline"
              >
                {item.title}
              </LocalizedClientLink>
            </h3>
          </div>
        </div>
      </td>

      <td className="py-5 px-4">
        <p className="text-dark font-medium">${unitPrice.toFixed(2)}</p>
      </td>

      <td className="py-5 px-4">
        <div className="flex items-center border rounded-full w-max border-gray-3">
          <button
            onClick={() => handleUpdateQuantity(localQuantity - 1)}
            disabled={localQuantity <= 1 || isUpdating}
            aria-label="Decrease quantity"
            className={`flex items-center justify-center w-11.5 h-11.5 ease-out duration-200 hover:text-[#2958A4] ${
              localQuantity <= 1 ? "opacity-50 pointer-events-none" : ""
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
            </svg>
          </button>

          <span className="flex items-center justify-center w-16 h-11.5 border-x border-gray-4 font-medium">
            {localQuantity}
          </span>

          <button
            onClick={() => handleUpdateQuantity(localQuantity + 1)}
            disabled={isUpdating}
            aria-label="Increase quantity"
            className="flex items-center justify-center w-11.5 h-11.5 ease-out duration-200 hover:text-[#2958A4]"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
      </td>

      <td className="py-5 px-4">
        <p className="text-dark font-semibold">
          ${totalPrice.toFixed(2)}
        </p>
      </td>

      <td className="py-5 px-7.5">
        <div className="flex justify-end">
          <button
            onClick={handleRemove}
            disabled={isUpdating}
            aria-label="Remove product from cart"
            className="flex items-center justify-center rounded-full w-9.5 h-9.5 bg-gray-2 border border-gray-3 text-dark ease-out duration-200 hover:bg-red-50 hover:border-red-300 hover:text-red-600 disabled:opacity-50"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </div>
      </td>
    </tr>
  );
};

export default SingleItem;

