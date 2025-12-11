"use client";

import { useEffect, useState } from "react";
import { useElements, useStripe } from "@stripe/react-stripe-js";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { CheckoutInput, useCheckoutForm } from "./form";
import Billing from "./Billing";
import Shipping from "./Shipping";
import Notes from "./Notes";
import Orders from "./Orders";
import Coupon from "./Coupon";
import ShippingMethod from "./ShippingMethod";
import PaymentMethod from "./PaymentMethod";
import convertToSubcurrency from "@lib/convertToSubcurrency";
import { HttpTypes } from "@medusajs/types";

type CheckoutPaymentAreaProps = {
  amount: number;
  cart: HttpTypes.StoreCart | null;
};

const CheckoutPaymentArea = ({ amount, cart }: CheckoutPaymentAreaProps) => {
  const { handleSubmit } = useCheckoutForm();
  // These hooks return null if not inside Elements wrapper
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string>();
  const [clientSecret, setClientSecret] = useState("");
  const [loading, setLoading] = useState(false);
  const [showLoading, setShowLoading] = useState(true);

  // Create a PaymentIntent as soon as the page loads (only if Stripe is configured and available)
  useEffect(() => {
    // Only try to create payment intent if Stripe is configured and available
    if (!stripe || !elements) {
      // Stripe not available - user can still use COD, don't try to create payment intent
      return;
    }

    if (amount <= 0) {
      console.error("Invalid amount for payment intent:", amount);
      setErrorMessage(`Invalid amount: $${amount.toFixed(2)}. Please check your cart.`);
      return;
    }

    // Reset error message when retrying
    setErrorMessage("");

    fetch("/api/create-payment-intent", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ amount: convertToSubcurrency(amount) }),
    })
      .then((res) => {
        if (!res.ok) {
          return res.json().then((err) => {
            const errorMsg = err.error || "Failed to create payment intent";
            console.error("Payment intent API error:", errorMsg, err);
            // Don't show error if Stripe is not configured - user can use COD
            if (errorMsg.includes("not configured") || errorMsg.includes("STRIPE_SECRET_KEY")) {
              return;
            }
            throw new Error(errorMsg);
          });
        }
        return res.json();
      })
      .then((data) => {
        if (data?.error) {
          console.error("Payment intent error:", data.error);
          // Don't show error if Stripe is not configured - user can use COD
          if (!data.error.includes("not configured") && !data.error.includes("STRIPE_SECRET_KEY")) {
            setErrorMessage(data.error);
          }
        } else if (data?.clientSecret) {
          setClientSecret(data.clientSecret);
          setErrorMessage("");
        }
        // If no client secret and no error, that's OK - user can use COD
      })
      .catch((error) => {
        console.error("Error creating payment intent:", error);
        // Don't show error if Stripe is not configured - user can use COD
        if (error.message && !error.message.includes("not configured") && !error.message.includes("STRIPE_SECRET_KEY")) {
          const errorMessage = error.message || "Failed to initialize payment. Please refresh the page.";
          setErrorMessage(errorMessage);
        }
      });
  }, [amount, stripe, elements]);

  // Handle checkout
  const handleCheckout = async (data: CheckoutInput) => {
    setLoading(true);
    setErrorMessage("");

    if (data.paymentMethod === "cod") {
      try {
        // Create order in Medusa via API
        const response = await fetch("/api/checkout/complete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: data.billing.email,
            shipping_address: {
              firstName: data.billing.firstName,
              lastName: data.billing.lastName,
              street: data.billing.address.street,
              apartment: data.billing.address.apartment,
              town: data.billing.town,
                country: data.billing.regionName || data.billing.country, // Use regionName (ISO code) first
                country_code: data.billing.regionName || data.billing.country, // Also send as country_code
                regionName: data.billing.regionName, // Keep regionName for country code
                postalCode: data.billing.postalCode || "00000", // Use actual postal code
              phone: data.billing.phone,
            },
            billing_address: data.shipToDifferentAddress ? {
              firstName: data.shipping.address?.street ? data.billing.firstName : data.billing.firstName,
              lastName: data.shipping.address?.street ? data.billing.lastName : data.billing.lastName,
              street: data.shipping.address?.street || data.billing.address.street,
              apartment: data.shipping.address?.apartment || data.billing.address.apartment,
              town: data.shipping.town || data.billing.town,
              country: data.shipping.country || data.billing.country,
              postalCode: data.shipping.town || data.billing.regionName,
              phone: data.shipping.phone || data.billing.phone,
            } : undefined,
            payment_method: "cod",
            same_as_billing: !data.shipToDifferentAddress,
          }),
        });

        // Check if response is JSON
        let result;
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          result = await response.json();
        } else {
          // If not JSON, read as text to see what we got
          const text = await response.text();
          console.error("Non-JSON response from server:", text.substring(0, 200));
          throw new Error("Server returned an invalid response. Please try again.");
        }

        if (!result.success) {
          throw new Error(result.message || "Failed to create order");
        }

        toast.success("Order placed successfully!");
        router.push(`/order-confirmed?orderId=${result.order?.id || ""}`);
      } catch (error: any) {
        console.error("Error creating order:", error);
        let errorMessage = "Failed to create order. Please try again.";
        
        if (error.message) {
          errorMessage = error.message;
        } else if (error instanceof SyntaxError) {
          errorMessage = "Server error: Invalid response. Please check server logs and try again.";
        }
        
        setErrorMessage(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
      return;
    }

    if (!stripe || !elements) {
      setErrorMessage("Payment system not ready. Please refresh the page.");
      setLoading(false);
      return;
    }

    if (!clientSecret) {
      setErrorMessage("Payment not initialized. Please refresh the page.");
      setLoading(false);
      return;
    }

    // Continue with Stripe Payment if NOT COD
    const { error: submitError } = await elements.submit();
    if (submitError) {
      setErrorMessage(submitError.message);
      setLoading(false);
      return;
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:8000";
    try {
      const { paymentIntent, error } = await stripe.confirmPayment({
        elements,
        clientSecret,
        confirmParams: {
          return_url: `${siteUrl}/order-confirmed?amount=${amount}`,
        },
        redirect: "if_required",
      });

      if (error) {
        console.log(error, "error in payment");
        setErrorMessage(error.message);
        setLoading(false);
        return;
      }

      if (paymentIntent?.status === "succeeded") {
        try {
          // Create order in Medusa after successful payment
          const response = await fetch("/api/checkout/complete", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: data.billing.email,
              shipping_address: {
                firstName: data.billing.firstName,
                lastName: data.billing.lastName,
                street: data.billing.address.street,
                apartment: data.billing.address.apartment,
                town: data.billing.town,
                country: data.billing.country,
                postalCode: data.billing.regionName,
                phone: data.billing.phone,
              },
              billing_address: data.shipToDifferentAddress ? {
                firstName: data.shipping.address?.street ? data.billing.firstName : data.billing.firstName,
                lastName: data.shipping.address?.street ? data.billing.lastName : data.billing.lastName,
                street: data.shipping.address?.street || data.billing.address.street,
                apartment: data.shipping.address?.apartment || data.billing.address.apartment,
                town: data.shipping.town || data.billing.town,
                country: data.shipping.country || data.billing.regionName || data.billing.country,
                country_code: data.shipping.country || data.billing.regionName || data.billing.country,
                regionName: data.shipping.country || data.billing.regionName,
                postalCode: data.shipping.postalCode || data.billing.postalCode || "00000",
                phone: data.shipping.phone || data.billing.phone,
              } : undefined,
              payment_method: "stripe",
              same_as_billing: !data.shipToDifferentAddress,
            }),
          });

          const result = await response.json();

          if (!result.success) {
            throw new Error(result.message || "Failed to create order");
          }

          toast.success("Payment successful! Order placed.");
          router.push(`/order-confirmed?orderId=${result.order?.id || ""}&amount=${amount}`);
        } catch (error: any) {
          console.error("Error creating order after payment:", error);
          toast.error("Payment succeeded but order creation failed. Please contact support.");
          setErrorMessage("Payment succeeded but order creation failed. Please contact support.");
        }
      }
    } catch (err) {
      console.log(err, "err in payment");
      setErrorMessage("Order processing failed. Please try again.");
    }

    setLoading(false);
  };

  // Always show form immediately - don't wait for payment intent
  useEffect(() => {
    // Stop loading immediately - show form right away
    setShowLoading(false);
  }, []);
  
  // If there's a real error (not just Stripe not configured), show it
  if (errorMessage && !errorMessage.includes("not configured") && !errorMessage.includes("STRIPE_SECRET_KEY")) {
    // Show error if payment intent creation failed (only show if it's a real error)
    return (
      <div className="mt-48 text-center">
        <div className="flex items-center justify-center h-80">
          <div className="relative flex flex-col items-center">
            <p className="mt-4 text-lg font-semibold text-red mb-4">
              {errorMessage}
            </p>
            <p className="text-sm text-gray-600">
              Please refresh the page or contact support if the issue persists.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <section className="overflow-hidden py-20 bg-gray-2">
        <div className="max-w-7xl w-full mx-auto px-4 sm:px-8 xl:px-0 lg:columns-2 gap-7.5 xl:gap-8">
          <form onSubmit={handleSubmit(handleCheckout)}>
            <Billing />
            <Shipping />
            <Notes />
            
            <Orders cart={cart} />

            <Coupon />

            <ShippingMethod />

            <PaymentMethod amount={amount} isStripeAvailable={true} />

            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center rounded-full border border-transparent bg-[#2958A4] text-white text-sm font-medium px-6 py-3 transition-colors hover:border-[#2958A4] hover:bg-white hover:text-[#2958A4] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-transparent disabled:hover:bg-[#2958A4] disabled:hover:text-white mt-7.5"
            >
              {!loading ? `Pay $${amount.toFixed(2)}` : "Processing..."}
            </button>
            {errorMessage && (
              <p className="mt-2 text-center text-red">{errorMessage}</p>
            )}
          </form>
        </div>
      </section>
  );
};

export default CheckoutPaymentArea;

