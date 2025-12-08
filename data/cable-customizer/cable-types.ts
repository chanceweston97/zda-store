// Cable Types Data
// Edit this file to update cable types
// Images should be in /public/images/cable-customizer/cable-types/
// Price per foot is used to calculate total price: pricePerFoot × length

import { CableType } from "../types";

export const cableTypes: CableType[] = [
  // Example: LMR Series
  {
    id: "lmr-100",
    name: "LMR 100",
    slug: "lmr-100",
    series: {
      id: "lmr-series",
      name: "LMR Series",
      slug: "lmr-series",
    },
    pricePerFoot: 0.25, // $0.25 per foot
    image: "/images/cable-customizer/cable-types/lmr-100.png",
    order: 0,
    isActive: true,
    lengthOptions: [
      { length: "10 ft" },
      { length: "25 ft" },
      { length: "50 ft" },
      { length: "100 ft" },
    ],
  },
  {
    id: "lmr-195",
    name: "LMR 195",
    slug: "lmr-195",
    series: {
      id: "lmr-series",
      name: "LMR Series",
      slug: "lmr-series",
    },
    pricePerFoot: 0.35,
    image: "/images/cable-customizer/cable-types/lmr-195.png",
    order: 1,
    isActive: true,
    lengthOptions: [
      { length: "10 ft" },
      { length: "25 ft" },
      { length: "50 ft" },
      { length: "100 ft" },
    ],
  },
  {
    id: "lmr-400",
    name: "LMR 400",
    slug: "lmr-400",
    series: {
      id: "lmr-series",
      name: "LMR Series",
      slug: "lmr-series",
    },
    pricePerFoot: 1.25,
    image: "/images/cable-customizer/cable-types/lmr-400.png",
    order: 2,
    isActive: true,
    lengthOptions: [
      { length: "10 ft" },
      { length: "25 ft" },
      { length: "50 ft" },
      { length: "100 ft" },
    ],
  },
  // Example: RG Series
  {
    id: "rg-58",
    name: "RG 58",
    slug: "rg-58",
    series: {
      id: "rg-series",
      name: "RG Series",
      slug: "rg-series",
    },
    pricePerFoot: 0.30,
    image: "/images/cable-customizer/cable-types/rg-58.png",
    order: 0,
    isActive: true,
    lengthOptions: [
      { length: "10 ft" },
      { length: "25 ft" },
      { length: "50 ft" },
      { length: "100 ft" },
    ],
  },
  // Add more cable types here...
  // Copy the structure above and update the values
];

// Export default for easy importing
export default cableTypes;


