import React from "react";
import Breadcrumb from "@/components/Common/Breadcrumb";
import CheckoutSuccess from "./CheckoutSuccess";

const Success = async () => {
  return (
    <main>
      <Breadcrumb title={"Success"} pages={["order", "/", "success"]} />
      <CheckoutSuccess />
    </main>
  );
};

export default Success;
