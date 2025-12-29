"use client";

import { useState } from "react";
import { useShoppingCart } from "use-shopping-cart";
import { redirectToWooCommerceCheckout } from "@/lib/woocommerce/utils";
import { isWooCommerceEnabled } from "@/lib/woocommerce/config";
import toast from "react-hot-toast";

export default function WooCommerceCheckoutButton() {
  const { cartDetails } = useShoppingCart();
  const [loading, setLoading] = useState(false);

  if (!isWooCommerceEnabled()) {
    return null;
  }

  const handleWooCommerceCheckout = async () => {
    if (!cartDetails || Object.keys(cartDetails).length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    setLoading(true);

    try {
      // Convert cart items to array
      const cartItems = Object.values(cartDetails);

      // Sync cart to WooCommerce (optional - for session-based carts)
      try {
        await fetch("/api/woocommerce/sync-cart", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cartItems }),
        });
      } catch (error) {
        console.warn("Cart sync failed, continuing with redirect:", error);
        // Continue even if sync fails - redirect will still work
      }

      // Redirect to WooCommerce checkout
      redirectToWooCommerceCheckout(cartItems);
    } catch (error: any) {
      console.error("Error redirecting to WooCommerce checkout:", error);
      toast.error(error.message || "Failed to redirect to checkout");
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleWooCommerceCheckout}
      disabled={loading}
      className="w-full inline-flex items-center justify-center rounded-full border border-transparent bg-[#2958A4] text-white text-sm font-medium px-6 py-3 transition-colors hover:border-[#2958A4] hover:bg-white hover:text-[#2958A4] disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loading ? "Redirecting..." : "Checkout with WooCommerce"}
    </button>
  );
}

