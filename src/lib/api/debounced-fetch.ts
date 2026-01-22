/**
 * Debounced Fetch Utility
 * Prevents rapid API calls from filter changes
 * 
 * Usage:
 * const fetchProducts = debouncedFetch(
 *   (filters) => queuedFetch(`/api/products?${filters}`),
 *   300
 * );
 */

import { queuedFetch, RequestPriority } from "./queued-fetch";

type DebouncedFunction<T extends (...args: any[]) => any> = {
  (...args: Parameters<T>): Promise<ReturnType<T>>;
  cancel: () => void;
  flush: () => Promise<ReturnType<T> | undefined>;
};

/**
 * Create a debounced fetch function
 * Only the last call within the delay period will execute
 */
export function debouncedFetch<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  delay: number = 300
): DebouncedFunction<T> {
  let timeoutId: NodeJS.Timeout | null = null;
  let abortController: AbortController | null = null;
  let lastArgs: Parameters<T> | null = null;
  let pendingPromise: Promise<ReturnType<T>> | null = null;
  let resolvePending: ((value: ReturnType<T>) => void) | null = null;
  let rejectPending: ((error: any) => void) | null = null;

  const debounced = async (...args: Parameters<T>): Promise<ReturnType<T>> => {
    // Cancel previous request
    if (abortController) {
      abortController.abort();
    }

    // Store latest arguments
    lastArgs = args;

    // Clear existing timeout
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    // Create new abort controller for this request
    abortController = new AbortController();

    // Create new promise
    return new Promise<ReturnType<T>>((resolve, reject) => {
      resolvePending = resolve;
      rejectPending = reject;

      // Set timeout
      timeoutId = setTimeout(async () => {
        try {
          // Check if request was cancelled
          if (abortController?.signal.aborted) {
            reject(new Error("Request cancelled"));
            return;
          }

          // Execute the function with latest args
          const result = await fn(...(lastArgs as Parameters<T>));
          
          // Only resolve if this is still the latest request
          if (abortController && !abortController.signal.aborted) {
            resolve(result);
          } else {
            reject(new Error("Request superseded"));
          }
        } catch (error: any) {
          // Only reject if this is still the latest request
          if (abortController && !abortController.signal.aborted) {
            reject(error);
          }
        } finally {
          timeoutId = null;
          if (abortController) {
            abortController = null;
          }
        }
      }, delay);
    });
  };

  // Cancel pending request
  debounced.cancel = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
    if (abortController) {
      abortController.abort();
      abortController = null;
    }
    if (rejectPending) {
      rejectPending(new Error("Debounced request cancelled"));
      rejectPending = null;
      resolvePending = null;
    }
  };

  // Flush pending request (execute immediately)
  debounced.flush = async (): Promise<ReturnType<T> | undefined> => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }

    if (lastArgs && abortController && !abortController.signal.aborted) {
      try {
        const result = await fn(...(lastArgs as Parameters<T>));
        if (resolvePending) {
          resolvePending(result);
        }
        return result;
      } catch (error) {
        if (rejectPending) {
          rejectPending(error);
        }
        throw error;
      } finally {
        abortController = null;
        resolvePending = null;
        rejectPending = null;
      }
    }
    return undefined;
  };

  return debounced;
}

/**
 * Create a debounced queued fetch for filter changes
 */
export function createDebouncedQueuedFetch(
  delay: number = 300,
  priority: number = RequestPriority.FILTERS
) {
  return debouncedFetch(
    async (url: string, options?: any) => {
      return queuedFetch(url, {
        ...options,
        priority: options?.priority || priority,
      });
    },
    delay
  );
}
