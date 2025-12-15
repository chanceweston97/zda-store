import React from "react";
import Cart from "@/components/Cart";

import { Metadata } from "next";
import AboutUs from "@/components/AboutUs";
export const metadata: Metadata = {
  title: "About Us Page | ZDAComm |  Store",
  description: "This is Cart Page for ZDAComm Template",
  // other metadata
};

const AboutUsPage = () => {
  return (
    <>
      <AboutUs />
    </>
  );
};

export default AboutUsPage;
