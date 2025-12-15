// Categories Data
// Edit this file to add/update categories
// Images should be in /public/images/categories/

import { Category } from "../types";

export const categories: Category[] = [
  // Add your categories here
  // Example structure:
  // {
  //   id: "antennas",
  //   _id: "antennas",
  //   title: "Antennas",
  //   slug: "antennas",
  //   image: "/images/categories/antennas.png",
  //   description: "High-quality antennas for various applications",
  // },
];

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

export function getAllCategories(): Category[] {
  return categories;
}

export function getCategoriesWithSubcategories(): Category[] {
  return categories.map((category) => {
    const subcategories = getCategoriesByParent(category.slug);
    return {
      ...category,
      subcategories: subcategories.length > 0 ? subcategories : undefined,
    };
  });
}

export default categories;

