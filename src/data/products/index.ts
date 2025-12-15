// Products Data
// Edit this file to add/update products
// Images should be in /public/images/products/

import { Product } from "../types";

export const products: Product[] = [
  // Add your products here
  // Example structure:
  // {
  //   id: "product-1",
  //   _id: "product-1",
  //   name: "Example Product",
  //   slug: "example-product",
  //   productType: "antenna",
  //   category: {
  //     id: "antennas",
  //     name: "Antennas",
  //     slug: "antennas",
  //   },
  //   price: 99.99,
  //   sku: "ANT-001",
  //   tags: ["antenna", "wireless"],
  //   status: true,
  //   inStock: true,
  //   quantity: 10,
  //   thumbnails: [
  //     {
  //       image: "/images/products/product-1-thumb.png",
  //       color: "Black",
  //     },
  //   ],
  //   previewImages: [
  //     {
  //       image: "/images/products/product-1-preview.png",
  //       color: "Black",
  //     },
  //   ],
  // },
];

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

export function getAllProducts(): Product[] {
  return products;
}

export default products;

