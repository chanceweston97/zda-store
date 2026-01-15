import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";

export async function POST(req: Request) {
  try {
    const secret = process.env.REVALIDATE_SECRET || "";
    const url = new URL(req.url);
    const token = url.searchParams.get("secret") || "";
    const tag = url.searchParams.get("tag") || "";

    if (!secret || token !== secret) {
      return NextResponse.json(
        { revalidated: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    if (!tag) {
      return NextResponse.json(
        { revalidated: false, error: "Missing tag" },
        { status: 400 }
      );
    }

    revalidateTag(tag);

    return NextResponse.json({ revalidated: true, tag });
  } catch (error) {
    return NextResponse.json(
      { revalidated: false, error: "Failed to revalidate" },
      { status: 500 }
    );
  }
}
