"use client";
import React, { createContext, useContext, useState } from "react";
import { useShoppingCart } from "use-shopping-cart";

interface AutoOpenCartContextType {
  addItemWithAutoOpen: (product: any, count?: number) => void;
  isAutoOpenEnabled: boolean;
  setAutoOpenEnabled: (enabled: boolean) => void;
}

const AutoOpenCartContext = createContext<AutoOpenCartContextType | undefined>(
  undefined
);

export const AutoOpenCartProvider: React.FC<{
  children: React.ReactNode;
  defaultAutoOpen?: boolean;
}> = ({ children, defaultAutoOpen = true }) => {
  const { addItem, handleCartClick } = useShoppingCart();
  const [isAutoOpenEnabled, setAutoOpenEnabled] = useState(defaultAutoOpen);

  const addItemWithAutoOpen = (product: any, count: number = 1) => {
    // Add item to cart first
    addItem(product, { count });

    // Then open cart if auto-open is enabled
    if (isAutoOpenEnabled) {
      // Small delay to ensure the cart state is updated
      setTimeout(() => {
        handleCartClick();
      }, 100);
    }
  };

  return (
    <AutoOpenCartContext.Provider
      value={{
        addItemWithAutoOpen,
        isAutoOpenEnabled,
        setAutoOpenEnabled,
      }}
    >
      {children}
    </AutoOpenCartContext.Provider>
  );
};

export const useAutoOpenCart = (): AutoOpenCartContextType => {
  const context = useContext(AutoOpenCartContext);
  if (!context) {
    throw new Error(
      "useAutoOpenCart must be used within an AutoOpenCartProvider"
    );
  }
  return context;
};
