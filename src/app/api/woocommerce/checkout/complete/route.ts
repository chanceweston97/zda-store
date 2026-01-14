import { NextRequest, NextResponse } from "next/server";
import { createOrder } from "@/lib/woocommerce/checkout";
import { isWooCommerceEnabled } from "@/lib/woocommerce/config";
import { convertCartItemToWC } from "@/lib/woocommerce/utils";

/**
 * Complete checkout by creating order in WooCommerce
 */
export async function POST(req: NextRequest) {
  try {
    if (!isWooCommerceEnabled()) {
      return NextResponse.json(
        { success: false, message: "WooCommerce is not enabled" },
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
      cartItems, // Items from use-shopping-cart
      payment_status,
      payment_intent_id,
    } = body;

    if (!email || !shipping_address) {
      return NextResponse.json(
        { success: false, message: "Missing required fields: email and shipping_address" },
        { status: 400 }
      );
    }

    if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
      return NextResponse.json(
        { success: false, message: "Cart is empty" },
        { status: 400 }
      );
    }

    // Convert cart items to WooCommerce format
    const lineItems = cartItems.map((item: any) => {
      const wcItem = convertCartItemToWC(item);
      
      // Validate product ID
      if (!wcItem.product_id || wcItem.product_id === 0) {
        console.error("[Checkout] Invalid product ID for item:", item);
        throw new Error(
          `Invalid product ID for item "${item.name || item.id}". ` +
          `Please ensure products are properly synced with WooCommerce. ` +
          `Product ID: ${wcItem.product_id}, Item ID: ${item.id}`
        );
      }
      
      // For custom products (like cables), include the price to override product price
      // Price is in cents in the cart, convert to dollars for WooCommerce
      // WooCommerce requires 'subtotal' and 'total' fields for custom pricing
      if (item.price) {
        const priceInDollars = (item.price / 100).toFixed(2);
        const quantity = item.quantity || 1;
        const lineTotal = (parseFloat(priceInDollars) * quantity).toFixed(2);
        
        // Set unit price, subtotal, and total for the line item
        // WooCommerce uses these fields to calculate order totals
        wcItem.price = priceInDollars; // Unit price
        wcItem.subtotal = lineTotal; // Line subtotal (price * quantity)
        wcItem.total = lineTotal; // Line total (same as subtotal if no discounts)
        
        console.log(`[Checkout] Setting price for item "${item.name}":`, {
          unitPrice: priceInDollars,
          quantity,
          lineTotal,
          isCustom: item.metadata?.isCustom,
        });
      }
      
      // Note: convertCartItemToWC already handles metadata conversion
      // The meta_data from convertCartItemToWC should already include all necessary fields
      // including cable, length, from, to, display_name for custom cables
      
      return wcItem;
    });

    // Prepare billing address
    const billing = {
      first_name: billing_address?.firstName || shipping_address.firstName,
      last_name: billing_address?.lastName || shipping_address.lastName,
      address_1: billing_address?.street || shipping_address.street,
      address_2: billing_address?.apartment || shipping_address.apartment || "",
      city: billing_address?.town || shipping_address.town,
      state: billing_address?.state || shipping_address.regionName || "",
      postcode: billing_address?.postalCode || shipping_address.postalCode || "00000",
      country: billing_address?.country_code || billing_address?.country || shipping_address.country || "US",
      email: email,
      phone: billing_address?.phone || shipping_address.phone || "",
    };

    // Prepare shipping address
    const shipping = {
      first_name: shipping_address.firstName,
      last_name: shipping_address.lastName,
      address_1: shipping_address.street,
      address_2: shipping_address.apartment || "",
      city: shipping_address.town,
      state: shipping_address.regionName || "",
      postcode: shipping_address.postalCode || "00000",
      country: shipping_address.country_code || shipping_address.country || "US",
    };

    // Determine payment method
    let paymentMethod = "cod"; // Default to Cash on Delivery
    let paymentMethodTitle = "Cash on Delivery";
    let setPaid = false;

    if (payment_method === "stripe" || payment_status === "paid") {
      paymentMethod = "stripe";
      paymentMethodTitle = "Stripe";
      setPaid = true;
    } else if (payment_method === "bank") {
      paymentMethod = "bacs";
      paymentMethodTitle = "Direct Bank Transfer";
    }

    // Prepare order data
    const orderData = {
      payment_method: paymentMethod,
      payment_method_title: paymentMethodTitle,
      set_paid: setPaid,
      billing,
      shipping: same_as_billing ? billing : shipping,
      line_items: lineItems,
      meta_data: [
        { key: "order_source", value: "nextjs_frontend" },
        ...(payment_intent_id ? [{ key: "stripe_payment_intent_id", value: payment_intent_id }] : []),
      ],
    };

    // Log order data for debugging (without sensitive info)
    console.log("[WooCommerce Checkout] Creating order with:", {
      lineItemsCount: lineItems.length,
      paymentMethod,
      billingCity: billing.city,
      shippingCity: shipping.city,
      lineItems: lineItems.map(item => ({
        product_id: item.product_id,
        quantity: item.quantity,
        price: (item as any).price,
        subtotal: (item as any).subtotal,
        total: (item as any).total,
      })),
    });

    // Create order in WooCommerce
    const order = await createOrder(orderData);

    console.log("[WooCommerce Checkout] Order created successfully:", {
      orderId: order.id,
      orderNumber: order.number,
      status: order.status,
    });

    return NextResponse.json({
      success: true,
      message: "Order created successfully",
      order: {
        id: order.id,
        number: order.number,
        status: order.status,
        total: order.total,
        currency: order.currency,
      },
    });
  } catch (error: any) {
    console.error("[WooCommerce Checkout] Error details:", {
      message: error.message,
      stack: error.stack,
      name: error.name,
    });
    
    // Provide more detailed error message
    let errorMessage = error.message || "Failed to create order in WooCommerce";
    
    // Check for common WooCommerce API errors
    if (error.message?.includes("product_id") || error.message?.includes("Invalid product")) {
      errorMessage = "One or more products could not be found in WooCommerce. Please ensure all products are synced.";
    } else if (error.message?.includes("authentication") || error.message?.includes("401")) {
      errorMessage = "WooCommerce API authentication failed. Please check your API credentials.";
    } else if (error.message?.includes("404") || error.message?.includes("Not Found")) {
      errorMessage = "WooCommerce API endpoint not found. Please check your API URL configuration.";
    }
    
    return NextResponse.json(
      {
        success: false,
        message: errorMessage,
        error: process.env.NODE_ENV !== "production" ? {
          message: error.message,
          stack: error.stack,
        } : undefined,
      },
      { status: 500 }
    );
  }
}

