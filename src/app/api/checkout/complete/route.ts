import { NextRequest, NextResponse } from "next/server";
import { isMedusaEnabled } from "@/lib/medusa/config";
import {
  getCartId,
  createCart,
  retrieveCart,
  updateCart,
  setShippingMethod,
  listCartShippingMethods,
  createPaymentCollection,
  createPaymentSessions,
  setPaymentSession,
  completeCart,
  addLineItem,
  updateLineItem,
  removeCartId,
} from "@/lib/medusa/cart";
import { medusaClient } from "@/lib/medusa/client";

/**
 * Convert use-shopping-cart items to Medusa cart
 * This route handles checkout completion by:
 * 1. Creating/retrieving a Medusa cart
 * 2. Adding items from use-shopping-cart to Medusa cart
 * 3. Setting shipping and billing addresses
 * 4. Setting shipping method
 * 5. Initiating payment session (for COD or Stripe)
 * 6. Completing cart to create order
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
      cartItems, // Items from use-shopping-cart
    } = body;

    if (!email || !shipping_address) {
      return NextResponse.json(
        { success: false, message: "Missing required fields: email and shipping_address" },
        { status: 400 }
      );
    }

    // Always create a fresh cart for checkout to avoid issues with existing items
    // IMPORTANT: Always clear any existing cart ID first to prevent reuse
    let cartId: string;
    let cart: any;
    
    try {
      // ALWAYS remove existing cart ID to ensure we create a fresh cart
      // This prevents "cart already completed" errors
      const existingCartId = await getCartId();
      if (existingCartId) {
        console.log("[Checkout Complete] Removing existing cart ID to ensure fresh cart:", existingCartId);
        await removeCartId();
        
        // Also verify the old cart is completed (optional check)
        try {
          const existingCart = await retrieveCart(existingCartId, "id,completed_at");
          if (existingCart?.completed_at) {
            console.log("[Checkout Complete] Verified old cart was completed:", existingCartId);
          }
        } catch (checkError: any) {
          // Cart might not exist or be inaccessible - that's fine, we're creating a new one
          console.log("[Checkout Complete] Old cart check result:", checkError.message);
        }
      }
      
      // Get region and create new cart
      const regions = await medusaClient.getRegions();
      if (!regions.regions || regions.regions.length === 0) {
        return NextResponse.json(
          { success: false, message: "No regions configured in Medusa" },
          { status: 400 }
        );
      }

      const region = regions.regions[0];
      
      // Create a fresh cart for checkout
      cart = await createCart(region.id);
      
      if (!cart) {
        return NextResponse.json(
          { success: false, message: "Failed to create cart" },
          { status: 500 }
        );
      }
      
      // Verify the cart is not completed (shouldn't happen for new carts)
      if (cart.completed_at) {
        console.error("[Checkout Complete] Newly created cart is already completed - this shouldn't happen");
        await removeCartId();
        return NextResponse.json(
          { success: false, message: "Cart creation error. Please try again." },
          { status: 500 }
        );
      }
      
      cartId = cart.id;
      console.log("[Checkout Complete] Created new cart:", cartId);
    } catch (error: any) {
      console.error("[Checkout Complete] Error creating cart:", error);
      
      // Always clear cart ID on error to prevent reuse
      await removeCartId();
      
      // If error mentions "already completed", provide specific message
      if (error.message?.includes("already completed") || 
          error.message?.includes("is already completed") ||
          (error.message?.includes("Cart") && error.message?.includes("already completed"))) {
        return NextResponse.json(
          { success: false, message: "Previous cart was already completed. A new cart has been created. Please try again." },
          { status: 400 }
        );
      }
      
      return NextResponse.json(
        { success: false, message: error.message || "Failed to create cart" },
        { status: 500 }
      );
    }

    // IMPORTANT: Add items to cart FIRST, before setting addresses
    // This ensures items are in the cart when we complete the order
    // Process cart items from use-shopping-cart
    const customCables: any[] = [];
    let itemsAdded = 0;
    let itemsFailed = 0;
    const failedItems: string[] = [];
    
    if (cartItems && Array.isArray(cartItems) && cartItems.length > 0) {
      try {
        console.log(`[Checkout Complete] Processing ${cartItems.length} items to add to cart:`, cartItems.map((i: any) => ({
          name: i.name,
          slug: i.slug,
          variantId: (i as any).variantId,
          sku: (i as any).sku,
          quantity: i.quantity,
        })));
        
        for (const item of cartItems) {
          // Check if it's a custom cable
          const isCustomCable = item.metadata?.isCustom || item.slug === "custom-cable" || item.name?.startsWith("Custom Cable -");

          if (isCustomCable) {
            // Store custom cables for later (will be added to metadata)
            customCables.push(item);
            console.log(`[Checkout Complete] Identified custom cable: ${item.name}`);
            continue;
          }

          // For regular products, try to add to Medusa cart
          const productSlug = item.slug || item.id;
          
          if (!productSlug) {
            console.warn(`[Checkout Complete] Item ${item.name} has no slug or id, skipping`);
            itemsFailed++;
            failedItems.push(item.name || "Unknown item");
            continue;
          }
          
          try {
            console.log(`[Checkout Complete] Fetching product: ${productSlug}`);
            const productResponse = await medusaClient.getProductByHandle(productSlug);
            const medusaProduct = productResponse.product;
            
            if (!medusaProduct) {
              console.error(`[Checkout Complete] Product ${productSlug} not found in Medusa`);
              itemsFailed++;
              failedItems.push(item.name);
              continue;
            }
            
            if (!medusaProduct.variants || medusaProduct.variants.length === 0) {
              console.warn(`[Checkout Complete] Product ${productSlug} has no variants`);
              itemsFailed++;
              failedItems.push(item.name);
              continue;
            }
            
            let variantId: string | null = null;
            
            // Try to match variant by variantId or SKU from use-shopping-cart item
            if ((item as any).variantId) {
              variantId = (item as any).variantId;
              console.log(`[Checkout Complete] Using variantId from item: ${variantId}`);
            } else if ((item as any).sku) {
              const matchingVariant = medusaProduct.variants.find(
                (v: any) => v.sku === (item as any).sku
              );
              if (matchingVariant) {
                variantId = matchingVariant.id;
                console.log(`[Checkout Complete] Matched variant by SKU: ${variantId}`);
              }
            }
            
            // Fallback to first variant if no specific match found
            if (!variantId) {
              variantId = medusaProduct.variants[0].id;
              console.log(`[Checkout Complete] Using first variant as fallback: ${variantId}`);
            }
            
                try {
                  // Verify cart is not completed before adding items
                  const cartCheck = await retrieveCart(cartId, "id,completed_at");
                  if (cartCheck?.completed_at) {
                    console.error(`[Checkout Complete] Cart ${cartId} is already completed before adding items`);
                    await removeCartId();
                    return NextResponse.json(
                      { 
                        success: false, 
                        message: "Cart was completed during checkout. Please try again." 
                      },
                      { status: 400 }
                    );
                  }
                  
                  const addResult = await addLineItem(cartId, variantId, item.quantity || 1);
                  if (addResult) {
                    itemsAdded++;
                    console.log(`[Checkout Complete] ✅ Added item to cart: ${item.name}, variant: ${variantId}, quantity: ${item.quantity || 1}`);
                  } else {
                    console.warn(`[Checkout Complete] ⚠️ addLineItem returned null for: ${item.name}`);
                    itemsFailed++;
                    failedItems.push(item.name);
                  }
                } catch (addError: any) {
                  console.error(`[Checkout Complete] ❌ Error adding item ${item.name} (${productSlug}) to cart:`, {
                    error: addError.message,
                    variantId,
                    quantity: item.quantity || 1,
                    cartId,
                    isCompleted: addError.isCompleted,
                  });
                  
                  // If cart is completed, clear cart ID and return error immediately
                  if (addError.isCompleted || 
                      addError.message?.includes("already completed") || 
                      addError.message?.includes("is already completed") ||
                      (addError.message?.includes("Cart") && addError.message?.includes("already completed"))) {
                    await removeCartId();
                    return NextResponse.json(
                      { 
                        success: false, 
                        message: "Cart was completed during checkout. Please try again." 
                      },
                      { status: 400 }
                    );
                  }
                  
                  itemsFailed++;
                  failedItems.push(item.name);
                }
          } catch (productError: any) {
            console.error(`[Checkout Complete] Error fetching product ${productSlug} from Medusa:`, productError.message);
            itemsFailed++;
            failedItems.push(item.name);
          }
        }
        
        // Wait for items to be added and verify
        await new Promise(resolve => setTimeout(resolve, 2000)); // Increased wait time
        cart = await retrieveCart(cartId, "*items,+items.total,+items.variant,+items.product,*payment_collection");
        
        // Check if we have regular items before storing custom cables
        let hasRegularItems = cart?.items && cart.items.length > 0;
        
        // Store custom cables in cart metadata if any
        if (customCables.length > 0) {
          await updateCart({
            metadata: {
              customCables: JSON.stringify(customCables),
            },
          });
          console.log(`[Checkout Complete] Stored ${customCables.length} custom cables in cart metadata`);
          
          // IMPORTANT: Medusa requires at least one line item to complete a cart
          // If we only have custom cables (no regular items), add a placeholder product
          if (!hasRegularItems && customCables.length > 0) {
            const placeholderVariantId = process.env.MEDUSA_PLACEHOLDER_VARIANT_ID;
            if (placeholderVariantId) {
              try {
                // Calculate total quantity and price for all custom cables
                let totalQuantity = 0;
                let totalCustomCablePrice = 0; // In cents
                const customCableDetails: any[] = [];
                
                for (const customCable of customCables) {
                  const quantity = customCable.quantity || 1;
                  totalQuantity += quantity;
                  
                  // Extract price from custom cable (it's in cents from use-shopping-cart)
                  const cablePrice = customCable.price || 0;
                  totalCustomCablePrice += cablePrice * quantity; // Price per unit × quantity
                  
                  // Build details for this cable
                  const details = {
                    name: customCable.name || "Custom Cable",
                    cableSeries: customCable.metadata?.cableSeries || "",
                    cableType: customCable.metadata?.cableTypeName || customCable.metadata?.cableType || "",
                    connector1: customCable.metadata?.connector1Name || customCable.metadata?.connector1 || "",
                    connector2: customCable.metadata?.connector2Name || customCable.metadata?.connector2 || "",
                    length: customCable.metadata?.length || "",
                    quantity: quantity,
                    price: cablePrice / 100, // Convert to dollars for display
                  };
                  customCableDetails.push(details);
                }
                
                console.log(`[Checkout Complete] Adding placeholder product for ${customCables.length} custom cable(s), total price: $${(totalCustomCablePrice / 100).toFixed(2)}`);
                const placeholderResult = await addLineItem(cartId, placeholderVariantId, totalQuantity);
                if (!placeholderResult) {
                  throw new Error("addLineItem returned null");
                }
                
                // Wait and verify placeholder was added
                await new Promise(resolve => setTimeout(resolve, 2000));
                cart = await retrieveCart(cartId, "*items,+items.total,+items.variant,+items.product");
                
                // Verify placeholder was actually added
                const placeholderAdded = cart?.items && cart.items.length > 0;
                if (!placeholderAdded) {
                  throw new Error("Placeholder product was not added to cart");
                }
                
                // Find the placeholder line item and update it with custom cable details
                const placeholderLineItem = cart.items.find((item: any) => 
                  item.variant?.id === placeholderVariantId || 
                  item.variant_id === placeholderVariantId
                );
                
                if (placeholderLineItem) {
                  // Build custom cable title and description for metadata
                  const customCableTitle = customCables.length === 1
                    ? customCables[0].name || "Custom Cable"
                    : `Custom Cables: ${customCableDetails.map((c: any) => 
                        `${c.connector1} to ${c.connector2} (${c.length}ft)`
                      ).join(", ")}`;
                  
                  const customCableDescription = customCables.length === 1
                    ? `${customCableDetails[0].cableType}: ${customCableDetails[0].connector1} to ${customCableDetails[0].connector2}, ${customCableDetails[0].length}ft`
                    : customCableDetails.map((c: any) => 
                        `${c.cableType}: ${c.connector1} to ${c.connector2}, ${c.length}ft (×${c.quantity})`
                      ).join('; ');

                  // Calculate unit price (price per unit, not total)
                  const unitPriceInCents = customCables.length > 0 
                    ? Math.round(totalCustomCablePrice / totalQuantity) // Average price per unit
                    : totalCustomCablePrice;

                  // IMPORTANT: Medusa v2 line items don't support title, description, or unit_price updates
                  // All custom details must be stored in metadata
                  // The admin will need to read from metadata to display custom details
                  const lineItemMetadata: Record<string, any> = {
                    isCustomCable: true,
                    customCables: JSON.stringify(customCableDetails),
                    totalCustomCablePrice: totalCustomCablePrice, // Price in cents
                    unitCustomCablePrice: unitPriceInCents, // Unit price in cents
                    customCableCount: customCables.length,
                    // Store formatted title and description in metadata for admin display
                    customTitle: customCableTitle,
                    customDescription: customCableDescription,
                    // Add summary for easy viewing in admin
                    summary: customCableDetails.map((c: any) => 
                      `${c.connector1} to ${c.connector2} (${c.length}ft, ${c.cableType}) x${c.quantity} - $${c.price.toFixed(2)}`
                    ).join("; "),
                    // Store price in dollars for easy display
                    totalCustomCablePriceDollars: (totalCustomCablePrice / 100).toFixed(2),
                    unitCustomCablePriceDollars: (unitPriceInCents / 100).toFixed(2),
                  };
                  
                  // Add individual cable details to metadata for each cable
                  customCables.forEach((cable, index) => {
                    lineItemMetadata[`cable_${index}_name`] = cable.name || "Custom Cable";
                    lineItemMetadata[`cable_${index}_cableSeries`] = cable.metadata?.cableSeries || "";
                    lineItemMetadata[`cable_${index}_cableType`] = cable.metadata?.cableTypeName || cable.metadata?.cableType || "";
                    lineItemMetadata[`cable_${index}_connector1`] = cable.metadata?.connector1Name || cable.metadata?.connector1 || "";
                    lineItemMetadata[`cable_${index}_connector2`] = cable.metadata?.connector2Name || cable.metadata?.connector2 || "";
                    lineItemMetadata[`cable_${index}_length`] = cable.metadata?.length || "";
                    lineItemMetadata[`cable_${index}_quantity`] = cable.quantity || 1;
                    lineItemMetadata[`cable_${index}_price`] = (cable.price || 0) / 100; // Convert to dollars
                    lineItemMetadata[`cable_${index}_priceCents`] = cable.price || 0; // Keep in cents
                  });
                  
                  try {
                    // Medusa v2 only supports metadata updates on line items
                    // Title, description, and unit_price are immutable and come from the variant
                    // IMPORTANT: quantity field is REQUIRED even when only updating metadata
                    console.log(`[Checkout Complete] Updating line item metadata with custom cable details:`, {
                      customTitle: customCableTitle,
                      customDescription: customCableDescription,
                      unitPriceCents: unitPriceInCents,
                      unitPriceDollars: `$${(unitPriceInCents / 100).toFixed(2)}`,
                      totalPriceCents: totalCustomCablePrice,
                      totalPriceDollars: `$${(totalCustomCablePrice / 100).toFixed(2)}`,
                      lineItemQuantity: placeholderLineItem.quantity,
                    });

                    const updateResult = await updateLineItem(cartId, placeholderLineItem.id, {
                      quantity: placeholderLineItem.quantity, // REQUIRED: Medusa requires quantity even for metadata-only updates
                      metadata: lineItemMetadata,
                    });
                    
                    // Verify the update worked by retrieving the cart again
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    const verifyCart = await retrieveCart(cartId, "*items,+items.variant,+items.product");
                    const updatedLineItem = verifyCart?.items?.find((item: any) => item.id === placeholderLineItem.id);
                    
                    console.log(`[Checkout Complete] ✅ Updated placeholder line item metadata with custom cable details`);
                    console.log(`[Checkout Complete] Custom Title (in metadata): ${customCableTitle}`);
                    console.log(`[Checkout Complete] Custom Description (in metadata): ${customCableDescription}`);
                    console.log(`[Checkout Complete] Unit price (in metadata): $${(unitPriceInCents / 100).toFixed(2)}`);
                    console.log(`[Checkout Complete] Total price (in metadata): $${(totalCustomCablePrice / 100).toFixed(2)}`);
                    console.log(`[Checkout Complete] Verified line item metadata:`, {
                      id: updatedLineItem?.id,
                      hasMetadata: !!updatedLineItem?.metadata,
                      metadataKeys: updatedLineItem?.metadata ? Object.keys(updatedLineItem.metadata) : [],
                      customTitle: updatedLineItem?.metadata?.customTitle,
                      unitPrice: updatedLineItem?.metadata?.unitCustomCablePriceDollars,
                    });
                  } catch (updateError: any) {
                    console.error(`[Checkout Complete] ❌ Error updating line item metadata:`, updateError.message);
                    console.error(`[Checkout Complete] Error details:`, updateError);
                    // Don't throw - continue with checkout, but admin will show default product details
                    // The metadata is also stored in cart metadata as a backup
                  }
                }
                
                console.log(`[Checkout Complete] ✅ Placeholder product added for custom cables. Cart now has ${cart.items.length} item(s)`);
                hasRegularItems = true; // Update flag since we now have an item
              } catch (placeholderError: any) {
                console.error(`[Checkout Complete] ❌ Error adding placeholder product:`, placeholderError.message);
                return NextResponse.json(
                  { 
                    success: false, 
                    message: `Failed to add placeholder product for custom cables. Please contact support or add a regular product to your cart. Error: ${placeholderError.message}` 
                  },
                  { status: 400 }
                );
              }
            } else {
              console.error(`[Checkout Complete] ❌ MEDUSA_PLACEHOLDER_VARIANT_ID not set - cannot complete order with only custom cables`);
              return NextResponse.json(
                { 
                  success: false, 
                  message: "Custom cables require a placeholder product configuration. Please contact support or add a regular product to your cart." 
                },
                { status: 400 }
              );
            }
          }
        }
        
        // Final refresh of cart to get latest state
        cart = await retrieveCart(cartId, "*items,+items.total,+items.variant,+items.product,*payment_collection");
        
        // Re-check hasRegularItems after placeholder addition
        const finalHasRegularItems = cart?.items && cart.items.length > 0;
        
        console.log(`[Checkout Complete] Cart after adding items:`, {
          itemsCount: cart?.items?.length || 0,
          itemsAdded: itemsAdded,
          customCablesCount: customCables.length,
          hasPaymentCollection: !!cart?.payment_collection,
          cartItems: cart?.items?.map((item: any) => ({
            id: item.id,
            title: item.title || item.variant?.title,
            quantity: item.quantity,
            variantId: item.variant?.id,
          })),
        });
        
        // Verify items were added
        const hasCustomCables = customCables.length > 0;
        
        console.log(`[Checkout Complete] Item addition summary:`, {
          itemsAttempted: cartItems.length,
          itemsAdded: itemsAdded,
          itemsFailed: itemsFailed,
          failedItems: failedItems,
          cartItemsCount: cart?.items?.length || 0,
          hasRegularItems,
          hasCustomCables,
        });
        
        if (!hasRegularItems && !hasCustomCables) {
          // Provide detailed error message
          let errorMessage = "No items were added to the cart.";
          if (itemsFailed > 0) {
            errorMessage += ` Failed to add ${itemsFailed} item(s): ${failedItems.join(", ")}.`;
          }
          if (itemsAdded > 0 && !hasRegularItems) {
            errorMessage += ` Tried to add ${itemsAdded} item(s) but they don't appear in the cart.`;
          }
          
          return NextResponse.json(
            { 
              success: false, 
              message: errorMessage + " Please check your cart items and try again." 
            },
            { status: 400 }
          );
        }
        
        console.log(`[Checkout Complete] ✅ Items verified: ${hasRegularItems ? cart.items.length + ' regular items' : ''} ${hasCustomCables ? customCables.length + ' custom cables' : ''}`);
      } catch (itemsError: any) {
        console.error("[Checkout Complete] Error adding items to cart:", itemsError);
        return NextResponse.json(
          { success: false, message: `Failed to add items to cart: ${itemsError.message}` },
          { status: 500 }
        );
      }
    } else {
      return NextResponse.json(
        { success: false, message: "No items in cart" },
        { status: 400 }
      );
    }

    // Get region info for country code validation (after items are added)
    cart = await retrieveCart(cartId, "*region,*items");
    const regionCountries = cart.region?.countries || [];
    const regionCountryCodes = regionCountries
      .map((c: any) => c.iso_2?.toLowerCase())
      .filter(Boolean) || [];
    
    // Use first region country code or fallback to "us"
    const shippingCountryCode = regionCountryCodes[0] || "us";

    // NOW set addresses after items are added
    const cartData: any = {
      email,
      shipping_address: {
        first_name: shipping_address.firstName || shipping_address.first_name,
        last_name: shipping_address.lastName || shipping_address.last_name,
        address_1: shipping_address.street || shipping_address.address_1,
        address_2: shipping_address.apartment || shipping_address.address_2 || "",
        city: shipping_address.town || shipping_address.city,
        country_code: shippingCountryCode,
        postal_code: shipping_address.postalCode || shipping_address.postal_code || "00000",
        province: shipping_address.province || shipping_address.regionName || "",
        phone: shipping_address.phone || "",
      },
    };

    // Add billing address if different from shipping
    if (billing_address && !same_as_billing) {
      cartData.billing_address = {
        first_name: billing_address.firstName || billing_address.first_name,
        last_name: billing_address.lastName || billing_address.last_name,
        address_1: billing_address.street || billing_address.address_1,
        address_2: billing_address.apartment || billing_address.address_2 || "",
        city: billing_address.town || billing_address.city,
        country_code: shippingCountryCode,
        postal_code: billing_address.postalCode || billing_address.postal_code || "00000",
        province: billing_address.province || billing_address.regionName || "",
        phone: billing_address.phone || "",
      };
    } else {
      cartData.billing_address = cartData.shipping_address;
    }

    // Update cart with addresses
    try {
      await updateCart(cartData);
      cart = await retrieveCart(cartId, "*shipping_address,*billing_address,*region,*items");
    } catch (updateError: any) {
      console.error("[Checkout Complete] Error updating cart:", updateError);
      // Try with fallback country code
      cartData.shipping_address.country_code = "us";
      cartData.billing_address.country_code = "us";
      try {
        await updateCart(cartData);
        cart = await retrieveCart(cartId, "*shipping_address,*billing_address,*region,*items");
      } catch (retryError: any) {
        return NextResponse.json(
          { success: false, message: retryError.message || "Failed to update cart with addresses" },
          { status: 400 }
        );
      }
    }

    // Wait for cart update to propagate
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Get updated cart with all necessary fields
    cart = await retrieveCart(cartId, "*shipping_methods,*items,+items.total,+items.variant,+items.product,*payment_collection,*payment_collection.payment_sessions,*region.payment_providers,*shipping_address,*billing_address");

    // Verify cart has items before proceeding
    if (!cart?.items || cart.items.length === 0) {
      return NextResponse.json(
        { success: false, message: "Cart is empty. Please add items to your cart." },
        { status: 400 }
      );
    }

    // Set shipping method if not already set
    if (!cart?.shipping_methods || cart.shipping_methods.length === 0) {
      try {
        const shippingMethods = await listCartShippingMethods(cartId!);
        
        if (shippingMethods && shippingMethods.length > 0) {
          await setShippingMethod({
            cartId: cartId!,
            shippingMethodId: shippingMethods[0].id,
          });
          
          await new Promise(resolve => setTimeout(resolve, 1500));
          cart = await retrieveCart(cartId, "*shipping_methods,*items,*payment_collection");
        } else {
          return NextResponse.json(
            { success: false, message: "No shipping methods available. Please contact support." },
            { status: 400 }
          );
        }
      } catch (shippingError: any) {
        console.error("[Checkout Complete] Error setting shipping method:", shippingError);
        return NextResponse.json(
          { success: false, message: `Failed to set shipping method: ${shippingError.message}` },
          { status: 400 }
        );
      }
    }

    // Step 4: Initiate payment session (this creates payment collection automatically)
    // Following the frontend project's approach - use initiatePaymentSession instead of manually creating payment collections
    cart = await retrieveCart(cartId, "*items,*shipping_address,*billing_address,*shipping_methods,*payment_collection,*payment_collection.payment_sessions,*region.payment_providers");
    
    if (!cart?.items || cart.items.length === 0) {
      return NextResponse.json(
        { success: false, message: "Cart is empty. Cannot complete checkout." },
        { status: 400 }
      );
    }
    
    // Check if payment collection already exists and has a session
    const existingSession = cart?.payment_collection?.payment_sessions?.find(
      (session: any) => session.status === "pending"
    );
    
    // Determine payment provider based on payment method
    let paymentProviderId: string | null = null;
    
    if (payment_method === "cod") {
      // For COD, try manual/system default first
      const availableProviders = cart?.region?.payment_providers || [];
      const manualProvider = availableProviders.find((p: any) => p.id?.startsWith("pp_system_default"));
      const stripeProvider = availableProviders.find((p: any) => p.id?.startsWith("pp_stripe_"));
      
      paymentProviderId = manualProvider?.id || stripeProvider?.id || "pp_system_default";
    } else {
      // For Stripe, use Stripe provider
      const availableProviders = cart?.region?.payment_providers || [];
      const stripeProvider = availableProviders.find((p: any) => p.id?.startsWith("pp_stripe_"));
      paymentProviderId = stripeProvider?.id || "pp_stripe_stripe";
    }
    
    // Initiate payment session if not already initiated (this creates payment collection automatically)
    if (!existingSession && paymentProviderId) {
      try {
        console.log("[Checkout Complete] Initiating payment session with provider:", paymentProviderId);
        
        // Use medusaClient to initiate payment session (similar to frontend's SDK approach)
        const paymentResponse = await medusaClient.initiatePaymentSession(cart, {
          provider_id: paymentProviderId,
        });
        
        // Refresh cart to get the payment session
        await new Promise(resolve => setTimeout(resolve, 1000));
        cart = await retrieveCart(cartId, "*payment_collection,*payment_collection.payment_sessions");
        console.log("[Checkout Complete] Payment session initiated:", cart?.payment_collection?.payment_sessions);
      } catch (paymentError: any) {
        console.error("[Checkout Complete] Error initiating payment session:", paymentError);
        
        // Try alternative providers if the first one fails
        if (payment_method === "cod") {
          try {
            console.log("[Checkout Complete] Trying Stripe provider as fallback for COD");
            await medusaClient.initiatePaymentSession(cart, {
              provider_id: "pp_stripe_stripe",
            });
            await new Promise(resolve => setTimeout(resolve, 1000));
            cart = await retrieveCart(cartId, "*payment_collection,*payment_collection.payment_sessions");
          } catch (stripeError: any) {
            console.error("[Checkout Complete] Error initiating Stripe payment session:", stripeError);
            // Last resort: try system default
            try {
              await medusaClient.initiatePaymentSession(cart, {
                provider_id: "pp_system_default",
              });
              await new Promise(resolve => setTimeout(resolve, 1000));
              cart = await retrieveCart(cartId, "*payment_collection,*payment_collection.payment_sessions");
            } catch (defaultError: any) {
              console.error("[Checkout Complete] All payment provider attempts failed:", defaultError);
              // Continue anyway - Medusa might handle it during cart completion
            }
          }
        }
      }
    } else if (existingSession) {
      console.log("[Checkout Complete] Payment session already exists:", existingSession.provider_id);
    } else {
      console.warn("[Checkout Complete] No payment provider ID determined, proceeding without payment session");
    }

    // Final verification: Ensure cart has items and payment collection before completing
    // Note: total and subtotal are calculated automatically, not queryable fields
    cart = await retrieveCart(cartId, "*items,+items.total,+items.variant,+items.product,*payment_collection,*payment_collection.payment_sessions");
    
    const finalCartHasItems = cart?.items && cart.items.length > 0;
    const hasCustomCables = customCables.length > 0;
    
    console.log("[Checkout Complete] Final cart verification before completion:", {
      hasRegularItems: finalCartHasItems,
      itemsCount: cart?.items?.length || 0,
      hasCustomCables,
      customCablesCount: customCables.length,
      items: cart?.items?.map((item: any) => ({
        id: item.id,
        title: item.title || item.variant?.title,
        quantity: item.quantity,
      })),
    });
    
    if (!finalCartHasItems && !hasCustomCables) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Cannot complete order: Cart is empty. Please add items to your cart." 
        },
        { status: 400 }
      );
    }
    
    // If we have custom cables but no regular items, this should not happen (placeholder should have been added)
    if (!finalCartHasItems && hasCustomCables) {
      console.error("[Checkout Complete] ❌ CRITICAL: Custom cables present but no items in cart - placeholder should have been added");
      return NextResponse.json(
        { 
          success: false, 
          message: "Cart configuration error. Please try again or contact support." 
        },
        { status: 400 }
      );
    }
    
    // CRITICAL: Payment collection MUST exist before completing cart
    // Medusa v2 requires payment collection to be initiated before cart completion
    if (!cart?.payment_collection) {
      console.error("[Checkout Complete] ❌ Payment collection not found - cannot complete cart");
      console.error("[Checkout Complete] Cart state:", {
        hasItems: finalCartHasItems || hasCustomCables,
        itemsCount: cart?.items?.length || 0,
        hasShippingAddress: !!cart?.shipping_address,
        hasShippingMethod: !!cart?.shipping_methods?.[0],
        hasPaymentCollection: false,
      });
      
      // Try one more time to initiate payment session
      if (paymentProviderId) {
        try {
          console.log("[Checkout Complete] Last attempt: Initiating payment session to create payment collection...");
          await medusaClient.initiatePaymentSession(cart, {
            provider_id: paymentProviderId,
          });
          await new Promise(resolve => setTimeout(resolve, 2000));
          cart = await retrieveCart(cartId, "*payment_collection,*payment_collection.payment_sessions");
          
          if (!cart?.payment_collection) {
            return NextResponse.json(
              { 
                success: false, 
                message: "Payment collection could not be created. Please try again or contact support." 
              },
              { status: 400 }
            );
          }
          console.log("[Checkout Complete] ✅ Payment collection created on last attempt");
        } catch (lastError: any) {
          console.error("[Checkout Complete] ❌ Last attempt to create payment collection failed:", lastError);
          return NextResponse.json(
            { 
              success: false, 
              message: `Failed to initialize payment: ${lastError.message || "Payment collection could not be created"}` 
            },
            { status: 400 }
          );
        }
      } else {
        return NextResponse.json(
          { 
            success: false, 
            message: "Payment collection is required but could not be created. Please contact support." 
          },
          { status: 400 }
        );
      }
    } else {
      console.log("[Checkout Complete] ✅ Payment collection exists:", cart.payment_collection.id);
    }

    console.log("[Checkout Complete] Final cart check before completion:", {
      hasRegularItems: finalCartHasItems,
      regularItemsCount: cart?.items?.length || 0,
      hasCustomCables,
      customCablesCount: customCables.length,
      cartTotal: cart?.total,
      cartSubtotal: cart?.subtotal,
      hasPaymentCollection: !!cart?.payment_collection,
      paymentSessions: cart?.payment_collection?.payment_sessions?.length || 0,
      items: cart?.items?.map((item: any) => ({
        title: item.title || item.variant?.title,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total: item.total,
      })),
    });

    // Complete cart to create order
    try {
      // Final check: ensure cart is not already completed
      cart = await retrieveCart(cartId, "id,completed_at");
      if (cart?.completed_at) {
        console.error("[Checkout Complete] Cart is already completed before completion attempt");
        await removeCartId();
        return NextResponse.json(
          { 
            success: false, 
            message: "This cart has already been completed. Please start a new order." 
          },
          { status: 400 }
        );
      }
      
      // Prepare order metadata with custom cable details if any
      // This metadata will be visible in the admin order details
      let orderMetadata: Record<string, any> = {};
      if (customCables.length > 0) {
        const customCableDetails: any[] = [];
        let totalCustomCablePrice = 0;
        
        for (const customCable of customCables) {
          const cablePrice = customCable.price || 0;
          totalCustomCablePrice += cablePrice * (customCable.quantity || 1);
          
          customCableDetails.push({
            name: customCable.name || "Custom Cable",
            cableSeries: customCable.metadata?.cableSeries || "",
            cableType: customCable.metadata?.cableTypeName || customCable.metadata?.cableType || "",
            connector1: customCable.metadata?.connector1Name || customCable.metadata?.connector1 || "",
            connector2: customCable.metadata?.connector2Name || customCable.metadata?.connector2 || "",
            length: customCable.metadata?.length || "",
            quantity: customCable.quantity || 1,
            price: cablePrice / 100, // Convert to dollars
          });
        }
        
        // Build formatted title and description for order metadata
        const customCableTitle = customCables.length === 1
          ? customCables[0].name || "Custom Cable"
          : `Custom Cables: ${customCableDetails.map((c: any) => 
              `${c.connector1} to ${c.connector2} (${c.length}ft)`
            ).join(", ")}`;
        
        const customCableDescription = customCables.length === 1
          ? `${customCableDetails[0].cableType}: ${customCableDetails[0].connector1} to ${customCableDetails[0].connector2}, ${customCableDetails[0].length}ft`
          : customCableDetails.map((c: any) => 
              `${c.cableType}: ${c.connector1} to ${c.connector2}, ${c.length}ft (×${c.quantity})`
            ).join('; ');
        
        orderMetadata.hasCustomCables = true;
        orderMetadata.customCables = JSON.stringify(customCableDetails);
        orderMetadata.customCableCount = customCables.length;
        orderMetadata.totalCustomCablePrice = totalCustomCablePrice / 100; // Convert to dollars
        orderMetadata.customCableTitle = customCableTitle; // For admin display
        orderMetadata.customCableDescription = customCableDescription; // For admin display
        orderMetadata.customCableSummary = customCableDetails.map((c: any) => 
          `${c.connector1} to ${c.connector2} (${c.length}ft, ${c.cableType}) x${c.quantity} - $${c.price.toFixed(2)}`
        ).join("; ");
        
        // Store individual cable details for easy access
        customCableDetails.forEach((cable, index) => {
          orderMetadata[`customCable_${index}_name`] = cable.name;
          orderMetadata[`customCable_${index}_cableType`] = cable.cableType;
          orderMetadata[`customCable_${index}_connector1`] = cable.connector1;
          orderMetadata[`customCable_${index}_connector2`] = cable.connector2;
          orderMetadata[`customCable_${index}_length`] = cable.length;
          orderMetadata[`customCable_${index}_quantity`] = cable.quantity;
          orderMetadata[`customCable_${index}_price`] = cable.price;
        });
      }
      
      // Prepare metadata in the correct format for completeCart
      // completeCart expects { metadata: {...} } format
      const completeCartMetadata = Object.keys(orderMetadata).length > 0 
        ? { metadata: orderMetadata } 
        : undefined;
      
      console.log("[Checkout Complete] Completing cart with metadata:", {
        hasMetadata: !!completeCartMetadata,
        metadataKeys: completeCartMetadata ? Object.keys(orderMetadata) : [],
        sampleMetadata: completeCartMetadata ? {
          hasCustomCables: orderMetadata.hasCustomCables,
          customCableTitle: orderMetadata.customCableTitle,
          customCableDescription: orderMetadata.customCableDescription,
          totalCustomCablePrice: orderMetadata.totalCustomCablePrice,
        } : null,
      });
      
      const result = await completeCart(cartId, completeCartMetadata);
      
      if (result.type === "order") {
        const order = result.order;
        
        console.log("[Checkout Complete] Order created successfully:", {
          orderId: order?.id,
          displayId: order?.display_id,
          total: order?.total,
          subtotal: order?.subtotal,
          itemsCount: order?.items?.length || 0,
          customCablesCount: customCables.length,
          items: order?.items?.map((item: any) => ({
            title: item.title || item.variant?.title,
            quantity: item.quantity,
            unit_price: item.unit_price,
            total: item.total,
            metadata: item.metadata,
          })),
          orderMetadata: order?.metadata,
        });
        
        if (customCables.length > 0) {
          console.log("[Checkout Complete] Custom cable details in order:", orderMetadata.customCableSummary);
        }
        
        // Clear cart ID after successful order completion
        await removeCartId();
        
        return NextResponse.json({
          success: true,
          order: order,
          message: "Order created successfully",
        });
      } else {
        return NextResponse.json(
          { success: false, message: "Failed to create order", errors: result },
          { status: 400 }
        );
      }
    } catch (error: any) {
      console.error("[Checkout Complete] Error completing cart:", error);
      
      // Handle "already completed" error
      if (error.message?.includes("already completed") || 
          error.message?.includes("is already completed") ||
          error.message?.includes("Cart") && error.message?.includes("already completed")) {
        await removeCartId();
        return NextResponse.json(
          { 
            success: false, 
            message: "This cart has already been completed. Please start a new order." 
          },
          { status: 400 }
        );
      }
      
      return NextResponse.json(
        { success: false, message: error.message || "Failed to complete order" },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error("[Checkout Complete] ❌ Unhandled error:", error);
    return NextResponse.json(
      { 
        success: false, 
        message: error.message || "Internal Server Error",
      },
      { status: 500 }
    );
  }
}

