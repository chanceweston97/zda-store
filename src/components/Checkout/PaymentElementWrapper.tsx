"use client";

import { PaymentElement as StripePaymentElement } from "@stripe/react-stripe-js";

// This component should ONLY be used inside an Elements wrapper
// It will throw an error if used outside Elements context
export default function PaymentElementWrapper() {
  return (
    <StripePaymentElement
      options={{
        layout: "tabs", // Shows payment methods as tabs (Card, Amazon Pay, Cash App Pay, Klarna, etc.)
        paymentMethodTypes: ["card", "link", "cashapp", "klarna"], // Enable multiple payment methods
      }}
    />
  );
}

