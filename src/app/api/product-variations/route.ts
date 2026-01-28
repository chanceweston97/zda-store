import { NextResponse } from "next/server";
import { getProductVariations, convertWCVariationsToVariants } from "@/lib/woocommerce/products";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const idParam = searchParams.get("id");
  const productName = searchParams.get("name") || "Product";

  const id = idParam ? Number(idParam) : NaN;
  if (!Number.isFinite(id) || id <= 0) {
    return NextResponse.json({ variants: [], _cached: false, _error: "missing_id" }, { status: 200 });
  }

  try {
    const variations = await getProductVariations(id);
    const variants = convertWCVariationsToVariants({
      productName,
      variations,
    });
    return NextResponse.json({ variants, _cached: true }, { status: 200 });
  } catch (error: any) {
    // Never fail the client; return empty variants so PDP can still render
    return NextResponse.json(
      { variants: [], _cached: false, _error: error?.message || "variations_failed" },
      { status: 200 }
    );
  }
}

