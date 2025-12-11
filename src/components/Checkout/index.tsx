"use client";

import { useEffect, useState } from "react";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { useForm } from "react-hook-form";
import { HttpTypes } from "@medusajs/types";
import { CheckoutFormProvider, CheckoutInput } from "./form";
import CheckoutPaymentArea from "./CheckoutPaymentArea";
import CheckoutPaymentAreaWithoutStripe from "./CheckoutPaymentAreaWithoutStripe";
import convertToSubcurrency from "@lib/convertToSubcurrency";
import LocalizedClientLink from "@modules/common/components/localized-client-link";

// Initialize Stripe - only if key is actually set and valid
let stripePromise: ReturnType<typeof loadStripe> | null = null;

if (typeof window !== 'undefined') {
  try {
    const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    if (key && key.trim() !== '') {
      // Validate that it's a publishable key (starts with pk_), not a secret key (sk_)
      const trimmedKey = key.trim();
      if (trimmedKey.startsWith('sk_')) {
        console.error("❌ ERROR: You are using a Stripe SECRET key in the frontend!");
        console.error("   Secret keys (sk_...) should NEVER be used in the browser.");
        console.error("   Please use a PUBLISHABLE key (pk_...) in NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY");
        stripePromise = null;
      } else if (trimmedKey.startsWith('pk_')) {
        // Valid publishable key
        stripePromise = loadStripe(trimmedKey);
      } else {
        console.error("❌ ERROR: Invalid Stripe key format!");
        console.error("   Stripe publishable keys must start with 'pk_'");
        console.error("   Your key starts with:", trimmedKey.substring(0, 3));
        stripePromise = null;
      }
    }
  } catch (error) {
    console.error("Error initializing Stripe:", error);
    stripePromise = null;
  }
}

