import React from "react";
import Checkout from "@/components/Checkout";

import { Metadata } from "next";
import Breadcrumb from "@/components/Common/Breadcrumb";
export const metadata: Metadata = {
  title: "Checkout Page | ZDAComm |  Store",
  description: "This is Checkout Page for ZDAComm Template",
  // other metadata
};

const CheckoutPage = () => {
  return (
    <main>
      <Breadcrumb title={"Checkout"} pages={["checkout"]} />
      <Checkout />
    </main>
  );
};

export default CheckoutPage;
