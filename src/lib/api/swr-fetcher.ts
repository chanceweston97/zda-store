/**
 * SWR Fetcher using Queued Fetch
 * Use this with useSWR for automatic request serialization
 */

import { queuedFetchJson, RequestPriority } from "./queued-fetch";

/**
 * Create a SWR fetcher with priority
 */
export function createSwrFetcher(priority: number = RequestPriority.PRODUCTS) {
  return async (url: string) => {
    return queuedFetchJson(url, { priority });
  };
}

/**
 * Default SWR fetcher (medium priority)
 */
export const swrFetcher = createSwrFetcher(RequestPriority.PRODUCTS);

/**
 * High priority fetcher (for menu, categories)
 */
export const swrFetcherHigh = createSwrFetcher(RequestPriority.CATEGORIES);

/**
 * Low priority fetcher (for filters, variants)
 */
export const swrFetcherLow = createSwrFetcher(RequestPriority.FILTERS);
