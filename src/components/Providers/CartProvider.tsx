"use client";
import { CartProvider as USCProvider } from "use-shopping-cart";

import React from "react";

function CartProvider({ children }: { children: React.ReactNode }) {
  // Make Stripe optional - if not set, CartProvider will work without Stripe
  // This allows using WooCommerce checkout instead
  const stripeKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || undefined;
  const successUrl = process.env.NEXT_PUBLIC_SUCCESS_URL || `${typeof window !== 'undefined' ? window.location.origin : ''}/success`;
  const cancelUrl = process.env.NEXT_PUBLIC_CANCEL_URL || `${typeof window !== 'undefined' ? window.location.origin : ''}/shop`;

  return (
    <USCProvider
      mode="payment"
      cartMode="client-only"
      currency="USD"
      stripe={stripeKey}
      billingAddressCollection={true}
      successUrl={successUrl}
      cancelUrl={cancelUrl}
      shouldPersist={true}
      language="en-US"
    >
      {children}
    </USCProvider>
  );
}

export default CartProvider;
