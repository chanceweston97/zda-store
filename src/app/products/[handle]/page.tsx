import { Metadata } from "next"
import { notFound } from "next/navigation"
import { listProducts } from "@lib/data/products"
import { getRegion, listRegions } from "@lib/data/regions"
import ProductTemplate from "@modules/products/templates"
import { HttpTypes } from "@medusajs/types"

type Props = {
  params: Promise<{ handle: string }>
  searchParams: Promise<{ v_id?: string }>
}

function getImagesForVariant(
  product: HttpTypes.StoreProduct,
  selectedVariantId?: string
) {
  if (!selectedVariantId || !product.variants) {
    return product.images
  }

  const variant = product.variants!.find((v) => v.id === selectedVariantId)
  if (!variant || !variant.images.length) {
    return product.images
  }

  const imageIdsMap = new Map(variant.images.map((i) => [i.id, true]))
  return product.images!.filter((i) => imageIdsMap.has(i.id))
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params
  const { handle } = params
  
  // Try to get region - first try "us", then try first available region
  let region = await getRegion("us")
  
  if (!region) {
    try {
      const regions = await listRegions()
      if (regions && regions.length > 0) {
        region = regions[0]
      }
    } catch (error) {
      console.error("Error fetching regions:", error)
    }
  }

  if (!region) {
    notFound()
  }

  const countryCode = region.countries?.[0]?.iso_2?.toLowerCase() || "us"

  const product = await listProducts({
    countryCode: countryCode,
    queryParams: { handle },
  }).then(({ response }) => response.products[0])

  if (!product) {
    notFound()
  }

  return {
    title: `${product.title} | ZDAComm`,
    description: `${product.title}`,
    openGraph: {
      title: `${product.title} | ZDAComm`,
      description: `${product.title}`,
      images: product.thumbnail ? [product.thumbnail] : [],
    },
  }
}

export default async function ProductPage(props: Props) {
  const params = await props.params
  const searchParams = await props.searchParams

  const selectedVariantId = (await searchParams).v_id

  // Try to get region - first try "us", then try first available region
  let region = await getRegion("us")
  
  if (!region) {
    try {
      const regions = await listRegions()
      if (regions && regions.length > 0) {
        region = regions[0]
      }
    } catch (error) {
      console.error("Error fetching regions:", error)
    }
  }

  if (!region) {
    notFound()
  }

  const countryCode = region.countries?.[0]?.iso_2?.toLowerCase() || "us"

  const pricedProduct = await listProducts({
    countryCode: countryCode,
    queryParams: { handle: params.handle },
  }).then(({ response }) => response.products[0])

  const images = getImagesForVariant(pricedProduct, selectedVariantId)

  if (!pricedProduct) {
    notFound()
  }

  return (
    <ProductTemplate
      product={pricedProduct}
      region={region}
      countryCode={countryCode}
      images={images}
    />
  )
}

