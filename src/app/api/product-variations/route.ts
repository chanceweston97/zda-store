import { NextResponse } from "next/server";
import { getProductVariations, convertWCVariationsToVariants } from "@/lib/woocommerce/products";

const CACHE_HEADERS = {
  "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
};

export async function GET(req: Request) {
  const timerLabel = `[API] product-variations|${Date.now()}`;
  console.time(timerLabel);
  const { searchParams } = new URL(req.url);
  const idParam = searchParams.get("id");
  const productName = searchParams.get("name") || "Product";

  const id = idParam ? Number(idParam) : NaN;
  if (!Number.isFinite(id) || id <= 0) {
    console.timeEnd(timerLabel);
    return NextResponse.json(
      { variants: [], _cached: false, _error: "missing_id" },
      { status: 200, headers: CACHE_HEADERS }
    );
  }

  try {
    const variations = await getProductVariations(id);
    const variants = convertWCVariationsToVariants({
      productName,
      variations,
    });
    console.timeEnd(timerLabel);
    return NextResponse.json(
      { variants, _cached: true },
      { status: 200, headers: CACHE_HEADERS }
    );
  } catch (error: any) {
    console.timeEnd(timerLabel);
    return NextResponse.json(
      { variants: [], _cached: false, _error: error?.message || "variations_failed" },
      { status: 200, headers: CACHE_HEADERS }
    );
  }
}

