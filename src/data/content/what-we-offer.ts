// What We Offer Data
import { WhatWeOffer } from "../types";

export const whatWeOffer: WhatWeOffer = {
  id: "what-we-offer-1",
  title: "What We Offer",
  isActive: true,
  headerButton: {
    text: "Explore Products",
    link: "/products",
  },
  offerItems: [
    {
      title: "Antennas",
      tags: ["Yagi", "Omnidirectional", "Grid Parabolic", "Rubber Ducky"],
      description: "Directional and omnidirectional options engineered for reliable coverage—from VHF/UHF to LTE/5G sub-6 GHz. Field-ready builds with verified VSWR for clean links in real-world conditions.",
      button: {
        text: "Explore Antennas",
        link: "/categories/antennas",
      },
      image: "/images/hero/what-we-offer/antennas.webp",
      imagePosition: "right",
    },
    {
      title: "Coaxial Cables",
      tags: ["LMR/RG Cables", "Any Length", "Standard Connectors", "Bulk Spools"],
      description: "Low-loss 50-ohm assemblies cut to length with precise terminations for minimal attenuation and maximum durability. Any length, assembled in the United States.",
      button: {
        text: "Explore Cables",
        link: "/categories/cables",
      },
      image: "/images/hero/what-we-offer/cables.jpg",
      imagePosition: "left",
    },
    {
      title: "Connectors & Accessories",
      tags: ["Connectors", "Surge Arrestors", "Splitters", "Attenuators"],
      description: "Industry-standard RF connectors, adapters, and couplers for secure, low-resistance joins across your network. Available in N, SMA, TNC, and more.",
      button: {
        text: "Explore Accessories",
        link: "/categories/connectors",
      },
      image: "/images/hero/what-we-offer/connectors.webp",
      imagePosition: "right",
    },
  ],
};

export default whatWeOffer;

