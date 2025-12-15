"use client";
import { CartProvider as USCProvider } from "use-shopping-cart";

import React from "react";

function CartProvider({ children }: { children: React.ReactNode }) {

  return (
    <USCProvider
      mode="payment"
      cartMode="client-only"
      currency="USD"
      stripe={process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY as string}
      billingAddressCollection={true}
      successUrl={process.env.NEXT_PUBLIC_SUCCESS_URL as string}
      cancelUrl={process.env.NEXT_PUBLIC_CANCEL_URL as string}
      shouldPersist={true}
      language="en-US"
    >
      {children}
    </USCProvider>
  );
}

export default CartProvider;
