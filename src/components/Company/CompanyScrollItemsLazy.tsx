"use client";

import dynamic from "next/dynamic";

const CompanyScrollItems = dynamic(() => import("./CompanyScrollItems"), {
  ssr: false,
  loading: () => (
    <div
      style={{ minHeight: 400, background: "#F1F6FF", borderRadius: 10 }}
      aria-hidden="true"
    />
  ),
});

export default function CompanyScrollItemsLazy() {
  return <CompanyScrollItems />;
}
