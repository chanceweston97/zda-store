import { WhatWeOffer } from "../types";

export const whatWeOffer: WhatWeOffer = {
  id: "offer-1",
  title: "What We Offer",
  headerButton: {
    text: "Explore Products",
    link: "/store",
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
      image: "/images/products/antenna.png",
      imagePosition: "right",
    },
    {
      title: "Coaxial Cables",
      tags: ["LMR/RG Cables", "Any Length", "Standard Connectors", "Bulk Spools"],
      description: "Low-loss 50-ohm assemblies cut to length with precise terminations for minimal attenuation and maximum durability. Any length, assembled in the United States.",
      button: {
        text: "Explore Cables",
        link: "/products/cables",
      },
      image: "/images/products/cable.png",
      imagePosition: "left",
    },
    {
      title: "Connectors & Accessories",
      tags: ["Connectors", "Surge Arrestors", "Splitters", "Attenuators"],
      description: "Industry-standard RF connectors, adapters, and couplers for secure, low-resistance joins across your network. Available in N, SMA, TNC, and more.",
      button: {
        text: "Explore Accessories",
        link: "/products/connectors",
      },
      image: "/images/products/antenna.png",
      imagePosition: "right",
    },
  ],
};

export default whatWeOffer;

