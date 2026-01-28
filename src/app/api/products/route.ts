import { NextResponse } from "next/server";
import { fetchWithTimeout } from "@/lib/fetch-with-timeout";
import { unstable_cache } from "next/cache";

type WooCommerceProduct = {
  id: number;
  name: string;
  slug: string;
  sku?: string;
  price?: string;
  regular_price?: string;
  sale_price?: string;
  images?: Array<{ src: string }>;
  categories?: Array<{ id: number; name: string; slug: string }>;
  variations?: number[];
  meta_data?: Array<{ key: string; value: any }>;
  status?: string;
  catalog_visibility?: "visible" | "catalog" | "search" | "hidden";
};

const parsePrice = (value?: string) => {
  if (!value) return 0;
  const num = parseFloat(value);
  return Number.isFinite(num) ? num : 0;
};

// Core function that fetches from WooCommerce (will be cached)
const getProductsFromWoo = async (query: string) => {
  const apiUrl =
    process.env.WC_API_URL ||
    process.env.NEXT_PUBLIC_WC_API_URL ||
    "";
  const consumerKey =
    process.env.WC_CONSUMER_KEY ||
    process.env.NEXT_PUBLIC_WC_CONSUMER_KEY ||
    "";
  const consumerSecret =
    process.env.WC_CONSUMER_SECRET ||
    process.env.NEXT_PUBLIC_WC_CONSUMER_SECRET ||
    "";

  if (!apiUrl || !consumerKey || !consumerSecret) {
    throw new Error("WooCommerce API not configured");
  }

  const url = `${apiUrl}/products${query}`;
  const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString("base64");

  const wooTimerLabel = `[WooCommerce] ${query}|${Date.now()}`;
  console.time(wooTimerLabel);
  const res = await fetchWithTimeout(
    url,
    {
      headers: {
        Authorization: `Basic ${auth}`,
      },
      next: { revalidate: 60 }, // 60 seconds
    },
    3000 // 3 second timeout
  );
  console.timeEnd(wooTimerLabel);

  if (!res.ok) {
    throw new Error(`WooCommerce API failed: ${res.status} ${res.statusText}`);
  }

  return res.json();
};

// Cache for 60 seconds - WooCommerce called max once per minute per query
// 🔥 FIX: Each unique query (Category A vs B, Page 1 vs 2) gets its own cache entry
// unstable_cache automatically uses function arguments as part of the cache key
export const getCachedProducts = async (query: string) => {
  return unstable_cache(
    async () => getProductsFromWoo(query),
    ["woo-products", query], // Include query in keyParts for explicit per-query caching
    {
      revalidate: 60, // seconds - WooCommerce called max once per minute
    }
  )();
};

const WOO_ENABLED = (process.env.WOO_ENABLED || "true").toLowerCase() !== "false";