export default function Checkout() {
  const [cart, setCart] = useState<HttpTypes.StoreCart | null>(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const { register, formState, watch, control, handleSubmit, setValue } =
    useForm<CheckoutInput>({
      defaultValues: {
        shippingMethod: {
          name: "free",
          price: 0,
        },
        paymentMethod: "bank", // Default to Stripe (bank) like Sanity project
        couponDiscount: 0,
        couponCode: "",
        billing: {
          address: {
            street: "",
            apartment: "",
          },
          companyName: "",
          country: "",
          email: "",
          firstName: "",
          lastName: "",
          phone: "",
          regionName: "",
          town: "",
          createAccount: false,
        },
        shipping: {
          address: {
            street: "",
            apartment: "",
          },
          country: "",
          email: "",
          phone: "",
          town: "",
          countryName: "",
        },
        notes: "",
        shipToDifferentAddress: false,
      },
    });

  const loadCart = async () => {
    try {
      const response = await fetch("/api/cart", {
        method: "GET",
        cache: "no-store",
      });
      if (response.ok) {
        const data = await response.json();
        setCart(data.cart || null);
      } else {
        setCart(null);
      }
    } catch (error) {
      console.error("Error loading cart:", error);
      setCart(null);
    } finally {
      // Always stop loading, even if there's an error
      setIsInitialLoad(false);
    }
  };

  useEffect(() => {
    // Load cart immediately on mount
    loadCart();

    const handleCartUpdated = () => {
      loadCart();
    };
    window.addEventListener("cart-updated", handleCartUpdated);

    return () => {
      window.removeEventListener("cart-updated", handleCartUpdated);
    };
  }, []);

  // Safety timeout - stop loading after 2 seconds max
  useEffect(() => {
    const timeout = setTimeout(() => {
      setIsInitialLoad(false);
    }, 2000);

    return () => clearTimeout(timeout);
  }, []);

  // Show loading while fetching cart initially (with timeout safety)
  if (isInitialLoad) {
    return (
      <div className="py-20 mt-40">
        <div className="flex items-center justify-center mb-5">
          <div className="w-16 h-16 border-4 border-[#2958A4] border-t-transparent rounded-full animate-spin"></div>
        </div>
        <p className="text-center text-gray-600">Loading checkout...</p>
      </div>
    );
  }

  const cartCount = cart?.items?.reduce((acc, item) => acc + item.quantity, 0) || 0;
  const subtotal = cart?.subtotal || 0;
  const shippingFee = watch("shippingMethod");
  const couponDiscount = watch("couponDiscount") || 0;
  const discountAmount = (subtotal * couponDiscount) / 100;
  const amount = Math.max(0, subtotal + (shippingFee?.price || 0) - discountAmount);

  if (cartCount === 0) {
    return (
      <div className="py-20 mt-40">
        <div className="flex items-center justify-center mb-5">
          <svg
            className="mx-auto text-[#2958A4]"
            width="100"
            height="100"
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="50" cy="50" r="50" fill="#F3F4F6" />
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M36.1693 36.2421C35.6126 36.0565 35.0109 36.3574 34.8253 36.9141C34.6398 37.4707 34.9406 38.0725 35.4973 38.258L35.8726 38.3831C36.8308 38.7025 37.4644 38.9154 37.9311 39.1325C38.373 39.3381 38.5641 39.5036 38.6865 39.6734C38.809 39.8433 38.9055 40.0769 38.9608 40.5612C39.0192 41.0726 39.0208 41.7409 39.0208 42.751L39.0208 46.5361C39.0208 48.4735 39.0207 50.0352 39.1859 51.2634C39.3573 52.5385 39.7241 53.6122 40.5768 54.4649C41.4295 55.3176 42.5032 55.6844 43.7783 55.8558C45.0065 56.0209 46.5681 56.0209 48.5055 56.0209H59.9166C60.5034 56.0209 60.9791 55.5452 60.9791 54.9584C60.9791 54.3716 60.5034 53.8959 59.9166 53.8959H48.5833C46.5498 53.8959 45.1315 53.8936 44.0615 53.7498C43.022 53.61 42.4715 53.3544 42.0794 52.9623C41.9424 52.8253 41.8221 52.669 41.7175 52.4792H55.7495C56.3846 52.4792 56.9433 52.4793 57.4072 52.4292C57.9093 52.375 58.3957 52.2546 58.8534 51.9528C59.3111 51.651 59.6135 51.2513 59.8611 50.8111C60.0898 50.4045 60.3099 49.891 60.56 49.3072L61.2214 47.7641C61.766 46.4933 62.2217 45.4302 62.4498 44.5655C62.6878 43.6634 62.7497 42.7216 62.1884 41.8704C61.627 41.0191 60.737 40.705 59.8141 40.5684C58.9295 40.4374 57.7729 40.4375 56.3903 40.4375L41.0845 40.4375C41.0806 40.3979 41.0765 40.3588 41.0721 40.3201C40.9937 39.6333 40.8228 39.0031 40.4104 38.4309C39.998 37.8588 39.4542 37.4974 38.8274 37.2058C38.2377 36.9315 37.4879 36.6816 36.6005 36.3858L36.1693 36.2421ZM41.1458 42.5625C41.1458 42.6054 41.1458 42.6485 41.1458 42.692L41.1458 46.4584C41.1458 48.1187 41.1473 49.3688 41.2262 50.3542H55.6975C56.4 50.3542 56.8429 50.3528 57.1791 50.3165C57.4896 50.2829 57.6091 50.2279 57.6836 50.1787C57.7582 50.1296 57.8559 50.0415 58.009 49.7692C58.1748 49.4745 58.3506 49.068 58.6273 48.4223L59.2344 47.0057C59.8217 45.6355 60.2119 44.7177 60.3951 44.0235C60.5731 43.3488 60.4829 43.1441 60.4143 43.0401C60.3458 42.9362 60.1931 42.7727 59.5029 42.6705C58.7927 42.5653 57.7954 42.5625 56.3047 42.5625H41.1458Z"
              fill="#8D93A5"
            />
          </svg>
        </div>
        <h2 className="pb-5 text-2xl font-medium text-center text-dark">
          No items found in your cart to checkout.
        </h2>
        <div className="flex justify-center">
          <LocalizedClientLink
            href="/store"
            className="inline-flex items-center justify-center rounded-full border border-transparent bg-[#2958A4] text-white text-sm font-medium px-6 py-3 transition-colors hover:border-[#2958A4] hover:bg-white hover:text-[#2958A4]"
          >
            Continue Shopping
          </LocalizedClientLink>
        </div>
      </div>
    );
  }

  // Check if amount is valid
  if (amount <= 0) {
    return (
      <div className="py-20 mt-40">
        <div className="flex items-center justify-center mb-5">
          <svg
            className="mx-auto text-red"
            width="100"
            height="100"
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="50" cy="50" r="50" fill="#F3F4F6" />
          </svg>
        </div>
        <h2 className="pb-5 text-2xl font-medium text-center text-dark">
          Invalid cart total. Please check your cart items.
        </h2>
        <p className="text-center text-gray-600 mb-5">
          Some products may not have prices set. Please remove items without prices or contact support.
        </p>
        <LocalizedClientLink
          href="/store"
          className="w-96 mx-auto inline-flex items-center justify-center rounded-full border border-transparent bg-[#2958A4] text-white text-sm font-medium px-6 py-3 transition-colors hover:border-[#2958A4] hover:bg-white hover:text-[#2958A4]"
        >
          Continue Shopping
        </LocalizedClientLink>
      </div>
    );
  }

  // Check if Stripe is configured
  const hasStripe = !!stripePromise && typeof window !== 'undefined' && !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

  return (
    <CheckoutFormProvider
      value={{
        register,
        watch,
        control,
        setValue,
        errors: formState.errors,
        handleSubmit,
      }}
    >
      {hasStripe && stripePromise ? (
        <Elements
          stripe={stripePromise}
          options={{
            mode: "payment",
            amount: convertToSubcurrency(amount),
            currency: "usd",
          }}
        >
          <CheckoutPaymentArea amount={amount} cart={cart} />
        </Elements>
      ) : (
        <CheckoutPaymentAreaWithoutStripe amount={amount} cart={cart} />
      )}
    </CheckoutFormProvider>
  );
}
