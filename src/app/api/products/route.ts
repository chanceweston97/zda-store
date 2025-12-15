import { NextRequest, NextResponse } from "next/server";
import { getAllProducts, getProductsByFilter } from "@/lib/data/shop-utils";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = searchParams.get("limit");
    const category = searchParams.get("category");
    const query = searchParams.get("query");

    let products;

    if (query) {
      // Use filter for complex queries
      products = await getProductsByFilter(query, ["product"]);
    } else if (category) {
      products = await getProductsByFilter(
        `*[_type == "product" && category->slug.current == "${category}"]`,
        ["product"]
      );
    } else {
      products = await getAllProducts();
    }

    if (limit) {
      products = products.slice(0, parseInt(limit));
    }

    return NextResponse.json(products, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

