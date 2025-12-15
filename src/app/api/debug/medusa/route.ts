import { NextResponse } from "next/server";
import { isMedusaEnabled } from "@/lib/medusa/config";
import { medusaClient } from "@/lib/medusa/client";
import { getMedusaProducts } from "@/lib/medusa/products";

export async function GET() {
  try {
    const enabled = isMedusaEnabled();
    const config = {
      enabled,
      backendUrl: process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "not set",
      publishableKey: process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY ? "set" : "not set",
      useMedusa: process.env.NEXT_PUBLIC_USE_MEDUSA || "not set",
    };

    if (!enabled) {
      return NextResponse.json({
        status: "disabled",
        config,
        message: "Medusa is not enabled. Set NEXT_PUBLIC_USE_MEDUSA=true",
      });
    }

    // Test connection
    let connectionTest: any = { success: false, error: null, details: null };
    try {
      const { products, count } = await medusaClient.getProducts({ limit: 1 });
      connectionTest = { 
        success: true, 
        productsCount: products?.length || 0, 
        totalCount: count || 0,
        sampleProduct: products?.[0] ? {
          id: products[0].id,
          title: products[0].title,
          handle: products[0].handle,
          hasImages: !!products[0].images?.length,
          hasVariants: !!products[0].variants?.length,
        } : null
      };
    } catch (error: any) {
      connectionTest = {
        success: false,
        error: error.message || String(error),
        details: {
          stack: error.stack,
          name: error.name,
          cause: error.cause,
        }
      };
    }

    // Test product conversion
    let productsTest: any = { success: false, count: 0, error: null, details: null };
    try {
      const products = await getMedusaProducts({ limit: 5 });
      productsTest = { 
        success: true, 
        count: products.length,
        sampleConverted: products[0] ? {
          _id: products[0]._id,
          name: products[0].name,
          slug: products[0].slug,
          price: products[0].price,
          hasThumbnails: !!products[0].thumbnails?.length,
          hasPreviewImages: !!products[0].previewImages?.length,
        } : null
      };
    } catch (error: any) {
      productsTest = {
        success: false,
        error: error.message || String(error),
        details: {
          stack: error.stack,
          name: error.name,
        }
      };
    }

    return NextResponse.json({
      status: "ok",
      config,
      connectionTest,
      productsTest,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        status: "error",
        error: error.message || String(error),
      },
      { status: 500 }
    );
  }
}

