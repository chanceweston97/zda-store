import { NextResponse } from "next/server";

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

// Fetch from WooCommerce (Cloudflare caches WordPress; Next.js does not cache)
async function getProductsFromWoo(url: string): Promise<WooCommerceProduct[]> {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`WooCommerce API failed: ${res.status} ${res.statusText}`);
  return res.json();
}

const WOO_ENABLED = (process.env.WOO_ENABLED || "true").toLowerCase() !== "false";

export async function GET(req: Request) {
  const apiTimerLabel = `api/products|${crypto.randomUUID()}`;
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

  const apiUrl = (
    process.env.WC_API_URL ||
    process.env.NEXT_PUBLIC_WC_API_URL ||
    ""
  ).replace(/\/+$/, "");
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
        const categoryRes = await fetch(`${apiUrl}/products/categories?${categoryParams.toString()}`, {
          cache: "no-store",
        });
        if (!categoryRes.ok) return [];
        const categories = (await categoryRes.json()) as Array<{ id: number; slug: string }>;
        return categories
          .filter((cat) => cat.slug !== "uncategorized")
          .map((cat) => String(cat.id));
      } catch (error) {
        console.error("[API /products] Error fetching categories:", error);
        return [];
      }
    };

    const categoryFilterIds = await fetchCategoryIdsExcludingUncategorized();
    const hasCategoryFilter = Boolean(category?.trim());
    // When no category in query, do NOT filter by category (show all products)
    const categoryFilterParam = hasCategoryFilter ? category!.trim() : "";

    const fetchShowableCount = async (categoryParam?: string): Promise<number> => {
      const baseParams = new URLSearchParams({
        consumer_key: consumerKey,
        consumer_secret: consumerSecret,
        per_page: "1",
        page: "1",
        _fields: "id",
        status: "publish",
      });
      if (categoryParam) baseParams.append("category", categoryParam);
      try {
        const res = await fetch(`${apiUrl}/products?${baseParams.toString()}`, { cache: "no-store" });
        if (!res.ok) return 0;
        return Number(res.headers.get("X-WP-Total") || 0);
      } catch (error) {
        console.error("[API /products] fetchShowableCount error:", error);
        return 0;
      }
    };

    const queryParams = new URLSearchParams({
      consumer_key: consumerKey,
      consumer_secret: consumerSecret,
      per_page: perPage,
      page,
      _fields:
        "id,name,price,regular_price,sale_price,slug,images,categories,sku,variations,meta_data,status,catalog_visibility",
      status: "publish",
    });
    if (categoryFilterParam) queryParams.append("category", categoryFilterParam);

    const productsUrl = `${apiUrl}/products?${queryParams.toString()}`;
    const wcProducts = (await getProductsFromWoo(productsUrl)) as WooCommerceProduct[];

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
      return isVisible && hasCategory;
    });

    let totalCount: number;
    let allCount: number;
    if (hasCategoryFilter) {
      totalCount = await fetchShowableCount(categoryFilterParam || undefined);
      if (totalCount === 0) totalCount = visibleProducts.length;
      allCount = await fetchShowableCount(undefined);
      if (allCount === 0) allCount = totalCount;
    } else {
      totalCount = await fetchShowableCount(undefined);
      allCount = totalCount;
      if (totalCount === 0) totalCount = visibleProducts.length;
      if (allCount === 0) allCount = totalCount;
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
        
        const variationRes = await fetch(
          `${apiUrl}/products/${productId}/variations?${variationParams.toString()}`,
          { cache: "no-store" }
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
      { products, totalCount, allCount, _cached: false },
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

