"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import CartSidebar from "./index";

type CartSidebarContextType = {
  openCart: () => void;
  closeCart: () => void;
  isOpen: boolean;
};

const CartSidebarContext = createContext<CartSidebarContextType | undefined>(undefined);

export const CartSidebarProvider = ({ children }: { children: ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);

  const openCart = () => setIsOpen(true);
  const closeCart = () => setIsOpen(false);

  return (
    <CartSidebarContext.Provider value={{ openCart, closeCart, isOpen }}>
      {children}
      <CartSidebar isOpen={isOpen} onClose={closeCart} />
    </CartSidebarContext.Provider>
  );
};

export const useCartSidebar = () => {
  const context = useContext(CartSidebarContext);
  if (!context) {
    throw new Error("useCartSidebar must be used within CartSidebarProvider");
  }
  return context;
};

