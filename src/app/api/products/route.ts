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

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category") || "";
    const page = searchParams.get("page") || "1";
    const perPage = searchParams.get("per_page") || "12";

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
      return NextResponse.json(
        { products: [], totalCount: 0, error: "WooCommerce API not configured." },
        { status: 500 }
      );
    }

    const fetchCategoryIdsExcludingUncategorized = async (): Promise<string[]> => {
      const categoryParams = new URLSearchParams({
        consumer_key: consumerKey,
        consumer_secret: consumerSecret,
        per_page: "100",
        _fields: "id,slug",
      });
      const categoryRes = await fetch(`${apiUrl}/products/categories?${categoryParams.toString()}`, {
        next: { revalidate: 3600, tags: ["wc-categories"] },
      });
      if (!categoryRes.ok) return [];
      const categories = (await categoryRes.json()) as Array<{ id: number; slug: string }>;
      return categories
        .filter((cat) => cat.slug !== "uncategorized")
        .map((cat) => String(cat.id));
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

      const fetchCountForVisibility = async (visibility: "visible" | "catalog") => {
        const params = new URLSearchParams(baseParams);
        params.append("catalog_visibility", visibility);
        const res = await fetch(`${apiUrl}/products?${params.toString()}`, {
          next: { revalidate: 60, tags: ["wc-products"] },
        });
        if (!res.ok) return 0;
        return Number(res.headers.get("X-WP-Total") || 0);
      };

      const [visibleCount, catalogCount] = await Promise.all([
        fetchCountForVisibility("visible"),
        fetchCountForVisibility("catalog"),
      ]);

      return visibleCount + catalogCount;
    };

    const params = new URLSearchParams({
      consumer_key: consumerKey,
      consumer_secret: consumerSecret,
      per_page: perPage,
      page,
      _fields:
        "id,name,price,regular_price,sale_price,slug,images,categories,sku,variations,meta_data,status,catalog_visibility",
      status: "publish",
    });

    if (categoryFilterParam) {
      params.append("category", categoryFilterParam);
    }

    const res = await fetch(`${apiUrl}/products?${params.toString()}`, {
      next: { revalidate: 60, tags: ["wc-products"] },
    });

    if (!res.ok) {
      const errorText = await res.text().catch(() => "");
      return NextResponse.json(
        { products: [], totalCount: 0, error: errorText || res.statusText },
        { status: res.status }
      );
    }

    const wcProducts = (await res.json()) as WooCommerceProduct[];
    const visibleProducts = wcProducts.filter((product) => {
      const isVisible =
        product.catalog_visibility !== "hidden" &&
        product.catalog_visibility !== "search" &&
        product.status !== "private" &&
        product.status !== "draft";
      const hasCategory =
        (product.categories?.length || 0) > 0 &&
        !product.categories?.some((cat) => cat.slug === "uncategorized");
      return isVisible && hasCategory;
    });
    const totalCount = await fetchShowableCount(categoryFilterParam || undefined);
    const allCount = await fetchShowableCount(
      categoryFilterIds.length > 0 ? categoryFilterIds.join(",") : undefined
    );

    const fetchFirstVariationSku = async (
      productId: number
    ): Promise<string | null> => {
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
        { next: { revalidate: 60, tags: ["wc-products"] } }
      );
      if (!variationRes.ok) return null;
      const variations = (await variationRes.json()) as Array<{ sku?: string }>;
      const sku = variations?.[0]?.sku?.trim();
      return sku || null;
    };

    const products = await Promise.all(
      visibleProducts.map(async (product) => {
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

        return {
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
        };
      })
    );

    return NextResponse.json(
      { products, totalCount, allCount },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
        },
      }
    );
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { products: [], totalCount: 0, error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

