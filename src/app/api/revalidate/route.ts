import { revalidateTag } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";
import { imageBuilder } from "@/lib/data/shop-utils";
import { getCategoryById } from "@/lib/data/shop-utils";
import { updateIndex } from "@/algolia/crawlIndex";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      _type: string;
      slug?: any | undefined;
      _id?: string | undefined;
      name?: string | undefined;
      shortDescription?: string | undefined;
      price?: number | undefined;
      discountedPrice?: number | undefined;
      previewImages?: any[] | undefined;
      reviews?: any[] | undefined;
      category?: any | undefined;
      colors?: any[] | undefined;
      sizes?: any[] | undefined;
      thumbnails?: any[] | undefined;
      status?: string | undefined;
      description?: string | undefined;
      offers?: any[] | undefined;
      customAttributes?: any[] | undefined;
      _createdAt?: string | undefined;
      _updatedAt?: string | undefined;
      tags?: any[] | undefined;
    };

    if (!body?._type) {
      return new Response("Bad Request", { status: 400 });
    }

    // Revalidate the specific content type
    revalidateTag(body._type);

    // Also revalidate "product" tag to ensure all product-related caches are updated
    if (body._type === "product") {
      revalidateTag("product");
    }

    // Revalidate other content types that may affect the frontend
    if (body._type === "heroBanner") {
      revalidateTag("heroBanner");
    }

    if (body._type === "heroIntroduction") {
      revalidateTag("heroIntroduction");
    }

    if (body._type === "proudPartners") {
      revalidateTag("proudPartners");
    }

    if (body._type === "whatWeOffer") {
      revalidateTag("whatWeOffer");
    }

    if (body._type === "faq") {
      revalidateTag("faq");
    }

    if (body._type === "ourStory") {
      revalidateTag("ourStory");
    }

    if (body._type === "category") {
      revalidateTag("category");
    }

    if (body._type === "countdown") {
      revalidateTag("countdown");
    }

    // Only fetch category if category reference exists
    const category = body?.category?._ref
      ? await getCategoryById(body.category._ref)
      : null;

    const data = {
      type: "products",
      name: body?.name || "",
      htmlString: body?.shortDescription?.slice(0, 7000) || "",
      objectID: `${process.env.SITE_URL}/products/${body?.slug?.current}`,
      url: `${process.env.SITE_URL}/products/${body?.slug?.current}`,
      imageURL:
        body?.previewImages &&
        (imageBuilder(body?.previewImages[0]?.image).url() as string),
      price: body?.price,
      discountedPrice: body?.discountedPrice,
      reviews: body?.reviews,
      category: category?.title || null,
      colors: body?.colors,
      sizes: body?.sizes,
      _id: body?._id,
      thumbnails: body?.thumbnails,
      status: body?.status,
      previewImages: body?.previewImages,
      description: body?.description,
      offers: body?.offers,
      customAttributes: body?.customAttributes,
      updatedAt: new Date().toISOString(),
      tags: body?.tags,
    };

    if (body.name !== "" || body?.name === undefined) {
      await updateIndex(data);
    }

    return NextResponse.json({
      status: 200,
      revalidated: true,
      now: Date.now(),
      body,
    });
  } catch (error: any) {
    console.error(error);
    return new Response(error.message, { status: 500 });
  }
}
