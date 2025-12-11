import { retrieveCart } from "@lib/data/cart";
import Cart from "@components/Cart";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cart | ZDAComm",
  description: "View your shopping cart",
};

export default async function CartPage() {
  const cart = await retrieveCart().catch(() => null);

  return <Cart initialCart={cart} />;
}

