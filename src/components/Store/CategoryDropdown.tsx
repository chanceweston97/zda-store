"use client"

import { useState, useMemo, useEffect } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { HttpTypes } from "@medusajs/types"

type CategoryDropdownProps = {
  categories: HttpTypes.StoreProductCategory[]
  allProducts?: HttpTypes.StoreProduct[]
}

export default function CategoryDropdown({ categories, allProducts = [] }: CategoryDropdownProps) {
  const [isOpen, setIsOpen] = useState(true)
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({})
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // Auto-open categories that have checked subcategories
  useEffect(() => {
    const categoryParam = searchParams?.get("category")
    if (categoryParam) {
      const checkedCategories = categoryParam.split(",")
      const newOpenCategories: Record<string, boolean> = {}
      
      categories.forEach((category) => {
        if (category.category_children && category.category_children.length > 0) {
          // Check if any subcategory is checked
          const hasCheckedSubcategory = category.category_children.some(
            (sub: any) => checkedCategories.includes(sub.handle)
          )
          if (hasCheckedSubcategory) {
            newOpenCategories[category.handle] = true
          }
        }
      })
      
      setOpenCategories((prev) => ({ ...prev, ...newOpenCategories }))
    }
  }, [searchParams, categories])

  // Calculate product counts per category
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    
    const countProductsForCategory = (categoryId: string): number => {
      return allProducts.filter((product) => {
        const productCategoryIds = product.categories?.map((cat: any) => cat.id) || []
        return productCategoryIds.includes(categoryId)
      }).length
    }

    const countCategoryProducts = (category: HttpTypes.StoreProductCategory): number => {
      let count = countProductsForCategory(category.id!)
      
      // Add subcategory counts
      if (category.category_children && category.category_children.length > 0) {
        category.category_children.forEach((sub: any) => {
          count += countProductsForCategory(sub.id)
        })
      }
      
      return count
    }

    categories.forEach((category) => {
      if (category.id) {
        counts[category.id] = countCategoryProducts(category)
      }
      // Count subcategories
      if (category.category_children) {
        category.category_children.forEach((sub: any) => {
          if (sub.id) {
            counts[sub.id] = countProductsForCategory(sub.id)
          }
        })
      }
    })

    return counts
  }, [categories, allProducts])

  const toggleCategory = (categoryHandle: string) => {
    setOpenCategories((prev) => ({
      ...prev,
      [categoryHandle]: !prev[categoryHandle],
    }))
  }

  const handleCategory = (categoryHandle: string, isChecked: boolean) => {
    const params = new URLSearchParams(searchParams?.toString() || "")
    const categoryParam = params.get("category")

    if (isChecked) {
      const existingCategories = categoryParam ? categoryParam.split(",").filter(Boolean) : []
      if (!existingCategories.includes(categoryHandle)) {
        params.set("category", [...existingCategories, categoryHandle].join(","))
      }
    } else {
      const existingCategories = categoryParam?.split(",").filter(Boolean) || []
      const newCategories = existingCategories.filter((id) => id !== categoryHandle)

      if (newCategories.length > 0) {
        params.set("category", newCategories.join(","))
      } else {
        params.delete("category")
      }
    }

    router.replace(`${pathname}?${params.toString()}`, { scroll: false })
  }

  // Handle parent category click - toggle all subcategories at once
  const handleParentCategory = (subcategories: any[], isChecked: boolean) => {
    const params = new URLSearchParams(searchParams?.toString() || "")
    const categoryParam = params.get("category")

    if (isChecked) {
      // Add all subcategories
      const subcategoryHandles = subcategories.map((sub) => sub.handle)
      const existingCategories = categoryParam ? categoryParam.split(",").filter(Boolean) : []
      const newCategories = [...new Set([...existingCategories, ...subcategoryHandles])]
      params.set("category", newCategories.join(","))
    } else {
      // Remove all subcategories
      const subcategoryHandles = subcategories.map((sub) => sub.handle)
      const existingCategories = categoryParam?.split(",").filter(Boolean) || []
      const newCategories = existingCategories.filter((id) => !subcategoryHandles.includes(id))

      if (newCategories.length > 0) {
        params.set("category", newCategories.join(","))
      } else {
        params.delete("category")
      }
    }

    router.replace(`${pathname}?${params.toString()}`, { scroll: false })
  }

  const isCategoryChecked = (categoryHandle: string) => {
    const categoryParam = searchParams?.get("category")
    return categoryParam?.split(",").includes(categoryHandle) || false
  }

  // Check if all subcategories are selected for a parent category
  const areAllSubcategoriesChecked = (category: HttpTypes.StoreProductCategory) => {
    if (!category.category_children || category.category_children.length === 0) {
      return false
    }

    const categoryParam = searchParams?.get("category")
    if (!categoryParam) {
      return false
    }

    const checkedCategories = categoryParam.split(",")
    const allSubcategoryHandles = category.category_children.map((sub: any) => sub.handle)

    // Check if ALL subcategories are in the checked categories list
    return allSubcategoryHandles.every((subHandle) => checkedCategories.includes(subHandle))
  }

  const getCategoryProductCount = (category: HttpTypes.StoreProductCategory) => {
    const parentCount = category.id ? categoryCounts[category.id] || 0 : 0
    return parentCount
  }

  if (!categories.length) return null

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`cursor-pointer flex items-center justify-between py-3 pl-6 pr-6 w-full ${
          isOpen && "shadow-sm"
        }`}
      >
        <span className="text-[#2958A4] font-medium">Category</span>
        <svg
          className={`w-5 h-5 text-[#2958A4] transition-transform duration-300 ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      <div
        className={`flex flex-col gap-3 pl-6 pr-5.5 transition-all duration-300 ease-in-out overflow-hidden ${
          isOpen ? "max-h-[2000px] opacity-100 py-6" : "max-h-0 opacity-0 py-0"
        }`}
      >
        {categories.map((category) => {
          const hasSubcategories = category.category_children && category.category_children.length > 0
          // Check if any subcategory is checked - if so, keep parent open
          const hasCheckedSubcategory =
            hasSubcategories &&
            category.category_children?.some((sub: any) => isCategoryChecked(sub.handle))
          const isCategoryOpen = openCategories[category.handle] ?? hasCheckedSubcategory ?? false
          // For parent categories with subcategories, check if ALL subcategories are selected
          // For categories without subcategories, use the normal check
          const isChecked = hasSubcategories
            ? areAllSubcategoriesChecked(category)
            : isCategoryChecked(category.handle)
          const totalProductCount = getCategoryProductCount(category)

          return (
            <div key={category.id} className="flex flex-col gap-2">
              {/* Parent Category */}
              <div className="flex items-center justify-start gap-2">
                <label
                  htmlFor={category.handle}
                  className="flex items-center justify-start gap-2 cursor-pointer group hover:text-[#2958A4] flex-1"
                  onClick={(e) => {
                    e.stopPropagation()
                  }}
                >
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={isChecked}
                    onChange={(e) => {
                      e.stopPropagation()
                      // When parent is clicked, only toggle all subcategories, not the parent itself
                      if (category.category_children && category.category_children.length > 0) {
                        handleParentCategory(category.category_children, e.target.checked)
                      } else {
                        handleCategory(category.handle, e.target.checked)
                      }
                    }}
                    onClick={(e) => {
                      e.stopPropagation()
                    }}
                    id={category.handle}
                  />

                  <div
                    aria-hidden
                    onClick={(e) => {
                      e.stopPropagation()
                    }}
                    className="cursor-pointer flex items-center justify-center rounded-sm w-4 h-4 border peer-checked:border-[#2958A4] peer-checked:bg-[#2958A4] bg-white border-gray-300 peer-checked:[&>*]:!block"
                  >
                    <svg
                      className="hidden w-3 h-3 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>

                  <span
                    onClick={(e) => {
                      e.stopPropagation()
                    }}
                    className="peer-checked:text-[#2958A4]"
                  >
                    {category.name} ({totalProductCount})
                  </span>
                </label>

                {hasSubcategories && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      toggleCategory(category.handle)
                    }}
                    className="px-6 py-1 hover:bg-gray-100 rounded flex-shrink-0"
                    aria-label="Toggle subcategories"
                  >
                    <svg
                      className={`w-5 h-5 text-black transition-transform duration-300 ease-in-out ${
                        isCategoryOpen ? "rotate-180" : ""
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>
                )}
              </div>

              {/* Subcategories */}
              {hasSubcategories && (
                <div
                  className={`flex flex-col gap-2 pl-6 overflow-hidden transition-all duration-300 ease-in-out ${
                    isCategoryOpen ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"
                  }`}
                >
                  {category.category_children?.map((subcategory: any) => {
                    const isSubChecked = isCategoryChecked(subcategory.handle)
                    const subCount = subcategory.id ? categoryCounts[subcategory.id] || 0 : 0

                    return (
                      <label
                        htmlFor={subcategory.handle}
                        key={subcategory.id}
                        className="flex items-center justify-start gap-2 cursor-pointer group hover:text-[#2958A4]"
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
                                [category.handle]: true,
                              }))
                            }
                            handleCategory(subcategory.handle, e.target.checked)
                          }}
                          id={subcategory.handle}
                        />

                        <div
                          aria-hidden
                          className="cursor-pointer flex items-center justify-center rounded-sm w-4 h-4 border peer-checked:border-[#2958A4] peer-checked:bg-[#2958A4] bg-white border-gray-300 peer-checked:[&>*]:!block"
                        >
                          <svg
                            className="hidden w-3 h-3 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={3}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </div>

                        <span className="flex-1 peer-checked:text-[#2958A4] text-sm">
                          {subcategory.name} ({subCount})
                        </span>
                      </label>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
