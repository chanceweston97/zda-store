// Products Data
// Edit this file to add/update products
// Images should be in /public/images/products/

import { Product } from "../types";

export const products: Product[] = [
  // Example: Antenna Product
  {
    id: "antenna-1",
    name: "Example Antenna",
    slug: "example-antenna",
    productType: "antenna",
    category: {
      id: "antennas",
      name: "Antennas",
      slug: "antennas",
    },
    price: 99.99,
    sku: "ANT-001",
    tags: ["antenna", "wireless"],
    status: true,
    inStock: true,
    quantity: 10,
    thumbnails: [
      {
        image: "/images/products/antenna-1-thumb-1.png",
        color: "Black",
      },
      {
        image: "/images/products/antenna-1-thumb-2.png",
        color: "White",
      },
    ],
    previewImages: [
      {
        image: "/images/products/antenna-1-preview-1.png",
        color: "Black",
      },
      {
        image: "/images/products/antenna-1-preview-2.png",
        color: "White",
      },
    ],
    gainOptions: [
      { gain: "6", price: 99.99 },
      { gain: "8", price: 119.99 },
      { gain: "12", price: 149.99 },
    ],
    features: ["Feature 1", "Feature 2", "Feature 3"],
    applications: ["Application 1", "Application 2"],
    featureTitle: "Key Features",
    shortDescription: "Short description of the antenna",
    description: [], // Rich text content
    specifications: [], // Rich text content
    datasheetImage: "/images/products/antenna-1-datasheet.png",
    datasheetPdf: "/pdfs/antenna-1-datasheet.pdf",
  },
  // Example: Cable Product
  {
    id: "cable-1",
    name: "Example Cable",
    slug: "example-cable",
    productType: "cable",
    category: {
      id: "cables",
      name: "Cables",
      slug: "cables",
    },
    cableSeries: {
      id: "lmr-series",
      name: "LMR Series",
      slug: "lmr-series",
    },
    cableType: {
      id: "lmr-400",
      name: "LMR 400",
      slug: "lmr-400",
    },
    connectorA: {
      id: "sma-male",
      name: "SMA-Male",
      slug: "sma-male",
      image: "/images/cable-customizer/connectors/sma-male.png",
    },
    connectorB: {
      id: "sma-female",
      name: "SMA-Female",
      slug: "sma-female",
      image: "/images/cable-customizer/connectors/sma-female.png",
    },
    lengthOptions: [
      { length: "10", price: 12.50 },
      { length: "25", price: 31.25 },
      { length: "50", price: 62.50 },
    ],
    cableImage: "/images/products/cable-1.png",
    quantity: 1,
    features: ["Feature 1", "Feature 2"],
  },
  // Example: Connector Product
  {
    id: "connector-1",
    name: "Example Connector",
    slug: "example-connector",
    productType: "connector",
    category: {
      id: "connectors",
      name: "Connectors",
      slug: "connectors",
    },
    connectorPrice: 4.95,
    connectorImage: "/images/products/connector-1.png",
    isActive: true,
    displayOrder: 0,
  },
  // Add more products here...
  // Copy the structure above and update the values
];

// Export default for easy importing
export default products;

// Helper functions
export function getProductBySlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export function getProductsByType(type: "antenna" | "cable" | "connector"): Product[] {
  return products.filter((p) => p.productType === type);
}

export function getProductsByCategory(categorySlug: string): Product[] {
  return products.filter((p) => p.category?.slug === categorySlug);
}


