"use server"

import { sdk } from "@lib/config"
import { sortProducts } from "@lib/util/sort-products"
import { HttpTypes } from "@medusajs/types"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import { getAuthHeaders, getCacheOptions } from "./cookies"
import { getRegion, retrieveRegion, listRegions } from "./regions"

export const listProducts = async ({
  pageParam = 1,
  queryParams,
  countryCode,
  regionId,
}: {
  pageParam?: number
  queryParams?: HttpTypes.FindParams & HttpTypes.StoreProductListParams
  countryCode?: string
  regionId?: string
}): Promise<{
  response: { products: HttpTypes.StoreProduct[]; count: number }
  nextPage: number | null
  queryParams?: HttpTypes.FindParams & HttpTypes.StoreProductListParams
}> => {
  const limit = queryParams?.limit || 12
  const _pageParam = Math.max(pageParam, 1)
  const offset = _pageParam === 1 ? 0 : (_pageParam - 1) * limit

  let region: HttpTypes.StoreRegion | undefined | null = null

  // Always try to get a region - required for price calculations
  if (countryCode || regionId) {
    if (countryCode) {
      region = await getRegion(countryCode)
    } else if (regionId) {
      region = await retrieveRegion(regionId)
    }
  }
  
  // If no region found yet, try to get first available region as fallback
  if (!region) {
    try {
      const regions = await listRegions()
      if (regions && regions.length > 0) {
        region = regions[0]
      } else {
        console.error("❌ [SERVER] listRegions() returned empty array or null")
      }
    } catch (error: any) {
      console.error("❌ [SERVER] Error fetching regions in listProducts:", {
        message: error?.message,
        status: error?.response?.status,
        statusText: error?.response?.statusText,
        stack: error?.stack,
      })
      // If we still can't get a region, we'll throw an error below
    }
  }

  // region_id is required for price calculations - throw error if we don't have it
  if (!region?.id) {
    const backendUrl = process.env.MEDUSA_BACKEND_URL || "http://localhost:9000"
    const errorMessage = `Unable to determine region for product pricing. Please ensure at least one region is configured in your Medusa backend at ${backendUrl}. Check that:
1. At least one region exists in Medusa Admin
2. The region has at least one country assigned
3. Your backend is accessible from the frontend
4. CORS is properly configured on your backend`
    console.error("❌ [SERVER]", errorMessage)
    throw new Error(errorMessage)
  }

  const headers = {
    ...(await getAuthHeaders()),
  }

  const next = {
    ...(await getCacheOptions("products")),
  }

  const query: any = {
    limit,
    offset,
    fields:
      "*variants.calculated_price,+variants.inventory_quantity,*variants.images,+metadata,*tags,",
    region_id: region.id, // Always include region_id - required for pricing
    ...queryParams,
  }

  return sdk.client
    .fetch<{ products: HttpTypes.StoreProduct[]; count: number }>(
      `/store/products`,
      {
        method: "GET",
        query,
        headers,
        next,
        cache: "force-cache",
      }
    )
    .then(({ products, count }) => {
      const nextPage = count > offset + limit ? pageParam + 1 : null

      return {
        response: {
          products,
          count,
        },
        nextPage: nextPage,
        queryParams,
      }
    })
    .catch((error: any) => {
      throw error
    })
}

/**
 * This will fetch 100 products to the Next.js cache and sort them based on the sortBy parameter.
 * It will then return the paginated products based on the page and limit parameters.
 */
export const listProductsWithSort = async ({
  page = 0,
  queryParams,
  sortBy = "created_at",
  countryCode,
}: {
  page?: number
  queryParams?: HttpTypes.FindParams & HttpTypes.StoreProductParams
  sortBy?: SortOptions
  countryCode: string
}): Promise<{
  response: { products: HttpTypes.StoreProduct[]; count: number }
  nextPage: number | null
  queryParams?: HttpTypes.FindParams & HttpTypes.StoreProductParams
}> => {
  const limit = queryParams?.limit || 12

  const {
    response: { products, count },
  } = await listProducts({
    pageParam: 0,
    queryParams: {
      ...queryParams,
      limit: 100,
    },
    countryCode,
  })

  const sortedProducts = sortProducts(products, sortBy)

  const pageParam = (page - 1) * limit

  const nextPage = count > pageParam + limit ? pageParam + limit : null

  const paginatedProducts = sortedProducts.slice(pageParam, pageParam + limit)

  return {
    response: {
      products: paginatedProducts,
      count,
    },
    nextPage,
    queryParams,
  }
}
