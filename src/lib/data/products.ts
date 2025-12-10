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
        console.log("✅ [SERVER] Using region:", region.id, region.name)
      } else {
        console.warn("⚠️ [SERVER] listRegions() returned empty array - trying to fetch products without region_id")
        // Don't throw error yet - try to fetch products without region_id
        // Some Medusa versions might allow this, or we can handle the error from the API
      }
    } catch (error: any) {
      console.error("❌ [SERVER] Error fetching regions in listProducts:", {
        message: error?.message,
        status: error?.response?.status,
        statusText: error?.response?.statusText,
        stack: error?.stack,
      })
      // Continue without region - let the API call fail if region is required
    }
  }

  // Try to fetch products even without region_id - some APIs might work
  // If region_id is truly required, the API will return an error and we'll handle it
  if (!region?.id) {
    const backendUrl = process.env.MEDUSA_BACKEND_URL || "http://localhost:9000"
    console.warn("⚠️ [SERVER] No region available - attempting to fetch products without region_id")
    console.warn("⚠️ [SERVER] If this fails, ensure:")
    console.warn("   1. Backend is accessible at:", backendUrl)
    console.warn("   2. At least one region exists in Medusa Admin")
    console.warn("   3. CORS is configured on backend")
    // Don't throw error - let the API call proceed and handle the error response
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
    ...queryParams,
  }
  
  // Only add region_id if we have it - required for pricing but we'll try without it if needed
  if (region?.id) {
    query.region_id = region.id
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
      const backendUrl = process.env.MEDUSA_BACKEND_URL || "http://localhost:9000"
      const errorDetails = {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        url: `${backendUrl}/store/products`,
        hasRegion: !!region?.id,
        regionId: region?.id,
        errorType: error?.name,
      }
      
      console.error("❌ [SERVER] API Error fetching products:", errorDetails)
      
      // If error is about missing region_id, provide helpful message
      if (error.message?.includes("region") || error.message?.includes("pricing context")) {
        console.error("❌ [SERVER] Region error detected. Troubleshooting:")
        console.error("   1. Check backend is accessible:", backendUrl)
        console.error("   2. Test regions endpoint:", `${backendUrl}/store/regions`)
        console.error("   3. Verify CORS allows requests from frontend server")
        console.error("   4. Check publishable key is set correctly")
        console.error("   5. Ensure at least one region exists in Medusa Admin")
      }
      
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
