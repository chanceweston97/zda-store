"use client"

import { HttpTypes } from "@medusajs/types"
import ProductGridItem from "./ProductGridItem"

type ProductGridProps = {
  products: HttpTypes.StoreProduct[]
  region: HttpTypes.StoreRegion
}

export default function ProductGrid({ products, region }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-xl text-[#4F6866]">No products found.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-7.5 gap-y-9">
      {products.map((product) => (
        <ProductGridItem key={product.id} product={product} region={region} />
      ))}
    </div>
  )
}

