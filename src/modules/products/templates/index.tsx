import React from "react"

import { notFound } from "next/navigation"
import { HttpTypes } from "@medusajs/types"
import ShopDetails from "@components/Product/ShopDetails"

type ProductTemplateProps = {
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
  countryCode: string
  images: HttpTypes.StoreProductImage[]
}

const ProductTemplate: React.FC<ProductTemplateProps> = ({
  product,
  region,
  countryCode,
  images,
}) => {
  if (!product || !product.id) {
    return notFound()
  }

  return <ShopDetails product={product} region={region} images={images} />
}

export default ProductTemplate
