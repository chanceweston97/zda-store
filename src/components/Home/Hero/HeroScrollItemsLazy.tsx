"use client";

import dynamic from "next/dynamic";
import type { HomeOfferingItem } from "@/lib/wordpress/home-offering-items";

const HeroScrollItems = dynamic(() => import("./HeroScrollItems"), {
  ssr: false,
  loading: () => (
    <div
      style={{ minHeight: 450, background: "#F1F6FF", borderRadius: 10 }}
      aria-hidden="true"
    />
  ),
});

interface Props {
  items?: HomeOfferingItem[] | null;
}

export default function HeroScrollItemsLazy({ items }: Props) {
  return <HeroScrollItems items={items} />;
}
