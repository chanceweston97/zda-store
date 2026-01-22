/**
 * Global API Request Queue
 * Serializes all API requests to prevent WordPress REST API overload
 * 
 * Features:
 * - One request at a time (no parallel requests)
 * - Request cancellation via AbortController
 * - Request deduplication
 * - Priority-based loading
 */

type QueuedRequest<T> = {
  id: string;
  fn: () => Promise<T>;
  priority: number;
  abortController?: AbortController;
  timestamp: number;
};

class ApiQueue {
  private queue: Promise<any> = Promise.resolve();
  private activeRequest: QueuedRequest<any> | null = null;
  private requestCache = new Map<string, { data: any; timestamp: number; promise?: Promise<any> }>();
  private readonly CACHE_TTL = 60000; // 60 seconds cache for deduplication
  private readonly MAX_CACHE_SIZE = 100;

  /**
   * Enqueue a request - ensures only one request runs at a time
   */
  enqueue<T>(
    fn: () => Promise<T>,
    options?: {
      id?: string;
      priority?: number;
      abortController?: AbortController;
      useCache?: boolean;
      cacheKey?: string;
    }
  ): Promise<T> {
    const requestId = options?.id || `req_${Date.now()}_${Math.random()}`;
    const priority = options?.priority || 0;
    const abortController = options?.abortController;
    const useCache = options?.useCache ?? true;
    const cacheKey = options?.cacheKey || requestId;

    // Check cache first (for deduplication)
    if (useCache && cacheKey) {
      const cached = this.requestCache.get(cacheKey);
      if (cached) {
        const age = Date.now() - cached.timestamp;
        if (age < this.CACHE_TTL) {
          // Return cached promise if still in progress, or cached data
          if (cached.promise) {
            return cached.promise as Promise<T>;
          }
          return Promise.resolve(cached.data) as Promise<T>;
        } else {
          // Cache expired, remove it
          this.requestCache.delete(cacheKey);
        }
      }
    }

    // Create the queued request
    const queuedRequest: QueuedRequest<T> = {
      id: requestId,
      fn: async () => {
        try {
          // Check if aborted before execution
          if (abortController?.signal.aborted) {
            throw new Error("Request aborted");
          }

          const result = await fn();

          // Cache the result
          if (useCache && cacheKey) {
            this.cacheResult(cacheKey, result);
          }

          return result;
        } catch (error: any) {
          // Remove from cache on error
          if (useCache && cacheKey) {
            this.requestCache.delete(cacheKey);
          }

          // Don't throw AbortError if it was intentionally aborted
          if (error?.name === "AbortError" || error?.message === "Request aborted") {
            throw error;
          }

          throw error;
        }
      },
      priority,
      abortController,
      timestamp: Date.now(),
    };

    // Chain the request to the queue
    // IMPORTANT: Each request gets its own promise chain to prevent blocking
    const requestPromise = this.queue
      .then(async () => {
        // Wait for any active request to complete
        if (this.activeRequest && this.activeRequest.id !== requestId) {
          // Check if active request should be aborted (lower priority)
          if (priority > this.activeRequest.priority && this.activeRequest.abortController) {
            this.activeRequest.abortController.abort();
          }
          // Wait for it to finish (catch errors to prevent blocking)
          try {
            await this.activeRequest.fn();
          } catch (error) {
            // Ignore errors from previous requests - don't block the queue
            console.warn("[ApiQueue] Previous request error (ignored):", error);
          }
        }

        // Set as active
        this.activeRequest = queuedRequest;

        try {
          // Execute the request
          const result = await queuedRequest.fn();
          return result;
        } catch (error) {
          // Re-throw error so caller can handle it
          throw error;
        } finally {
          // Clear active request only if it's still this one
          if (this.activeRequest?.id === requestId) {
            this.activeRequest = null;
          }
        }
      })
      .catch((error) => {
        // Clear active request on error
        if (this.activeRequest?.id === requestId) {
          this.activeRequest = null;
        }
        // Re-throw so the caller can handle the error
        throw error;
      });

    // Update queue to continue chain (but don't block on errors)
    this.queue = requestPromise.catch(() => {
      // Ignore errors in queue chain - each request handles its own errors
      return Promise.resolve();
    });

    // Store promise in cache for deduplication (if caching enabled)
    if (useCache && cacheKey) {
      this.requestCache.set(cacheKey, {
        data: null,
        timestamp: Date.now(),
        promise: requestPromise as Promise<T>,
      });
    }

    return requestPromise as Promise<T>;
  }

  /**
   * Cache a result
   */
  private cacheResult(key: string, data: any) {
    // Limit cache size
    if (this.requestCache.size >= this.MAX_CACHE_SIZE) {
      // Remove oldest entry
      const oldestKey = Array.from(this.requestCache.entries())
        .sort((a, b) => a[1].timestamp - b[1].timestamp)[0]?.[0];
      if (oldestKey) {
        this.requestCache.delete(oldestKey);
      }
    }

    this.requestCache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  /**
   * Clear cache for a specific key
   */
  clearCache(key: string) {
    this.requestCache.delete(key);
  }

  /**
   * Clear all cache
   */
  clearAllCache() {
    this.requestCache.clear();
  }

  /**
   * Get current queue status
   */
  getStatus() {
    return {
      hasActiveRequest: !!this.activeRequest,
      activeRequestId: this.activeRequest?.id,
      cacheSize: this.requestCache.size,
    };
  }
}

// Global singleton instance
export const apiQueue = new ApiQueue();

/**
 * Priority levels for requests
 */
export const RequestPriority = {
  MENU: 100, // Highest priority
  CATEGORIES: 90,
  PRODUCTS: 50,
  VARIANTS: 10, // Lowest priority
  FILTERS: 5, // Very low priority (will be debounced)
} as const;
