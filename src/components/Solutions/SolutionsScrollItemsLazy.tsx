"use client";

import dynamic from "next/dynamic";

const SolutionsScrollItems = dynamic(() => import("./SolutionsScrollItems"), {
  ssr: false,
  loading: () => (
    <div
      style={{ minHeight: 400, background: "#F1F6FF", borderRadius: 10 }}
      aria-hidden="true"
    />
  ),
});

export default function SolutionsScrollItemsLazy() {
  return <SolutionsScrollItems />;
}
