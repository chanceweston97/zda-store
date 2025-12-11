import React from "react";
import Breadcrumb from "@components/Common/Breadcrumb";
import CheckoutSuccess from "./CheckoutSuccess";

export const metadata = {
  title: "Order Confirmed | ZDAComm",
  description: "Your order has been placed successfully",
};

const OrderConfirmed = async () => {
  return (
    <main>
      <Breadcrumb title={"Order Confirmed"} pages={["order", "/", "confirmed"]} />
      <CheckoutSuccess />
    </main>
  );
};

export default OrderConfirmed;

