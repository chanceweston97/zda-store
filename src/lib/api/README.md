# Global API Request Queue

This system serializes all API requests to prevent WordPress REST API overload and 504 errors.

## Features

✅ **Request Serialization** - Only one request runs at a time  
✅ **Request Cancellation** - Outdated requests are automatically cancelled  
✅ **Debouncing** - Filter changes are debounced (300ms)  
✅ **Request Deduplication** - Shared requests (menu, categories) are cached  
✅ **Priority-Based Loading** - Requests execute in priority order:
  1. Menu (highest priority - 100)
  2. Categories (90)
  3. Products (50)
  4. Variants (10)
  5. Filters (5 - lowest priority)

## Usage

### Basic Queued Fetch

```typescript
import { queuedFetch, queuedFetchJson, RequestPriority } from "@/lib/api/queued-fetch";

// Simple fetch
const response = await queuedFetch("/api/products", {
  priority: RequestPriority.PRODUCTS,
});

// JSON fetch
const data = await queuedFetchJson("/api/products", {
  priority: RequestPriority.PRODUCTS,
  useCache: true,
  cacheKey: "products_all",
});
```

### Debounced Fetch (for filters)

```typescript
import { createDebouncedQueuedFetch, RequestPriority } from "@/lib/api/debounced-fetch";

const debouncedFetch = createDebouncedQueuedFetch(300, RequestPriority.FILTERS);

// Rapid calls will be debounced - only the last call executes
const response = await debouncedFetch("/api/products?filter=xyz");
```

### SWR Integration

```typescript
import { swrFetcher, swrFetcherHigh, swrFetcherLow } from "@/lib/api/swr-fetcher";
import useSWR from "swr";

// High priority (menu, categories)
const { data: menu } = useSWR("/api/menu", swrFetcherHigh);

// Medium priority (products)
const { data: products } = useSWR("/api/products", swrFetcher);

// Low priority (filters, variants)
const { data: variants } = useSWR("/api/variants", swrFetcherLow);
```

### WooCommerce API (already integrated)

The `wcFetch` function automatically uses the queue:

```typescript
import { wcFetch } from "@/lib/woocommerce/client";

// This is already queued and prioritized
const products = await wcFetch("/products");
```

## How It Works

1. **Queue System**: All requests go through `apiQueue.enqueue()` which chains promises
2. **Serialization**: Each request waits for the previous one to complete
3. **Cancellation**: AbortController cancels outdated requests
4. **Caching**: Request results are cached for 60 seconds to prevent duplicate calls
5. **Priority**: Higher priority requests can interrupt lower priority ones

## Benefits

- ✅ Prevents WordPress REST API overload
- ✅ Reduces 504 Gateway Timeout errors
- ✅ Improves page load performance (priority-based)
- ✅ Better user experience (debounced filters)
- ✅ Automatic request cancellation (no zombie requests)

## Important Notes

⚠️ **This reduces 504 errors but won't fix WordPress completely** - WordPress is still slow under load, but this prevents burst requests that cause timeouts.

⚠️ **All API calls should use queued fetch** - Direct `fetch()` calls bypass the queue and can still cause overload.