export async function GET(req: Request) {
  const apiTimerLabel = `api/products|${Date.now()}`;
  console.time(apiTimerLabel);
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category") || "";
  const page = searchParams.get("page") || "1";
  const perPage = searchParams.get("per_page") || "12";

  if (!WOO_ENABLED) {
    console.timeEnd(apiTimerLabel);
    return NextResponse.json(
      { products: [], totalCount: 0, allCount: 0, _cached: false, _error: "woo_disabled" },
      { status: 200, headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } }
    );
  }

  const apiUrl =
    process.env.WC_API_URL ||
    process.env.NEXT_PUBLIC_WC_API_URL ||
    "";
  const consumerKey =
    process.env.WC_CONSUMER_KEY ||
    process.env.NEXT_PUBLIC_WC_CONSUMER_KEY ||
    "";
  const consumerSecret =
    process.env.WC_CONSUMER_SECRET ||
    process.env.NEXT_PUBLIC_WC_CONSUMER_SECRET ||
    "";

  if (!apiUrl || !consumerKey || !consumerSecret) {
    console.timeEnd(apiTimerLabel);
    return NextResponse.json(
      { products: [], totalCount: 0, allCount: 0, _cached: false, _error: "woo_not_configured" },
      { status: 200, headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } }
    );
  }

  try {

    const fetchCategoryIdsExcludingUncategorized = async (): Promise<string[]> => {
      try {
        const categoryParams = new URLSearchParams({
          consumer_key: consumerKey,
          consumer_secret: consumerSecret,
          per_page: "100",
          _fields: "id,slug",
        });
        const categoryRes = await fetchWithTimeout(
          `${apiUrl}/products/categories?${categoryParams.toString()}`,
          {
            next: { revalidate: 3600, tags: ["wc-categories"] }, // 1 hour cache
          },
          3000 // 3 second timeout
        );
        if (!categoryRes.ok) return [];
        const categories = (await categoryRes.json()) as Array<{ id: number; slug: string }>;
        return categories
          .filter((cat) => cat.slug !== "uncategorized")
          .map((cat) => String(cat.id));
      } catch (error) {
        // Swallow errors - return empty array to prevent page crash
        console.error("[API /products] Error fetching categories:", error);
        return [];
      }
    };

    const categoryFilterIds = await fetchCategoryIdsExcludingUncategorized();

    const hasCategoryFilter = Boolean(category);
    const categoryFilterParam = hasCategoryFilter
      ? category
      : categoryFilterIds.length > 0
      ? categoryFilterIds.join(",")
      : "";

    const fetchShowableCount = async (categoryParam?: string): Promise<number> => {
      const baseParams = new URLSearchParams({
        consumer_key: consumerKey,
        consumer_secret: consumerSecret,
        per_page: "1",
        page: "1",
        _fields: "id",
        status: "publish",
      });
      if (categoryParam) {
        baseParams.append("category", categoryParam);
      }

      const fetchCount = async (visibility?: "visible" | "catalog" | "hidden" | "search") => {
        try {
          const params = new URLSearchParams(baseParams);
          if (visibility) {
            params.append("catalog_visibility", visibility);
          }
          const res = await fetchWithTimeout(
            `${apiUrl}/products?${params.toString()}`,
            {
              next: { revalidate: 300, tags: ["wc-products"] }, // 5 min cache
            },
            3000 // 3 second timeout
          );
          if (!res.ok) return 0;
          return Number(res.headers.get("X-WP-Total") || 0);
        } catch (error) {
          // Swallow errors - return 0 to prevent page crash
          console.error(`[API /products] fetchCount error for visibility ${visibility}:`, error);
          return 0;
        }
      };

      // CRITICAL FIX: Sequential requests instead of parallel to prevent WordPress overload
      // One request at a time reduces MySQL pressure
      const totalPublished = await fetchCount();
      const visibleCount = await fetchCount("visible");
      const catalogCount = await fetchCount("catalog");
      const hiddenCount = await fetchCount("hidden");
      const searchCount = await fetchCount("search");

      if (!totalPublished) return 0;

      const visibilityIgnored =
        visibleCount === totalPublished && catalogCount === totalPublished;

      if (visibilityIgnored) {
        const hiddenIgnored = hiddenCount === totalPublished;
        const searchIgnored = searchCount === totalPublished;
        if (!hiddenIgnored || !searchIgnored) {
          const adjustedHidden = hiddenIgnored ? 0 : hiddenCount;
          const adjustedSearch = searchIgnored ? 0 : searchCount;
          return Math.max(totalPublished - adjustedHidden - adjustedSearch, 0);
        }
        return totalPublished;
      }

      return visibleCount + catalogCount;
    };

    // Build query string for cached fetch
    const queryParams = new URLSearchParams({
      consumer_key: consumerKey,
      consumer_secret: consumerSecret,
      per_page: perPage,
      page,
      _fields:
        "id,name,price,regular_price,sale_price,slug,images,categories,sku,variations,meta_data,status,catalog_visibility",
      status: "publish",
    });

    if (categoryFilterParam) {
      queryParams.append("category", categoryFilterParam);
    }

    const query = `?${queryParams.toString()}`;
    
    // Use cached function - WooCommerce called max once per minute per unique query
    // Each category/page combination is cached separately for instant filtering
    const wcProducts = (await getCachedProducts(query)) as WooCommerceProduct[];
    
    // Log all products for debugging
    console.log(`[API /products] Total products from WooCommerce: ${wcProducts.length}`);
    wcProducts.forEach((p) => {
      console.log(`[API /products] Product: ${p.name} | Status: ${p.status} | Visibility: ${p.catalog_visibility}`);
    });
    
    const visibleProducts = wcProducts.filter((product) => {
      // Normalize visibility value to lowercase for case-insensitive comparison
      const visibility = (product.catalog_visibility || "").toLowerCase();
      
      const isVisible =
        visibility !== "hidden" &&
        visibility !== "search" &&
        product.status !== "private" &&
        product.status !== "draft";
      const hasCategory =
        (product.categories?.length || 0) > 0 &&
        !product.categories?.some((cat) => cat.slug === "uncategorized");
      const shouldShow = isVisible && hasCategory;
      
      if (!shouldShow) {
        console.log(`[API /products] FILTERED OUT: ${product.name} | Status: ${product.status} | Visibility: ${product.catalog_visibility} (normalized: ${visibility}) | isVisible: ${isVisible} | hasCategory: ${hasCategory}`);
      }
      
      return shouldShow;
    });
    
    console.log(`[API /products] Visible products after filtering: ${visibleProducts.length}`);
    
    // ✅ FIX: Never block UI on slow count operations
    // Return products immediately, calculate counts with fallback
    // Default to visible products length - accurate enough for UI
    let totalCount: number = visibleProducts.length;
    let allCount: number = visibleProducts.length;
    
    // Try to get accurate counts, but use fallback if slow (never block)
    const getCountWithFallback = async (countFn: () => Promise<number>, fallback: number): Promise<number> => {
      try {
        return await Promise.race([
          countFn(),
          new Promise<number>((resolve) => setTimeout(() => resolve(fallback), 1500)) // 1.5s timeout
        ]);
      } catch {
        return fallback;
      }
    };
    
    if (hasCategoryFilter) {
      // For category-specific requests, try to get accurate count (non-blocking)
      totalCount = await getCountWithFallback(
        () => fetchShowableCount(categoryFilterParam || undefined),
        visibleProducts.length
      );
      
      // Try to get global count for allCount (non-blocking)
      allCount = await getCountWithFallback(
        () => fetchShowableCount(categoryFilterIds.length > 0 ? categoryFilterIds.join(",") : undefined),
        visibleProducts.length
      );
    } else {
      // For "all products", visible count is accurate
      totalCount = visibleProducts.length;
      
      // Try to get accurate allCount, but don't block
      try {
        const allProductsParams = new URLSearchParams({
          consumer_key: consumerKey,
          consumer_secret: consumerSecret,
          per_page: "100",
          _fields: "id,categories,status,catalog_visibility",
          status: "publish",
        });
        if (categoryFilterIds.length > 0) {
          allProductsParams.append("category", categoryFilterIds.join(","));
        }
        
        const allProductsRes = await Promise.race([
          fetchWithTimeout(
            `${apiUrl}/products?${allProductsParams.toString()}`,
            {
              next: { revalidate: 300, tags: ["wc-products"] },
            },
            1500 // 1.5 second timeout for counts
          ),
          new Promise<Response>((resolve) => {
            setTimeout(() => resolve(new Response(JSON.stringify([]), { status: 200 })), 1500);
          })
        ]);
        
        if (allProductsRes && allProductsRes.ok) {
          const allProducts = (await allProductsRes.json()) as WooCommerceProduct[];
          allCount = allProducts.filter((product) => {
            const visibility = (product.catalog_visibility || "").toLowerCase();
            const isVisible =
              visibility !== "hidden" &&
              visibility !== "search" &&
              product.status !== "private" &&
              product.status !== "draft";
            const hasCategory =
              (product.categories?.length || 0) > 0 &&
              !product.categories?.some((cat) => cat.slug === "uncategorized");
            return isVisible && hasCategory;
          }).length;
        }
      } catch (countError) {
        // Use fallback - don't block on count errors
        console.warn("[API /products] Count calculation slow/failed, using fallback:", countError);
      }
    }

    const fetchFirstVariationSku = async (
      productId: number
    ): Promise<string | null> => {
      try {
        const variationParams = new URLSearchParams({
          consumer_key: consumerKey,
          consumer_secret: consumerSecret,
          per_page: "1",
          page: "1",
          orderby: "id",
          order: "asc",
          _fields: "sku",
        });
        
        const variationRes = await fetchWithTimeout(
          `${apiUrl}/products/${productId}/variations?${variationParams.toString()}`,
          { 
            next: { revalidate: 300, tags: ["wc-products"] }, // 5 min cache
          },
          3000 // 3 second timeout
        );
        
        if (!variationRes.ok) return null;
        const variations = (await variationRes.json()) as Array<{ sku?: string }>;
        const sku = variations?.[0]?.sku?.trim();
        return sku || null;
      } catch (error) {
        // Silently fail - don't block product listing if variation fetch fails
        return null;
      }
    };

    // CRITICAL FIX: Sequential processing instead of Promise.all to prevent WordPress overload
    // Process products one at a time to reduce MySQL pressure
    const products = [];
    for (const product of visibleProducts) {
      try {
        const image = product.images?.[0]?.src || "";
        const featuresMeta = product.meta_data?.find((item) => item.key === "features");
        const featuresValue = featuresMeta?.value ?? null;
        const features =
          Array.isArray(featuresValue) && featuresValue.length
            ? featuresValue
            : typeof featuresValue === "string" && featuresValue.trim()
            ? featuresValue
            : null;

        let sku = product.sku || "";
        if (!sku && product.variations && product.variations.length > 0) {
          const variationSku = await fetchFirstVariationSku(product.id);
          if (variationSku) sku = variationSku;
        }

        products.push({
          _id: String(product.id),
          name: product.name,
          slug: { current: product.slug },
          price: parsePrice(product.price || product.sale_price || product.regular_price),
          discountedPrice: parsePrice(product.sale_price) || undefined,
          sku,
          features,
          thumbnails: image ? [{ image, color: null }] : [],
          previewImages: image ? [{ image, color: null }] : [],
          categories:
            product.categories?.map((cat) => ({
              id: String(cat.id),
              _id: String(cat.id),
              name: cat.name,
              handle: cat.slug,
              slug: { current: cat.slug },
            })) || [],
          reviews: [],
        });
      } catch (error) {
        // If a product fails, log but continue - don't block other products
        console.error(`[API /products] Error processing product ${product.id}:`, error);
        // Add a placeholder product to maintain array consistency
        products.push({
          _id: String(product.id),
          name: product.name || "Unknown Product",
          slug: { current: product.slug || "" },
          price: 0,
          sku: "",
          features: null,
          thumbnails: [],
          previewImages: [],
          categories: [],
          reviews: [],
        });
      }
    }

    console.timeEnd(apiTimerLabel);
    return NextResponse.json(
      { products, totalCount, allCount, _cached: true },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
        },
      }
    );
  } catch (error: any) {
    console.timeEnd(apiTimerLabel);
    console.error("[API /products] Error (returning cached/empty data):", error?.message || error);
    return NextResponse.json(
      {
        products: [],
        totalCount: 0,
        allCount: 0,
        _cached: false,
        _error: error?.message || "woo_failed",
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
        },
      }
    );
  }
}

