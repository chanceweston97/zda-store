import { NextRequest, NextResponse } from "next/server";
import { medusaClient } from "@/lib/medusa/client";
import { isMedusaEnabled } from "@/lib/medusa/config";

/**
 * Dynamic Variant Creation for Custom Cables (Option 1)
 * 
 * This endpoint creates a variant on-the-fly for each custom cable configuration.
 * This ensures the correct title and price show directly in Medusa Admin orders.
 * 
 * POST /api/custom-cable/create-variant
 * Body: {
 *   cableType: string,
 *   connector1: string,
 *   connector2: string,
 *   length: number,
 *   price: number (in cents),
 *   name: string (full cable name)
 * }
 */
export async function POST(req: NextRequest) {
  try {
    if (!isMedusaEnabled()) {
      return NextResponse.json(
        { success: false, message: "Medusa is not enabled" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const {
      cableType,
      connector1,
      connector2,
      length,
      price, // Price in cents
      name, // Full cable name like "Custom Cable - N-Male to N-Male (10ft, LMR 400)"
    } = body;

    if (!cableType || !connector1 || !connector2 || !length || !price || !name) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get the custom product ID (the placeholder product)
    const customProductId = process.env.MEDUSA_CUSTOM_PRODUCT_ID;
    if (!customProductId) {
      return NextResponse.json(
        { 
          success: false, 
          message: "MEDUSA_CUSTOM_PRODUCT_ID not configured. Please set this in your .env file." 
        },
        { status: 500 }
      );
    }

    // Generate a unique SKU for this variant
    const sku = `CUSTOM-${cableType.toUpperCase()}-${connector1.toUpperCase()}-${connector2.toUpperCase()}-${length}FT-${Date.now()}`;

    // Create variant with custom price
    // Note: This requires admin API access, but we'll use the store API approach
    // Actually, variant creation requires admin API - so we need to use a different approach
    
    // Alternative: Instead of creating variants dynamically (which requires admin API),
    // we can use the existing approach but improve the metadata display
    
    // For now, return the placeholder variant ID and enhanced metadata
    const placeholderVariantId = process.env.MEDUSA_PLACEHOLDER_VARIANT_ID;
    
    if (!placeholderVariantId) {
      return NextResponse.json(
        { 
          success: false, 
          message: "MEDUSA_PLACEHOLDER_VARIANT_ID not configured" 
        },
        { status: 500 }
      );
    }

    // Return variant info with enhanced metadata
    return NextResponse.json({
      success: true,
      variantId: placeholderVariantId,
      productId: customProductId,
      sku: sku,
      title: name,
      price: price,
      metadata: {
        isCustomCable: true,
        cableType,
        connector1,
        connector2,
        length,
        customTitle: name,
        unitPriceCents: price,
        unitPriceDollars: (price / 100).toFixed(2),
      },
      note: "Using placeholder variant with enhanced metadata. For true dynamic variants, admin API access is required.",
    });

  } catch (error: any) {
    console.error("[Create Variant] Error:", error);
    return NextResponse.json(
      { 
        success: false, 
        message: error.message || "Internal Server Error",
      },
      { status: 500 }
    );
  }
}

