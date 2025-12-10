"use server"

import { sdk } from "@lib/config"
import medusaError from "@lib/util/medusa-error"
import { HttpTypes } from "@medusajs/types"
import { getCacheOptions, getStoreHeaders } from "./cookies"

export const listRegions = async () => {
  const next = {
    ...(await getCacheOptions("regions")),
  }

  const backendUrl = process.env.MEDUSA_BACKEND_URL || "http://localhost:9000"
  
  try {
    const headers = await getStoreHeaders()
    
    // Add more detailed logging for debugging
    if (process.env.NODE_ENV === "development") {
      console.log("🔍 [SERVER] Fetching regions from:", `${backendUrl}/store/regions`)
      console.log("🔍 [SERVER] Publishable key set:", !!process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY)
    }
    
    const response = await sdk.client.fetch<{ regions: HttpTypes.StoreRegion[] }>(`/store/regions`, {
      method: "GET",
      headers,
      next,
      cache: "no-store", // Use no-store for server-side to avoid stale cache issues
    })
    
    if (!response || !response.regions || response.regions.length === 0) {
      console.error("❌ [SERVER] listRegions: No regions found in response from", `${backendUrl}/store/regions`)
      console.error("❌ [SERVER] Response:", JSON.stringify(response, null, 2))
      return []
    }
    
    return response.regions
  } catch (error: any) {
    const errorDetails = {
      message: error?.message,
      status: error?.response?.status,
      statusText: error?.response?.statusText,
      url: `${backendUrl}/store/regions`,
      publishableKey: process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY ? `${process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY.substring(0, 20)}...` : "NOT SET",
      backendUrl: backendUrl,
      errorType: error?.name,
      stack: error?.stack,
    }
    
    console.error("❌ [SERVER] Error in listRegions:", errorDetails)
    
    // If it's a network/CORS error, return empty array instead of throwing
    // This allows the app to continue and try to work without regions
    if (error?.message?.includes("fetch failed") || 
        error?.message?.includes("CORS") ||
        error?.code === "ECONNREFUSED" ||
        error?.code === "ENOTFOUND") {
      console.error("❌ [SERVER] Network/CORS error - backend may not be accessible from frontend server")
      console.error("❌ [SERVER] Check that:")
      console.error("   1. Backend is running and accessible at:", backendUrl)
      console.error("   2. CORS is configured on backend to allow requests from frontend server")
      console.error("   3. Firewall/security groups allow connections between frontend and backend")
      return []
    }
    
    throw medusaError(error)
  }
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
      if (region.countries && region.countries.length > 0) {
        // Map countries to region
        region.countries.forEach((c) => {
          const iso2 = c?.iso_2?.toLowerCase() ?? ""
          if (iso2) {
            regionMap.set(iso2, region)
          }
        })
      } else {
        // If region has no countries, map common country codes to it
        // This handles cases where regions exist but have no countries assigned
        console.warn("⚠️ [SERVER] Region has no countries assigned:", region.id, region.name)
        // Map "us" to this region as a fallback
        if (!regionMap.has("us")) {
          regionMap.set("us", region)
        }
      }
    })

    // Try to get region by normalized country code
    let region = normalizedCode ? regionMap.get(normalizedCode) : null
    
    // If not found, try to get first available region as fallback
    // This handles cases where regions exist but have no countries
    if (!region && regions.length > 0) {
      region = regions[0]
      console.log("✅ [SERVER] Using first available region (no countries mapped):", region.id, region.name)
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
