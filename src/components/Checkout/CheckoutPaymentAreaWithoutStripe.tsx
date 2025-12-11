"use client";

import { useState } from "react";
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
import { HttpTypes } from "@medusajs/types";

type CheckoutPaymentAreaWithoutStripeProps = {
  amount: number;
  cart: HttpTypes.StoreCart | null;
};

// Component that doesn't use Stripe hooks - for when Stripe is not configured
const CheckoutPaymentAreaWithoutStripe = ({ amount, cart }: CheckoutPaymentAreaWithoutStripeProps) => {
  const { handleSubmit } = useCheckoutForm();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>();

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
              country: data.shipping.country || data.billing.regionName || data.billing.country,
              country_code: data.shipping.country || data.billing.regionName || data.billing.country,
              regionName: data.shipping.country || data.billing.regionName,
              postalCode: data.shipping.postalCode || data.billing.postalCode || "00000",
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

    // If somehow bank payment is selected but Stripe not configured
    // This shouldn't happen since we only show this component when Stripe is not available
    // But if it does, show a helpful error
    setErrorMessage("Stripe payment is not configured. Please select Cash on Delivery as payment method.");
    setLoading(false);
    toast.error("Stripe payment is not available. Please use Cash on Delivery.");
  };

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
            <PaymentMethod amount={amount} isStripeAvailable={false} />

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

export default CheckoutPaymentAreaWithoutStripe;

