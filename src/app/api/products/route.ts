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

    const params = new URLSearchParams({
      consumer_key: consumerKey,
      consumer_secret: consumerSecret,
      per_page: perPage,
      page,
      _fields:
        "id,name,price,regular_price,sale_price,slug,images,categories,sku,variations,meta_data",
    });

    if (category) {
      params.append("category", category);
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
    const totalCount = Number(res.headers.get("X-WP-Total") || wcProducts.length);

    let allCount = totalCount;
    if (category) {
      const totalParams = new URLSearchParams({
        consumer_key: consumerKey,
        consumer_secret: consumerSecret,
        per_page: "1",
        page: "1",
        _fields: "id",
      });
      const totalRes = await fetch(`${apiUrl}/products?${totalParams.toString()}`, {
        next: { revalidate: 60, tags: ["wc-products"] },
      });
      if (totalRes.ok) {
        const totalHeader = totalRes.headers.get("X-WP-Total");
        if (totalHeader) {
          allCount = Number(totalHeader);
        }
      }
    }

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
      wcProducts.map(async (product) => {
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

