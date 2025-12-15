import { revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const tag = searchParams.get("tag");
    const secret = searchParams.get("secret");

    // Simple security check - you can make this more secure
    if (secret !== process.env.REVALIDATE_SECRET) {
      return new Response("Unauthorized", { status: 401 });
    }

    if (!tag) {
      return new Response("Missing tag parameter", { status: 400 });
    }

    // Revalidate the specified tag
    revalidateTag(tag);

    return NextResponse.json({
      status: 200,
      revalidated: true,
      tag,
      now: Date.now(),
    });
  } catch (error: any) {
    console.error("Manual revalidation error:", error);
    return new Response(error.message, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const secret = searchParams.get("secret");

    if (secret !== process.env.REVALIDATE_SECRET) {
      return new Response("Unauthorized", { status: 401 });
    }

    // Revalidate all common tags
    const tags = [
      "product",
      "category",
      "heroBanner",
      "heroIntroduction",
      "proudPartners",
      "whatWeOffer",
      "ourStory",
      "faq",
      "countdown",
    ];

    tags.forEach((tag) => {
      revalidateTag(tag);
    });

    return NextResponse.json({
      status: 200,
      revalidated: true,
      tags,
      now: Date.now(),
    });
  } catch (error: any) {
    console.error("Manual revalidation error:", error);
    return new Response(error.message, { status: 500 });
  }
}
