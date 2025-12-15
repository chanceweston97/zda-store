"use client";
import { Category } from "@/types/category";
import { Product } from "@/types/product";
import { useState, useMemo, useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChevronDown } from "../Header/icons";
import { CheckMarkIcon2 } from "@/assets/icons";

type PropsType = {
  categories: Category[];
  allProducts?: Product[];
};

const CategoryDropdown = ({ categories, allProducts = [] }: PropsType) => {
  const [isOpen, setIsOpen] = useState(true);
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({});
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Auto-open categories that have checked subcategories
  useEffect(() => {
    const categoryParam = searchParams?.get("category");
    if (categoryParam) {
      const checkedCategories = categoryParam.split(",");
      const newOpenCategories: Record<string, boolean> = {};
      
      categories.forEach((category) => {
        if (category.subcategories && category.subcategories.length > 0) {
          // Check if any subcategory is checked
          const categoryHandle = (category as any).handle || category.slug?.current || category.slug;
          const hasCheckedSubcategory = category.subcategories.some(
            (sub: any) => {
              const subHandle = (sub as any).handle || sub.slug?.current || sub.slug;
              return checkedCategories.includes(subHandle);
            }
          );
          if (hasCheckedSubcategory) {
            newOpenCategories[categoryHandle] = true;
          }
        }
      });
      
      setOpenCategories((prev) => ({ ...prev, ...newOpenCategories }));
    }
  }, [searchParams, categories]);

  // Calculate product counts per category (like front project)
  // For parent categories: ONLY sum of subcategory counts (not parent's own products)
  // For subcategories: count their own products
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    
    // Count products for a category by ID (like front project)
    const countProductsForCategory = (categoryId: string): number => {
      return allProducts.filter((product) => {
        const productCategoryIds = product.categories?.map((cat: any) => cat.id).filter(Boolean) || [];
        return productCategoryIds.includes(categoryId);
      }).length;
    };

    categories.forEach((category) => {
      const categoryHandle = (category as any).handle || category.slug?.current || category.slug;
      const categoryId = category.id || category._id;
      
      // For parent categories with subcategories: ONLY sum subcategory counts
      if (category.subcategories && category.subcategories.length > 0) {
        let subcategorySum = 0;
        category.subcategories.forEach((sub: any) => {
          const subId = sub.id || sub._id;
          if (subId) {
            const subCount = countProductsForCategory(subId);
            subcategorySum += subCount;
            // Also store individual subcategory count
            const subHandle = (sub as any).handle || sub.slug?.current || sub.slug;
            if (subHandle) {
              counts[subHandle] = subCount;
            }
          }
        });
        // Parent category count = sum of subcategories ONLY (not parent's own products)
        counts[categoryHandle] = subcategorySum;
      } else {
        // If no subcategories, this is a leaf category - count its own products
        if (categoryId) {
          counts[categoryHandle] = countProductsForCategory(categoryId);
        }
      }
    });

    return counts;
  }, [categories, allProducts]);

  const toggleCategory = (categoryHandle: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setOpenCategories((prev) => ({
      ...prev,
      [categoryHandle]: !prev[categoryHandle],
    }));
  };

  const handleCategory = (categoryHandle: string, isChecked: boolean) => {
    const params = new URLSearchParams(searchParams?.toString() || "");
    const categoryParam = params.get("category");

    if (isChecked) {
      const existingCategories = categoryParam ? categoryParam.split(",").filter(Boolean) : [];
      if (!existingCategories.includes(categoryHandle)) {
        params.set("category", [...existingCategories, categoryHandle].join(","));
      }
    } else {
      const existingCategories = categoryParam?.split(",").filter(Boolean) || [];
      const newCategories = existingCategories.filter((id) => id !== categoryHandle);

      if (newCategories.length > 0) {
        params.set("category", newCategories.join(","));
      } else {
        params.delete("category");
      }
    }

    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  // Handle parent category click - toggle all subcategories at once
  const handleParentCategory = (subcategories: Category[], isChecked: boolean) => {
    const params = new URLSearchParams(searchParams?.toString() || "");
    const categoryParam = params.get("category");

    if (isChecked) {
      // Add all subcategories
      const subcategoryHandles = subcategories.map((sub: any) => 
        (sub as any).handle || sub.slug?.current || sub.slug
      );
      const existingCategories = categoryParam ? categoryParam.split(",").filter(Boolean) : [];
      const newCategories = [...new Set([...existingCategories, ...subcategoryHandles])];
      params.set("category", newCategories.join(","));
    } else {
      // Remove all subcategories
      const subcategoryHandles = subcategories.map((sub: any) => 
        (sub as any).handle || sub.slug?.current || sub.slug
      );
      const existingCategories = categoryParam?.split(",").filter(Boolean) || [];
      const newCategories = existingCategories.filter((id) => !subcategoryHandles.includes(id));

      if (newCategories.length > 0) {
        params.set("category", newCategories.join(","));
      } else {
        params.delete("category");
      }
    }

    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const isCategoryChecked = (categoryHandle: string) => {
    const categoryParam = searchParams?.get("category");
    return categoryParam?.split(",").includes(categoryHandle) || false;
  };

  // Check if all subcategories are selected for a parent category
  const areAllSubcategoriesChecked = (category: Category) => {
    if (!category.subcategories || category.subcategories.length === 0) {
      return false;
    }
    
    const categoryParam = searchParams?.get("category");
    if (!categoryParam) {
      return false;
    }
    
    const checkedCategories = categoryParam.split(",");
    const allSubcategoryHandles = category.subcategories.map((sub: any) => 
      (sub as any).handle || sub.slug?.current || sub.slug
    );
    
    // Check if ALL subcategories are in the checked categories list
    return allSubcategoryHandles.every((subHandle) => checkedCategories.includes(subHandle));
  };

  const getCategoryProductCount = (category: Category) => {
    // Always use dynamically calculated counts (which only sum subcategories for parents)
    // This ensures parent categories show ONLY subcategory counts, not their own products
    const categoryHandle = (category as any).handle || category.slug?.current || category.slug;
    return categoryCounts[categoryHandle] || 0;
  };

  if (!categories.length) return null;

  return (
    <div className="bg-white rounded-lg shadow-1">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`cursor-pointer flex items-center justify-between py-3 pl-6 pr-5.5 w-full ${
          isOpen && "shadow-filter"
        }`}
      >
        <span className="text-dark">Category</span>

        <ChevronDown
          className={`text-dark ease-in-out duration-300 transition-transform ${isOpen && "rotate-180"}`}
        />
      </button>

      <div 
        className={`flex flex-col gap-3 pl-6 pr-5.5 transition-all duration-300 ease-in-out overflow-hidden ${
          isOpen ? "max-h-[2000px] opacity-100 py-6" : "max-h-0 opacity-0 py-0"
        }`}
      >
        {categories.map((category) => {
          const hasSubcategories = category.subcategories && category.subcategories.length > 0;
          const categoryHandle = (category as any).handle || category.slug?.current || category.slug;
          // Check if any subcategory is checked - if so, keep parent open
          const hasCheckedSubcategory = hasSubcategories && category.subcategories?.some(
            (sub: any) => {
              const subHandle = (sub as any).handle || sub.slug?.current || sub.slug;
              return isCategoryChecked(subHandle);
            }
          );
          const isCategoryOpen = openCategories[categoryHandle] ?? hasCheckedSubcategory ?? false;
          // For parent categories with subcategories, check if ALL subcategories are selected
          // For categories without subcategories, use the normal check
          const isChecked = hasSubcategories
            ? areAllSubcategoriesChecked(category)
            : isCategoryChecked(categoryHandle);
          const totalProductCount = getCategoryProductCount(category);

          return (
            <div key={categoryHandle} className="flex flex-col gap-2">
              {/* Parent Category */}
              <div className="flex items-center justify-start gap-2">
                <label
                  htmlFor={categoryHandle}
                  className="flex items-center justify-start gap-2 cursor-pointer group hover:text-blue flex-1"
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                >
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={isChecked}
                    onChange={(e) => {
                      e.stopPropagation();
                      // When parent is clicked, only toggle all subcategories, not the parent itself
                      if (category.subcategories && category.subcategories.length > 0) {
                        handleParentCategory(category.subcategories, e.target.checked);
                      } else {
                        handleCategory(categoryHandle, e.target.checked);
                      }
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                    id={categoryHandle}
                  />

                  <div
                    aria-hidden
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                    className="cursor-pointer flex items-center justify-center rounded-sm w-4 h-4 border peer-checked:border-blue peer-checked:bg-blue bg-white border-gray-3 peer-checked:[&>*]:!block"
                  >
                    <CheckMarkIcon2 className="hidden" />
                  </div>

                  <span
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                    className="peer-checked:text-blue"
                  >
                    {category.title} ({totalProductCount})
                  </span>
                </label>

                {hasSubcategories && (
                  <button
                    type="button"
                    onClick={(e) => toggleCategory(categoryHandle, e)}
                    className="p-1 hover:bg-gray-100 rounded flex-shrink-0"
                    aria-label="Toggle subcategories"
                  >
                    <ChevronDown
                      className={`text-dark text-xs transition-transform duration-300 ease-in-out ${
                        isCategoryOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                )}
              </div>

              {/* Subcategories */}
              {hasSubcategories && (
                <div
                  className={`flex flex-col gap-2 pl-6 overflow-hidden transition-all duration-300 ease-in-out ${
                    isCategoryOpen
                      ? "max-h-[1000px] opacity-100"
                      : "max-h-0 opacity-0"
                  }`}
                >
                  {category.subcategories?.map((subcategory) => {
                    const subHandle = (subcategory as any).handle || subcategory.slug?.current || subcategory.slug;
                    const isSubChecked = isCategoryChecked(subHandle);
                    const subCount = categoryCounts[subHandle] || 0;

                    return (
                      <label
                        htmlFor={subHandle}
                        key={subHandle}
                        className="flex items-center justify-start gap-2 cursor-pointer group hover:text-blue"
                      >
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={isSubChecked}
                          onChange={(e) => {
                            // Keep parent category open when checking subcategory
                            if (e.target.checked && !isCategoryOpen) {
                              setOpenCategories((prev) => ({
                                ...prev,
                                [categoryHandle]: true,
                              }));
                            }
                            handleCategory(subHandle, e.target.checked);
                          }}
                          id={subHandle}
                        />

                        <div
                          aria-hidden
                          className="cursor-pointer flex items-center justify-center rounded-sm w-4 h-4 border peer-checked:border-blue peer-checked:bg-blue bg-white border-gray-3 peer-checked:[&>*]:!block"
                        >
                          <CheckMarkIcon2 className="hidden" />
                        </div>

                        <span className="flex-1 peer-checked:text-blue text-sm">
                          {subcategory.title} ({subCount})
                        </span>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CategoryDropdown;
