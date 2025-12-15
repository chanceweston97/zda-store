import { NextRequest, NextResponse } from "next/server";
import { medusaClient } from "@/lib/medusa/client";
import { isMedusaEnabled } from "@/lib/medusa/config";

/**
 * Custom Checkout Complete (Option 3: Bypass Medusa Checkout)
 * 
 * This endpoint:
 * 1. Accepts cart items with custom prices (already calculated)
 * 2. Handles payment outside Medusa (Stripe/COD)
 * 3. Creates order directly in Medusa admin API with correct prices/titles
 * 
 * This is the CORRECT way to handle custom products in Medusa v2
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
      email,
      shipping_address,
      billing_address,
      payment_method,
      same_as_billing,
      cartItems, // Items from use-shopping-cart with custom prices
      payment_status = "pending", // "paid" or "pending"
      payment_intent_id, // For Stripe payments
    } = body;

    if (!email || !shipping_address) {
      return NextResponse.json(
        { success: false, message: "Missing required fields: email and shipping_address" },
        { status: 400 }
      );
    }

    if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
      return NextResponse.json(
        { success: false, message: "No items in cart" },
        { status: 400 }
      );
    }

    // Get region for order creation
    const regions = await medusaClient.getRegions();
    if (!regions.regions || regions.regions.length === 0) {
      return NextResponse.json(
        { success: false, message: "No regions configured in Medusa" },
        { status: 400 }
      );
    }
    const region = regions.regions[0];

    // Prepare order items with custom prices and titles
    const orderItems = cartItems.map((item: any) => {
      const isCustomCable = item.metadata?.isCustom || item.slug === "custom-cable" || item.name?.startsWith("Custom Cable -");
      
      // For custom cables, use the custom name and price from cart
      // For regular products, use the provided data
      const itemTitle = isCustomCable ? item.name : (item.name || "Product");
      const itemPrice = item.price || 0; // Price in cents
      const itemQuantity = item.quantity || 1;

      // Build metadata for custom cables
      const itemMetadata: Record<string, any> = {
        ...(item.metadata || {}),
      };

      if (isCustomCable) {
        // Store all custom cable details in metadata
        itemMetadata.isCustomCable = true;
        itemMetadata.customTitle = item.name;
        itemMetadata.unitPriceCents = itemPrice;
        itemMetadata.unitPriceDollars = (itemPrice / 100).toFixed(2);
        
        // Store individual cable configuration details
        if (item.metadata) {
          itemMetadata.cableSeries = item.metadata.cableSeries;
          itemMetadata.cableType = item.metadata.cableTypeName || item.metadata.cableType;
          itemMetadata.connector1 = item.metadata.connector1Name || item.metadata.connector1;
          itemMetadata.connector2 = item.metadata.connector2Name || item.metadata.connector2;
          itemMetadata.length = item.metadata.length;
        }
      }

      return {
        title: itemTitle,
        description: isCustomCable 
          ? `${item.metadata?.cableTypeName || item.metadata?.cableType || ""}: ${item.metadata?.connector1Name || item.metadata?.connector1 || ""} to ${item.metadata?.connector2Name || item.metadata?.connector2 || ""}, ${item.metadata?.length || ""}ft`
          : undefined,
        quantity: itemQuantity,
        unit_price: itemPrice, // Price in cents - this will be the actual charged price
        metadata: itemMetadata,
      };
    });

    // Calculate totals
    const subtotal = orderItems.reduce((sum: number, item: any) => {
      return sum + (item.unit_price * item.quantity);
    }, 0);

    // Prepare order metadata
    const orderMetadata: Record<string, any> = {
      customCheckout: true,
      paymentMethod: payment_method || "cod",
      ...(payment_intent_id && { paymentIntentId: payment_intent_id }),
    };

    // Add custom cable summary if any
    const customCables = cartItems.filter((item: any) => 
      item.metadata?.isCustom || item.slug === "custom-cable"
    );
    if (customCables.length > 0) {
      orderMetadata.hasCustomCables = true;
      orderMetadata.customCableCount = customCables.length;
      orderMetadata.customCableSummary = customCables.map((cable: any) => 
        `${cable.name} - $${((cable.price || 0) / 100).toFixed(2)}`
      ).join("; ");
    }

    // Format addresses for Medusa
    const formattedShippingAddress = {
      first_name: shipping_address.firstName || shipping_address.first_name,
      last_name: shipping_address.lastName || shipping_address.last_name,
      address_1: shipping_address.street || shipping_address.address_1,
      address_2: shipping_address.apartment || shipping_address.address_2 || "",
      city: shipping_address.town || shipping_address.city,
      country_code: shipping_address.country_code || shipping_address.country || "us",
      postal_code: shipping_address.postalCode || shipping_address.postal_code || "00000",
      province: shipping_address.province || shipping_address.regionName || "",
      phone: shipping_address.phone || "",
    };

    const formattedBillingAddress = billing_address && !same_as_billing
      ? {
          first_name: billing_address.firstName || billing_address.first_name,
          last_name: billing_address.lastName || billing_address.last_name,
          address_1: billing_address.street || billing_address.address_1,
          address_2: billing_address.apartment || billing_address.address_2 || "",
          city: billing_address.town || billing_address.city,
          country_code: billing_address.country_code || billing_address.country || "us",
          postal_code: billing_address.postalCode || billing_address.postal_code || "00000",
          province: billing_address.province || billing_address.regionName || "",
          phone: billing_address.phone || "",
        }
      : formattedShippingAddress;

    // Create order using Medusa Admin API
    // Note: This requires Secret API Key (admin key), not publishable key
    // Try multiple possible environment variable names
    const adminApiKey = process.env.MEDUSA_ADMIN_API_KEY 
      || process.env.MEDUSA_SECRET_API_KEY
      || process.env.MEDUSA_API_KEY;
      
    if (!adminApiKey) {
      console.error("[Custom Checkout] Admin API key not found. Please set one of:");
      console.error("  - MEDUSA_ADMIN_API_KEY");
      console.error("  - MEDUSA_SECRET_API_KEY");
      console.error("  - MEDUSA_API_KEY");
      return NextResponse.json(
        { 
          success: false, 
          message: "Server configuration error: Admin API key not set. Please add MEDUSA_ADMIN_API_KEY to your .env file. See instructions in console.",
          instructions: "Go to Medusa Admin → Settings → API Key Management → Create Secret API Key, then add it to .env as MEDUSA_ADMIN_API_KEY"
        },
        { status: 500 }
      );
    }

    // Validate API key format - accept any key starting with 'sk_'
    // Formats can be: sk_live_..., sk_test_..., or sk_... (all valid)
    if (!adminApiKey.startsWith('sk_')) {
      console.warn("[Custom Checkout] API key doesn't start with 'sk_' - make sure you're using a Secret API Key, not a Publishable Key");
    }

    // Debug log (don't log full key, just preview)
    console.log("[Custom Checkout] Using API key:", {
      keyPrefix: adminApiKey.substring(0, 15) + "...",
      keyLength: adminApiKey.length,
      startsWithSk: adminApiKey.startsWith('sk_'),
      format: adminApiKey.startsWith('sk_live_') ? 'live' : 
              adminApiKey.startsWith('sk_test_') ? 'test' : 
              adminApiKey.startsWith('sk_') ? 'standard' : 'unknown',
    });

    const medusaBackendUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || process.env.MEDUSA_BACKEND_URL;
    if (!medusaBackendUrl) {
      return NextResponse.json(
        { success: false, message: "Server configuration error: Medusa backend URL not set" },
        { status: 500 }
      );
    }

    // Create order via Medusa Admin API
    const orderPayload = {
      email,
      region_id: region.id,
      currency_code: region.currency_code || "usd",
      items: orderItems,
      shipping_address: formattedShippingAddress,
      billing_address: formattedBillingAddress,
      status: payment_status === "paid" ? "pending" : "pending", // Orders start as pending
      payment_status: payment_status === "paid" ? "awaiting" : "not_paid",
      metadata: orderMetadata,
    };

    console.log("[Custom Checkout] Creating order in Medusa Admin API:", {
      email,
      itemCount: orderItems.length,
      subtotal: subtotal / 100,
      paymentStatus: payment_status,
      backendUrl: medusaBackendUrl,
      items: orderItems.map((item: any) => ({
        title: item.title,
        quantity: item.quantity,
        unit_price: item.unit_price / 100,
      })),
    });

    console.log("[Custom Checkout] Order payload structure:", {
      hasEmail: !!orderPayload.email,
      hasRegionId: !!orderPayload.region_id,
      hasItems: Array.isArray(orderPayload.items) && orderPayload.items.length > 0,
      itemsStructure: orderPayload.items?.[0] ? Object.keys(orderPayload.items[0]) : [],
      hasShippingAddress: !!orderPayload.shipping_address,
      hasBillingAddress: !!orderPayload.billing_address,
    });

    // Try multiple authentication methods for Medusa v2 Admin API
    // Medusa v2 may use x-medusa-access-token instead of Authorization: Bearer
    let orderResponse;
    let authError = null;
    
    // Method 1: Try x-medusa-access-token header (Medusa v2 preferred method)
    try {
      console.log("[Custom Checkout] Attempting order creation with x-medusa-access-token header...");
      orderResponse = await fetch(`${medusaBackendUrl}/admin/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-medusa-access-token": adminApiKey,
        },
        body: JSON.stringify(orderPayload),
      });
      console.log("[Custom Checkout] Response status:", orderResponse.status);
    } catch (fetchError: any) {
      authError = fetchError;
      console.error("[Custom Checkout] Fetch error with x-medusa-access-token:", fetchError);
    }

    // Method 2: If 401, try Bearer token (standard method)
    if (orderResponse && orderResponse.status === 401) {
      console.log("[Custom Checkout] 401 with x-medusa-access-token, trying Authorization Bearer...");
      try {
        orderResponse = await fetch(`${medusaBackendUrl}/admin/orders`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${adminApiKey}`,
          },
          body: JSON.stringify(orderPayload),
        });
        console.log("[Custom Checkout] Response status with Bearer:", orderResponse.status);
      } catch (altError: any) {
        console.error("[Custom Checkout] Bearer token auth also failed:", altError);
      }
    }

    // Method 3: Try x-api-key header (fallback)
    if (orderResponse && orderResponse.status === 401) {
      console.log("[Custom Checkout] 401 with Bearer, trying x-api-key...");
      try {
        orderResponse = await fetch(`${medusaBackendUrl}/admin/orders`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": adminApiKey,
          },
          body: JSON.stringify(orderPayload),
        });
        console.log("[Custom Checkout] Response status with x-api-key:", orderResponse.status);
      } catch (altError2: any) {
        console.error("[Custom Checkout] x-api-key auth also failed:", altError2);
      }
    }

    if (!orderResponse) {
      return NextResponse.json(
        { 
          success: false, 
          message: `Failed to connect to Medusa: ${authError?.message || "Network error"}`,
        },
        { status: 500 }
      );
    }

    if (!orderResponse.ok) {
      const errorText = await orderResponse.text();
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { message: errorText || "Unknown error" };
      }
      
      console.error("[Custom Checkout] Failed to create order in Medusa:", {
        status: orderResponse.status,
        statusText: orderResponse.statusText,
        error: errorData,
        apiKeyPreview: adminApiKey ? `${adminApiKey.substring(0, 10)}...` : "NOT SET",
        backendUrl: medusaBackendUrl,
      });

      // Provide helpful error message for 401
      if (orderResponse.status === 401) {
        console.error("[Custom Checkout] 401 Unauthorized - API key authentication failed");
        console.error("[Custom Checkout] API key details:", {
          keyPrefix: adminApiKey.substring(0, 15) + "...",
          keyLength: adminApiKey.length,
          startsWithSk: adminApiKey.startsWith('sk_'),
          backendUrl: medusaBackendUrl,
          endpoint: `${medusaBackendUrl}/admin/orders`,
        });
        
        return NextResponse.json(
          { 
            success: false, 
            message: "Authentication failed (401 Unauthorized). Please verify your MEDUSA_ADMIN_API_KEY is correct.",
            error: errorData,
            apiKeyInfo: {
              keyPrefix: adminApiKey.substring(0, 15) + "...",
              keyLength: adminApiKey.length,
              startsWithSk: adminApiKey.startsWith('sk_'),
              format: adminApiKey.startsWith('sk_live_') ? 'live' : 
                      adminApiKey.startsWith('sk_test_') ? 'test' : 
                      adminApiKey.startsWith('sk_') ? 'standard' : 'unknown',
            },
            troubleshooting: {
              step1: "Verify the key in Medusa Admin → Settings → Secret API Keys is correct",
              step2: "Check your .env file has: MEDUSA_ADMIN_API_KEY=sk_xxxxxxxxx (no spaces, no quotes)",
              step3: "Make sure you restarted your dev server after adding the key",
              step4: `Verify backend URL is correct: ${medusaBackendUrl}`,
              step5: "Test the key by visiting: http://localhost:8000/api/test-admin-key",
            }
          },
          { status: 401 }
        );
      }

      return NextResponse.json(
        { 
          success: false, 
          message: errorData.message || `Failed to create order: ${orderResponse.statusText}`,
          details: errorData,
        },
        { status: orderResponse.status }
      );
    }

    const orderData = await orderResponse.json();
    const order = orderData.order || orderData;

    console.log("[Custom Checkout] ✅ Order created successfully:", {
      orderId: order.id,
      displayId: order.display_id,
      email: order.email,
      total: order.total,
      subtotal: order.subtotal,
      itemCount: order.items?.length || 0,
    });

    return NextResponse.json({
      success: true,
      order: order,
      message: "Order created successfully",
    });

  } catch (error: any) {
    console.error("[Custom Checkout] ❌ Unhandled error:", error);
    return NextResponse.json(
      { 
        success: false, 
        message: error.message || "Internal Server Error",
      },
      { status: 500 }
    );
  }
}

