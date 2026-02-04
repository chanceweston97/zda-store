"use client";

import React, { createContext, useContext, useState, useCallback } from "react";

export type QuoteProductItem = {
  id: string | number;
  title: string;
  sku?: string;
  price: number;
  quantity: number;
  /** Full or relative product URL (e.g. /products/my-product or https://site.com/products/my-product) */
  url?: string;
};

type RequestQuoteModalState = {
  isOpen: boolean;
  products: QuoteProductItem[];
};

type RequestQuoteModalContextType = {
  isOpen: boolean;
  products: QuoteProductItem[];
  openRequestQuoteModal: (data?: { products?: QuoteProductItem[] }) => void;
  closeRequestQuoteModal: () => void;
  /** Update quantity for a product (by index). Used by modal so PDP can read updated quantity on close. */
  updateProductQuantity: (index: number, quantity: number) => void;
};

const RequestQuoteModalContext = createContext<RequestQuoteModalContextType | undefined>(undefined);

export function useRequestQuoteModal() {
  const context = useContext(RequestQuoteModalContext);
  if (!context) {
    throw new Error("useRequestQuoteModal must be used within RequestQuoteModalProvider");
  }
  return context;
}

export function RequestQuoteModalProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<RequestQuoteModalState>({ isOpen: false, products: [] });

  const openRequestQuoteModal = useCallback((data?: { products?: QuoteProductItem[] }) => {
    if (typeof document !== "undefined") {
      document.body.classList.add("overflow-hidden");
    }
    setState({
      isOpen: true,
      products: data?.products ?? [],
    });
  }, []);

  const closeRequestQuoteModal = useCallback(() => {
    if (typeof document !== "undefined") {
      document.body.classList.remove("overflow-hidden");
    }
    setState((prev) => ({ ...prev, isOpen: false }));
  }, []);

  const updateProductQuantity = useCallback((index: number, quantity: number) => {
    const qty = Math.max(1, Math.floor(Number(quantity)) || 1);
    setState((prev) => {
      if (index < 0 || index >= prev.products.length) return prev;
      const next = [...prev.products];
      next[index] = { ...next[index], quantity: qty };
      return { ...prev, products: next };
    });
  }, []);

  return (
    <RequestQuoteModalContext.Provider
      value={{
        isOpen: state.isOpen,
        products: state.products,
        openRequestQuoteModal,
        closeRequestQuoteModal,
        updateProductQuantity,
      }}
    >
      {children}
    </RequestQuoteModalContext.Provider>
  );
}
