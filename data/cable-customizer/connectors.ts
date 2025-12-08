// Connectors Data
// Edit this file to update connectors and their pricing
// Images should be in /public/images/cable-customizer/connectors/
// Pricing is per connector, varies by cable type

import { Connector } from "../types";

export const connectors: Connector[] = [
  {
    id: "tnc-male",
    name: "TNC-Male",
    slug: "tnc-male",
    image: "/images/cable-customizer/connectors/tnc-male.png",
    order: 12,
    isActive: true,
    pricing: [
      {
        cableType: {
          id: "lmr-100",
          name: "LMR 100",
          slug: "lmr-100",
        },
        price: 3.95,
      },
      {
        cableType: {
          id: "lmr-195",
          name: "LMR 195",
          slug: "lmr-195",
        },
        price: 3.95,
      },
      {
        cableType: {
          id: "lmr-400",
          name: "LMR 400",
          slug: "lmr-400",
        },
        price: 5.55,
      },
      {
        cableType: {
          id: "rg-58",
          name: "RG 58",
          slug: "rg-58",
        },
        price: 4.95,
      },
      // Add pricing for all cable types this connector supports
    ],
  },
  {
    id: "tnc-female",
    name: "TNC-Female",
    slug: "tnc-female",
    image: "/images/cable-customizer/connectors/tnc-female.png",
    order: 13,
    isActive: true,
    pricing: [
      {
        cableType: {
          id: "lmr-100",
          name: "LMR 100",
          slug: "lmr-100",
        },
        price: 3.95,
      },
      {
        cableType: {
          id: "lmr-195",
          name: "LMR 195",
          slug: "lmr-195",
        },
        price: 3.95,
      },
      {
        cableType: {
          id: "lmr-400",
          name: "LMR 400",
          slug: "lmr-400",
        },
        price: 5.55,
      },
      {
        cableType: {
          id: "rg-58",
          name: "RG 58",
          slug: "rg-58",
        },
        price: 4.95,
      },
    ],
  },
  {
    id: "sma-male",
    name: "SMA-Male",
    slug: "sma-male",
    image: "/images/cable-customizer/connectors/sma-male.png",
    order: 0,
    isActive: true,
    pricing: [
      {
        cableType: {
          id: "lmr-100",
          name: "LMR 100",
          slug: "lmr-100",
        },
        price: 2.95,
      },
      {
        cableType: {
          id: "lmr-195",
          name: "LMR 195",
          slug: "lmr-195",
        },
        price: 2.95,
      },
      {
        cableType: {
          id: "lmr-400",
          name: "LMR 400",
          slug: "lmr-400",
        },
        price: 4.95,
      },
      {
        cableType: {
          id: "rg-58",
          name: "RG 58",
          slug: "rg-58",
        },
        price: 3.95,
      },
    ],
  },
  {
    id: "sma-female",
    name: "SMA-Female",
    slug: "sma-female",
    image: "/images/cable-customizer/connectors/sma-female.png",
    order: 1,
    isActive: true,
    pricing: [
      {
        cableType: {
          id: "lmr-100",
          name: "LMR 100",
          slug: "lmr-100",
        },
        price: 2.95,
      },
      {
        cableType: {
          id: "lmr-195",
          name: "LMR 195",
          slug: "lmr-195",
        },
        price: 2.95,
      },
      {
        cableType: {
          id: "lmr-400",
          name: "LMR 400",
          slug: "lmr-400",
        },
        price: 4.95,
      },
      {
        cableType: {
          id: "rg-58",
          name: "RG 58",
          slug: "rg-58",
        },
        price: 3.95,
      },
    ],
  },
  // Add more connectors here...
  // Copy the structure above and update the values
  // Make sure to add pricing for all relevant cable types
];

// Export default for easy importing
export default connectors;


