"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { HttpTypes } from "@medusajs/types";
import LocalizedClientLink from "@modules/common/components/localized-client-link";
import toast from "react-hot-toast";

type CartSidebarProps = {
  isOpen: boolean;
  onClose: () => void;
};

const CartSidebar = ({ isOpen, onClose }: CartSidebarProps) => {
  const router = useRouter();
  const [cart, setCart] = useState<HttpTypes.StoreCart | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadCart();
    }
  }, [isOpen]);

  const loadCart = async () => {
    setIsLoading(true);
    try {
      // Use fetch to get cart data from API
      const response = await fetch("/api/cart", {
        method: "GET",
        cache: "no-store",
      });
      if (response.ok) {
        const data = await response.json();
        setCart(data.cart);
      } else {
        setCart(null);
      }
    } catch (error) {
      console.error("Error loading cart:", error);
      setCart(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Close modal when clicking outside
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as HTMLElement;
      if (isOpen && !target.closest(".modal-content")) {
        onClose();
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      // Listen for cart updates
      window.addEventListener("cart-updated", loadCart);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("cart-updated", loadCart);
    };
  }, [isOpen]);

  const handleCheckoutClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onClose();
    router.push("/checkout");
  };

  const totalPrice = cart?.total || 0;
  const cartItems = cart?.items || [];

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed top-0 left-0 z-[9999] overflow-y-auto w-full h-screen bg-black/70 ease-linear duration-300 ${
          isOpen ? "block" : "hidden"
        }`}
        onClick={onClose}
      />

      {/* Sidebar */}
      <div
        className={`${
          isOpen ? "translate-x-0" : "translate-x-full"
        } fixed z-[99999] w-[350px] h-screen sm:w-[500px] sm:max-w-[500px] ease-linear duration-300 shadow-lg bg-white px-4 sm:px-7.5 lg:px-11 top-0 right-0 modal-content flex flex-col`}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white flex items-center justify-between pb-7 pt-4 sm:pt-7.5 lg:pt-11 border-b border-gray-200 mb-7.5">
          <h2 className="font-medium text-gray-900 text-lg sm:text-2xl">
            Cart View
          </h2>
          <button
            onClick={onClose}
            aria-label="button for close modal"
            className="flex items-center justify-center ease-in duration-150 text-gray-500 hover:text-gray-900"
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
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Cart Items */}
        <div className="h-[66vh] overflow-y-auto">
          <div className="flex flex-col gap-6">
            {isLoading ? (
              <div className="text-center py-10">
                <p className="text-gray-500">Loading cart...</p>
              </div>
            ) : cartItems.length > 0 ? (
              cartItems.map((item) => (
                <CartItem key={item.id} item={item} onUpdate={loadCart} onClose={onClose} />
              ))
            ) : (
              <EmptyCart onClose={onClose} />
            )}
          </div>
        </div>

        {/* Footer */}
        {cartItems.length > 0 && (
          <div className="border-t border-gray-200 bg-white pt-5 pb-4 sm:pb-7.5 lg:pb-11 sticky bottom-0 mt-auto">
            <div className="flex items-center justify-between gap-5 mb-6">
              <p className="font-medium text-xl text-gray-900">Subtotal:</p>
              <p className="font-medium text-xl text-gray-900">
                ${(totalPrice / 100).toFixed(2)}
              </p>
            </div>

            <div className="flex items-center gap-4">
              <LocalizedClientLink
                href="/cart"
                onClick={onClose}
                className="w-full inline-flex items-center justify-center rounded-full border border-transparent bg-[#2958A4] text-white text-sm font-medium px-6 py-3 transition-colors hover:border-[#2958A4] hover:bg-white hover:text-[#2958A4]"
              >
                View Cart
              </LocalizedClientLink>

              <button
                onClick={handleCheckoutClick}
                className="w-full inline-flex items-center justify-center rounded-full border border-transparent bg-[#2958A4] text-white text-sm font-medium px-6 py-3 transition-colors hover:border-[#2958A4] hover:bg-white hover:text-[#2958A4]"
              >
                Checkout
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

// Cart Item Component
const CartItem = ({ 
  item, 
  onUpdate, 
  onClose 
}: { 
  item: HttpTypes.StoreLineItem; 
  onUpdate: () => void;
  onClose: () => void;
}) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [localQuantity, setLocalQuantity] = useState(item.quantity);

  // Update local quantity when item changes
  useEffect(() => {
    setLocalQuantity(item.quantity);
  }, [item.quantity]);

  const handleUpdateQuantity = async (newQuantity: number) => {
    if (newQuantity < 1) return;
    
    // Optimistically update local state
    setLocalQuantity(newQuantity);
    setIsUpdating(true);
    
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
        // Reload cart to get updated totals
        onUpdate();
        window.dispatchEvent(new Event("cart-updated"));
      } else {
        // Revert on error
        setLocalQuantity(item.quantity);
        const errorData = await response.json().catch(() => ({}));
        toast.error(errorData.error || "Failed to update quantity");
      }
    } catch (error: any) {
      // Revert on error
      setLocalQuantity(item.quantity);
      toast.error("Failed to update quantity. Please try again.");
      console.error("Error updating quantity:", error);
    } finally {
      setIsUpdating(false);
    }
  };

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
      }
    } catch (error) {
      console.error("Error removing item:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const productImage = item.thumbnail || item.variant?.product?.thumbnail;
  const unitPrice = item.unit_price || 0;
  const totalPrice = unitPrice * localQuantity;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-5">
        <div className="flex items-center w-full gap-6">
          {productImage && (
            <div className="flex items-center justify-center rounded-[10px] bg-gray-100 max-w-[90px] w-full h-[90px]">
              <Image
                src={productImage}
                alt={item.title || "Product"}
                width={90}
                height={90}
                className="object-contain"
              />
            </div>
          )}

          <div className="flex-1 min-w-0">
            <h3 className="mb-1 font-medium duration-200 ease-out text-gray-900 hover:text-[#2958A4]">
              <LocalizedClientLink
                href={`/products/${item.variant?.product?.handle || item.variant?.product_id}`}
                onClick={onClose}
              >
                {item.title}
              </LocalizedClientLink>
            </h3>
            <p className="text-sm text-gray-600">
              Price: ${(unitPrice / 100).toFixed(2)}
            </p>
          </div>
        </div>

        <button
          onClick={handleRemove}
          disabled={isUpdating}
          aria-label="button for remove product from cart"
          className="flex items-center justify-center rounded-full max-w-[38px] w-full h-[38px] bg-gray-100 border border-gray-300 text-gray-700 ease-out duration-200 hover:bg-red-50 hover:border-red-300 hover:text-red-600 shrink-0 disabled:opacity-50"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>

      {/* Quantity Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center divide-x divide-[#2958A4] border border-[#2958A4] rounded-full quantity-controls w-fit">
          <button
            onClick={() => handleUpdateQuantity(localQuantity - 1)}
            disabled={isUpdating || localQuantity <= 1}
            aria-label="Decrease quantity"
            className={`flex items-center justify-center w-10 h-10 text-[#2958A4] ease-out duration-200 hover:text-[#1F4480] disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
            </svg>
          </button>

          <span className="flex items-center justify-center w-16 h-10 font-medium text-[#2958A4]">
            {localQuantity}
          </span>

          <button
            onClick={() => handleUpdateQuantity(localQuantity + 1)}
            disabled={isUpdating}
            aria-label="Increase quantity"
            className="flex items-center justify-center w-10 h-10 text-[#2958A4] ease-out duration-200 hover:text-[#1F4480] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>

        <p className="text-gray-900 font-semibold text-sm">
          Total: ${((unitPrice * localQuantity) / 100).toFixed(2)}
        </p>
      </div>
    </div>
  );
};

// Empty Cart Component
const EmptyCart = ({ onClose }: { onClose: () => void }) => {
  return (
    <div className="text-center py-10">
      <div className="mx-auto pb-7.5">
        <svg
          className="mx-auto w-24 h-24 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
          />
        </svg>
      </div>

      <p className="pb-6 text-gray-600">Your cart is empty!</p>

      <LocalizedClientLink
        href="/store"
        onClick={onClose}
        className="w-full lg:w-10/12 mx-auto inline-flex items-center justify-center rounded-full border border-transparent bg-[#2958A4] text-white text-sm font-medium px-6 py-3 transition-colors hover:border-[#2958A4] hover:bg-white hover:text-[#2958A4]"
      >
        Continue Shopping
      </LocalizedClientLink>
    </div>
  );
};

export default CartSidebar;

