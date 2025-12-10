"use server"

import { sdk } from "@lib/config"
import medusaError from "@lib/util/medusa-error"
import { HttpTypes } from "@medusajs/types"
import { getCacheOptions, getStoreHeaders } from "./cookies"

export const listRegions = async () => {
  const next = {
    ...(await getCacheOptions("regions")),
  }

  return sdk.client
    .fetch<{ regions: HttpTypes.StoreRegion[] }>(`/store/regions`, {
      method: "GET",
      headers: await getStoreHeaders(),
      next,
      cache: "force-cache",
    })
    .then(({ regions }) => regions)
    .catch(medusaError)
}

export const retrieveRegion = async (id: string) => {
  const next = {
    ...(await getCacheOptions(["regions", id].join("-"))),
  }

  return sdk.client
    .fetch<{ region: HttpTypes.StoreRegion }>(`/store/regions/${id}`, {
      method: "GET",
      headers: await getStoreHeaders(),
      next,
      cache: "force-cache",
    })
    .then(({ region }) => region)
    .catch(medusaError)
}

const regionMap = new Map<string, HttpTypes.StoreRegion>()

export const getRegion = async (countryCode: string) => {
  try {
    // Normalize country code to lowercase
    const normalizedCode = countryCode?.toLowerCase() || "us"
    
    if (regionMap.has(normalizedCode)) {
      return regionMap.get(normalizedCode)
    }

    const regions = await listRegions()

    if (!regions || regions.length === 0) {
      return null
    }

    // Build region map with lowercase keys
    regions.forEach((region) => {
      region.countries?.forEach((c) => {
        const iso2 = c?.iso_2?.toLowerCase() ?? ""
        if (iso2) {
          regionMap.set(iso2, region)
        }
      })
    })

    // Try to get region by normalized country code
    let region = normalizedCode ? regionMap.get(normalizedCode) : null
    
    // If not found, try to get first available region as fallback
    if (!region && regions.length > 0) {
      region = regions[0]
    }

    return region
  } catch (e: any) {
    // On error, try to return first available region
    try {
      const regions = await listRegions()
      if (regions && regions.length > 0) {
        return regions[0]
      }
    } catch {
      // Ignore fallback error
    }
    return null
  }
}
