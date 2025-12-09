// Hero Banners Data
// Edit this file to update homepage hero banners
// Images should be in /public/images/hero/

import { HeroBanner } from "../types";

export const heroBanners: HeroBanner[] = [
  {
    id: "banner-1",
    title: "Fffffield-tested antennas and cabling built to improve signal where it counts.",
    subtitle: "ZDA Communications",
    image: "/images/hero/banner.webp",
    link: "/store",
    buttonText: "All Products",
    brandName: "ZDA Communications",
    card: {
      image: "/images/products/antenna.png",
      title: "Precision & Performance",
      description: "Empowering connectivity with engineered reliability and real world results",
    },
    order: 0,
  },
];

export default heroBanners;


