import React from "react";
import Cart from "@/components/Cart";

import { Metadata } from "next";
import AboutUs from "@/components/AboutUs";
export const metadata: Metadata = {
  title: "Company Page | ZDA Communications",
  description: "This is Company Page for ZDA Communications",
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
