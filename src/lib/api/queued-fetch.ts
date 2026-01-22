/**
 * Queued Fetch Wrapper
 * All API requests should use this instead of direct fetch()
 * 
 * Features:
 * - Serialized requests (one at a time)
 * - Automatic request cancellation
 * - Request deduplication
 * - Priority-based execution
 */

import { apiQueue, RequestPriority } from "./queue";

export interface QueuedFetchOptions extends RequestInit {
  priority?: number;
  useCache?: boolean;
  cacheKey?: string;
  timeout?: number;
}

// Track active requests for cancellation
const activeRequests = new Map<string, AbortController>();

/**
 * Queued fetch - serializes all requests
 */
export async function queuedFetch(
  url: string,
  options: QueuedFetchOptions = {}
): Promise<Response> {
  const {
    priority = RequestPriority.PRODUCTS,
    useCache = true,
    cacheKey,
    timeout = 10000,
    signal: externalSignal,
    ...fetchOptions
  } = options;

  // Generate cache key if not provided
  const requestCacheKey = cacheKey || `fetch_${url}_${JSON.stringify(fetchOptions)}`;

  // Create abort controller for this request
  const abortController = new AbortController();
  const requestId = `req_${Date.now()}_${Math.random()}`;

  // Combine abort signals
  if (externalSignal) {
    externalSignal.addEventListener("abort", () => {
      abortController.abort();
    });
  }

  // Set timeout
  const timeoutId = setTimeout(() => {
    abortController.abort();
  }, timeout);

  // Store for potential cancellation
  activeRequests.set(requestId, abortController);

  try {
    const response = await apiQueue.enqueue(
      async () => {
        // Check if already aborted
        if (abortController.signal.aborted) {
          throw new Error("Request aborted");
        }

        const response = await fetch(url, {
          ...fetchOptions,
          signal: abortController.signal,
        });

        clearTimeout(timeoutId);
        return response;
      },
      {
        id: requestId,
        priority,
        abortController,
        useCache,
        cacheKey: requestCacheKey,
      }
    );

    activeRequests.delete(requestId);
    return response;
  } catch (error: any) {
    activeRequests.delete(requestId);
    clearTimeout(timeoutId);

    // Handle abort errors gracefully
    if (error?.name === "AbortError" || error?.message?.includes("aborted")) {
      const abortError = new Error("Request was cancelled");
      (abortError as any).name = "AbortError";
      throw abortError;
    }

    throw error;
  }
}

/**
 * Cancel a specific request by URL pattern
 */
export function cancelRequest(urlPattern: string | RegExp) {
  for (const [id, controller] of activeRequests.entries()) {
    if (typeof urlPattern === "string" && id.includes(urlPattern)) {
      controller.abort();
      activeRequests.delete(id);
    } else if (urlPattern instanceof RegExp && urlPattern.test(id)) {
      controller.abort();
      activeRequests.delete(id);
    }
  }
}

/**
 * Cancel all active requests
 */
export function cancelAllRequests() {
  for (const controller of activeRequests.values()) {
    controller.abort();
  }
  activeRequests.clear();
}

/**
 * Get JSON from queued fetch
 */
export async function queuedFetchJson<T>(
  url: string,
  options: QueuedFetchOptions = {}
): Promise<T> {
  const response = await queuedFetch(url, options);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
}
