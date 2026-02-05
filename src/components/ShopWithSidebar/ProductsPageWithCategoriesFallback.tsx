"use client";

import { useEffect, useState } from "react";
import ExploreMore from "@/components/Company/ExploreMore";
import ShopWithSidebar from "./index";
import Newsletter from "@/components/Common/Newsletter";
import { Category } from "@/types/category";
import { Product } from "@/types/product";

type Data = {
  products: Product[];
  categories: Category[];
  totalCount: number;
  currentCategory?: Category | null;
};

type Props = {
  initialData: Data;
  categoryName?: string;
};

/**
 * Wraps ShopWithSidebar and adds client-side categories fallback.
 * When SSR returns empty categories (e.g. on Vercel due to env or cold start),
 * this fetches /api/categories so the sidebar still shows categories.
 */
export default function ProductsPageWithCategoriesFallback({
  initialData,
  categoryName,
}: Props) {
  const [data, setData] = useState<Data>(initialData);

  useEffect(() => {
    if (initialData.categories.length === 0) {
      fetch("/api/categories")
        .then((res) => res.json())
        .then((json: { categories?: Category[] }) => {
          if (Array.isArray(json?.categories) && json.categories.length > 0) {
            setData((prev) => ({ ...prev, categories: json.categories! }));
          }
        })
        .catch((err) => console.warn("[ProductsPage] Categories fallback fetch failed:", err));
    }
  }, [initialData.categories.length]);

  return (
    <>
      <ShopWithSidebar data={data} categoryName={categoryName} />
      <ExploreMore />
      <Newsletter />
    </>
  );
}
