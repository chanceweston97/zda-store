"use client";
import { Category } from "@/types/category";
import { Product } from "@/types/product";
import { useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { CheckMarkIcon2 } from "@/assets/icons";
import { ChevronDown } from "../Header/icons";

type PropsType = {
  currentCategory: Category;
  allProducts: Product[];
};

const SubcategoryFilter = ({ currentCategory, allProducts }: PropsType) => {
  const [isOpen, setIsOpen] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const subcategories = currentCategory?.subcategories || [];

  if (!subcategories || subcategories.length === 0) {
    return null;
  }

  const handleSubcategoryClick = (subcategoryHandle: string) => {
    // Navigate to the subcategory page
    router.push(`/categories/${subcategoryHandle}`);
  };

  // Count products for each subcategory
  const getSubcategoryProductCount = (subcategory: Category) => {
    const subcategoryId = subcategory.id?.toString() || subcategory._id?.toString();
    const subcategoryHandle = (subcategory as any).handle || subcategory.slug?.current || subcategory.slug;
    
    if (!subcategoryId && !subcategoryHandle) return 0;

    return allProducts.filter((product: any) => {
      if (subcategoryId) {
        const productCategoryIds = product.categories?.map((cat: any) => 
          cat.id?.toString() || cat._id?.toString()
        ).filter(Boolean) || [];
        return productCategoryIds.includes(subcategoryId);
      } else if (subcategoryHandle) {
        const productCategoryHandles = product.categories?.map((cat: any) => 
          (cat as any).handle || cat.slug?.current || cat.slug
        ).filter(Boolean) || [];
        return productCategoryHandles.includes(subcategoryHandle);
      }
      return false;
    }).length;
  };

  return (
    <div className="flex flex-col gap-2.5">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full text-dark font-medium text-base py-2.5"
      >
        <span>Subcategories</span>
        <ChevronDown
          className={`text-dark ease-in-out duration-300 transition-transform ${isOpen && "rotate-180"}`}
        />
      </button>

      {isOpen && (
        <div className="flex flex-col gap-2.5">
          {subcategories.map((subcategory) => {
            const subcategoryHandle = (subcategory as any).handle || subcategory.slug?.current || subcategory.slug;
            const subCount = getSubcategoryProductCount(subcategory);
            const isActive = pathname === `/categories/${subcategoryHandle}`;

            return (
              <button
                key={subcategoryHandle}
                onClick={() => handleSubcategoryClick(subcategoryHandle)}
                className={`flex items-center gap-2.5 p-2 rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-blue text-white' 
                    : 'hover:bg-gray-1 text-dark'
                }`}
              >
                <span className="text-sm">
                  {subcategory.title || subcategory.name} ({subCount})
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SubcategoryFilter;
