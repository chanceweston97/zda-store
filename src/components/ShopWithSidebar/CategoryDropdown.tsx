"use client";
import { Category } from "@/types/category";
import { Product } from "@/types/product";
import { useState, useMemo, useEffect, useTransition } from "react";
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
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Auto-open categories that have checked subcategories
  // OPTIMIZED: Only update when category param actually changes, not on every searchParams change
  const categoryParam = searchParams?.get("category");
  useEffect(() => {
    if (categoryParam) {
      const checkedCategories = new Set(categoryParam.split(",").filter(Boolean));
      const newOpenCategories: Record<string, boolean> = {};
      
      categories.forEach((category) => {
        if (category.subcategories && category.subcategories.length > 0) {
          // Check if any subcategory is checked (using Set for O(1) lookup)
          const categoryHandle = (category as any).handle || category.slug?.current || category.slug;
          const hasCheckedSubcategory = category.subcategories.some(
            (sub: any) => {
              const subHandle = (sub as any).handle || sub.slug?.current || sub.slug;
              return checkedCategories.has(subHandle);
            }
          );
          if (hasCheckedSubcategory) {
            newOpenCategories[categoryHandle] = true;
          }
        }
      });
      
      setOpenCategories((prev) => {
        // Only update if something actually changed
        const hasChanges = Object.keys(newOpenCategories).some(
          key => prev[key] !== newOpenCategories[key]
        );
        return hasChanges ? { ...prev, ...newOpenCategories } : prev;
      });
    } else {
      // Clear open categories when no category param
      setOpenCategories({});
    }
  }, [categoryParam, categories]);

  // Calculate product counts per category (like front project)
  // For parent categories: ONLY sum of subcategory counts (not parent's own products)
  // For subcategories: count their own products
  // OPTIMIZED: Build a map of product category IDs for O(1) lookup instead of filtering
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    
    // Build a map: categoryId -> product count (O(n) instead of O(n*m))
    const categoryProductMap = new Map<string, number>();
    
    // First pass: count products per category ID
    allProducts.forEach((product) => {
      const productCategoryIds = product.categories?.map((cat: any) => cat.id).filter(Boolean) || [];
      productCategoryIds.forEach((categoryId: string) => {
        categoryProductMap.set(categoryId, (categoryProductMap.get(categoryId) || 0) + 1);
      });
    });

    // Second pass: assign counts to category handles
    categories.forEach((category) => {
      const categoryHandle = (category as any).handle || category.slug?.current || category.slug;
      const categoryId = category.id || category._id;
      
      // For parent categories with subcategories: ONLY sum subcategory counts
      if (category.subcategories && category.subcategories.length > 0) {
        let subcategorySum = 0;
        category.subcategories.forEach((sub: any) => {
          const subId = sub.id || sub._id;
          if (subId) {
            const subCount = categoryProductMap.get(subId) || 0;
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
          counts[categoryHandle] = categoryProductMap.get(categoryId) || 0;
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

    // Use startTransition for non-blocking update - UI updates instantly via client-side filtering
    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    });
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

    // Use startTransition for non-blocking update - UI updates instantly via client-side filtering
    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    });
  };

  // OPTIMIZED: Memoize checked categories set to avoid recreating on every call
  const checkedCategoriesSet = useMemo(() => {
    const categoryParam = searchParams?.get("category");
    return categoryParam ? new Set(categoryParam.split(",").filter(Boolean)) : new Set();
  }, [searchParams]);

  const isCategoryChecked = (categoryHandle: string) => {
    return checkedCategoriesSet.has(categoryHandle);
  };

  // Check if all subcategories are selected for a parent category
  // OPTIMIZED: Use the memoized checkedCategoriesSet
  const areAllSubcategoriesChecked = (category: Category) => {
    if (!category.subcategories || category.subcategories.length === 0) {
      return false;
    }
    
    if (checkedCategoriesSet.size === 0) {
      return false;
    }
    
    const allSubcategoryHandles = category.subcategories.map((sub: any) => 
      (sub as any).handle || sub.slug?.current || sub.slug
    );
    
    // Check if ALL subcategories are in the checked categories set
    return allSubcategoryHandles.every((subHandle) => checkedCategoriesSet.has(subHandle));
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
