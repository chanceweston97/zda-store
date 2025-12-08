// Categories Data
// Edit this file to add/update categories
// Images should be in /public/images/categories/

import { Category } from "../types";

export const categories: Category[] = [
  {
    id: "antennas",
    title: "Antennas",
    slug: "antennas",
    image: "/images/categories/antennas.png",
    description: "High-quality antennas for various applications",
  },
  {
    id: "cables",
    title: "Cables",
    slug: "cables",
    image: "/images/categories/cables.png",
    description: "RF cables and assemblies",
  },
  {
    id: "connectors",
    title: "Connectors",
    slug: "connectors",
    image: "/images/categories/connectors.png",
    description: "RF connectors for cable assemblies",
  },
  // Example: Subcategory
  {
    id: "yagi-antennas",
    title: "Yagi Antennas",
    slug: "yagi-antennas",
    image: "/images/categories/yagi-antennas.png",
    description: "Directional Yagi antennas",
    parent: {
      id: "antennas",
      title: "Antennas",
      slug: "antennas",
    },
  },
  // Add more categories here...
  // Copy the structure above and update the values
];

// Export default for easy importing
export default categories;

// Helper functions
export function getCategoryBySlug(slug: string): Category | undefined {
  return categories.find((c) => c.slug === slug);
}

export function getCategoriesByParent(parentSlug: string): Category[] {
  return categories.filter((c) => c.parent?.slug === parentSlug);
}

export function getRootCategories(): Category[] {
  return categories.filter((c) => !c.parent);
}


