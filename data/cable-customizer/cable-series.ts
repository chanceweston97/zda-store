// Cable Series Data
// Edit this file to update cable series (RG Series, LMR Series, etc.)
// Images should be in /public/images/cable-customizer/

import { CableSeries } from "../types";

export const cableSeries: CableSeries[] = [
  {
    id: "rg-series",
    name: "RG Series",
    slug: "rg-series",
    order: 0,
  },
  {
    id: "lmr-series",
    name: "LMR Series",
    slug: "lmr-series",
    order: 1,
  },
];

// Export default for easy importing
export default cableSeries;


