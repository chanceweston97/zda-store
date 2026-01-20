"use client";
import { Category } from "@/types/category";
import { useState, useEffect, useTransition, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChevronDown } from "../Header/icons";
import { CheckMarkIcon2 } from "@/assets/icons";

type PropsType = {
  categories: Category[];
};

const CategoryDropdown = ({ categories }: PropsType) => {
  const [isOpen, setIsOpen] = useState(true);
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({});
  const [, startTransition] = useTransition();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const replaceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ✅ INSTANT UI: Local state for selected categories (updates immediately)
  const categoryParam = searchParams?.get("category");
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(() => {
    return categoryParam ? new Set(categoryParam.split(",").filter(Boolean)) : new Set();
  });

  // Sync local state with URL params (only when URL changes from outside)
  useEffect(() => {
    if (categoryParam) {
      const urlCategories = new Set(categoryParam.split(",").filter(Boolean));
      setSelectedCategories((prev) => {
        // Only update if different (prevents unnecessary re-renders)
        if (urlCategories.size !== prev.size || 
            ![...urlCategories].every(cat => prev.has(cat))) {
          return urlCategories;
        }
        return prev;
      });
    } else {
      setSelectedCategories((prev) => {
        if (prev.size > 0) {
          return new Set();
        }
        return prev;
      });
    }
  }, [categoryParam]);

  useEffect(() => {
    return () => {
      if (replaceTimeoutRef.current) {
        clearTimeout(replaceTimeoutRef.current);
      }
    };
  }, []);

  const scheduleReplace = (params: URLSearchParams) => {
    if (replaceTimeoutRef.current) {
      clearTimeout(replaceTimeoutRef.current);
    }
    const query = params.toString();
    replaceTimeoutRef.current = setTimeout(() => {
      startTransition(() => {
        router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
      });
    }, 350);
  };

  // Auto-open categories that have checked subcategories
  useEffect(() => {
    if (selectedCategories.size > 0) {
      const newOpenCategories: Record<string, boolean> = {};
      
      categories.forEach((category) => {
        if (category.subcategories && category.subcategories.length > 0) {
          const categoryId = String(category.id || category._id || "");
          const hasCheckedSubcategory = category.subcategories.some(
            (sub: any) => {
              const subId = String(sub.id || sub._id || "");
              return selectedCategories.has(subId);
            }
          );
          if (hasCheckedSubcategory && categoryId) {
            newOpenCategories[categoryId] = true;
          }
        }
      });
      
      setOpenCategories((prev) => {
        const hasChanges = Object.keys(newOpenCategories).some(
          key => prev[key] !== newOpenCategories[key]
        );
        return hasChanges ? { ...prev, ...newOpenCategories } : prev;
      });
    } else {
      setOpenCategories({});
    }
  }, [selectedCategories, categories]);

  const toggleCategory = (categoryHandle: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setOpenCategories((prev) => ({
      ...prev,
      [categoryHandle]: !prev[categoryHandle],
    }));
  };

  const handleCategory = (categoryId: string, isChecked: boolean) => {
    // ✅ INSTANT UI: Update local state immediately (checkbox appears checked instantly)
    setSelectedCategories((prev) => {
      const newSet = new Set(prev);
      if (isChecked) {
        newSet.add(categoryId);
      } else {
        newSet.delete(categoryId);
      }
      return newSet;
    });

    // ✅ OPTIMISTIC UPDATE: Update URL in background (non-blocking)
    const params = new URLSearchParams(searchParams?.toString() || "");
    
    if (isChecked) {
      const existingCategories = params.get("category")?.split(",").filter(Boolean) || [];
      if (!existingCategories.includes(categoryId)) {
        params.set("category", [...existingCategories, categoryId].join(","));
      }
    } else {
      const existingCategories = params.get("category")?.split(",").filter(Boolean) || [];
      const newCategories = existingCategories.filter((id) => id !== categoryId);

      if (newCategories.length > 0) {
        params.set("category", newCategories.join(","));
      } else {
        params.delete("category");
      }
    }

    // Use startTransition for non-blocking URL update
    scheduleReplace(params);
  };

  // Handle parent category click - toggle all subcategories at once
  const handleParentCategory = (subcategories: Category[], isChecked: boolean) => {
    // ✅ INSTANT UI: Update local state immediately
    const subcategoryIds = subcategories
      .map((sub: any) => sub.id || sub._id)
      .filter(Boolean)
      .map(String);
    
    setSelectedCategories((prev) => {
      const newSet = new Set(prev);
      if (isChecked) {
        subcategoryIds.forEach((id) => newSet.add(id));
      } else {
        subcategoryIds.forEach((id) => newSet.delete(id));
      }
      return newSet;
    });

    // ✅ OPTIMISTIC UPDATE: Update URL in background
    const params = new URLSearchParams(searchParams?.toString() || "");
    const categoryParam = params.get("category");

    if (isChecked) {
      const existingCategories = categoryParam ? categoryParam.split(",").filter(Boolean) : [];
      const newCategories = [...new Set([...existingCategories, ...subcategoryIds])];
      params.set("category", newCategories.join(","));
    } else {
      const existingCategories = categoryParam?.split(",").filter(Boolean) || [];
      const newCategories = existingCategories.filter((id) => !subcategoryIds.includes(id));

      if (newCategories.length > 0) {
        params.set("category", newCategories.join(","));
      } else {
        params.delete("category");
      }
    }

    scheduleReplace(params);
  };

  // ✅ Use local state for instant UI feedback
  const isCategoryChecked = (categoryId: string) => {
    return selectedCategories.has(categoryId);
  };

  // Check if all subcategories are selected for a parent category
  const areAllSubcategoriesChecked = (category: Category) => {
    if (!category.subcategories || category.subcategories.length === 0) {
      return false;
    }
    
    if (selectedCategories.size === 0) {
      return false;
    }
    
    const allSubcategoryIds = category.subcategories
      .map((sub: any) => sub.id || sub._id)
      .filter(Boolean)
      .map(String);
    
    return allSubcategoryIds.every((subId) => selectedCategories.has(subId));
  };

  const getCategoryCount = (category: Category) => {
    if (category.subcategories && category.subcategories.length > 0) {
      return category.subcategories.reduce(
        (sum, sub) => sum + (sub.productCount || 0),
        0
      );
    }
    return category.productCount || 0;
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
          const categoryId = String(category.id || category._id || "");
          // Check if any subcategory is checked - if so, keep parent open
          const hasCheckedSubcategory = hasSubcategories && category.subcategories?.some(
            (sub: any) => {
              const subId = String(sub.id || sub._id || "");
              return isCategoryChecked(subId);
            }
          );
          const isCategoryOpen = openCategories[categoryId] ?? hasCheckedSubcategory ?? false;
          // For parent categories with subcategories, check if ALL subcategories are selected
          // For categories without subcategories, use the normal check
          const isChecked = hasSubcategories
            ? areAllSubcategoriesChecked(category)
            : isCategoryChecked(categoryId);

          return (
            <div key={categoryId} className="flex flex-col gap-2">
              {/* Parent Category */}
              <div className="flex items-center justify-start gap-2">
                <label
                  htmlFor={categoryId}
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
                        handleCategory(categoryId, e.target.checked);
                      }
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                    id={categoryId}
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
                    {category.title} ({getCategoryCount(category)})
                  </span>
                </label>

                {hasSubcategories && (
                  <button
                    type="button"
                    onClick={(e) => toggleCategory(categoryId, e)}
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
                    const subId = String(subcategory.id || subcategory._id || "");
                    const isSubChecked = isCategoryChecked(subId);

                    return (
                      <label
                        htmlFor={subId}
                        key={subId}
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
                                [categoryId]: true,
                              }));
                            }
                            handleCategory(subId, e.target.checked);
                          }}
                          id={subId}
                        />

                        <div
                          aria-hidden
                          className="cursor-pointer flex items-center justify-center rounded-sm w-4 h-4 border peer-checked:border-blue peer-checked:bg-blue bg-white border-gray-3 peer-checked:[&>*]:!block"
                        >
                          <CheckMarkIcon2 className="hidden" />
                        </div>

                        <span className="flex-1 peer-checked:text-blue text-sm">
                          {subcategory.title} ({subcategory.productCount || 0})
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
