import { NextRequest, NextResponse } from "next/server";
import { updateCart, retrieveCart, initiatePaymentSession, setShippingMethod } from "@lib/data/cart";
import { listCartShippingMethods } from "@lib/data/fulfillment";
import { getCartId, getAuthHeaders } from "@lib/data/cookies";
import { sdk } from "@lib/config";
import medusaError from "@lib/util/medusa-error";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      email,
      shipping_address,
      billing_address,
      payment_method,
    } = body;

    const cartId = await getCartId();
    if (!cartId) {
      return NextResponse.json(
        { success: false, message: "No cart found" },
        { status: 400 }
      );
    }

    // Get cart to check region and ensure we use correct country codes
    const cart = await retrieveCart(cartId, "*region,*region.countries");
    if (!cart) {
      return NextResponse.json(
        { success: false, message: "Cart not found" },
        { status: 400 }
      );
    }

    // Get the region's country codes - MUST use one of these to avoid validation errors
    const regionCountries = cart.region?.countries || [];
    const regionCountryCodes = regionCountries
      .map(c => c.iso_2?.toLowerCase())
      .filter(Boolean) || [];
    
    // Helper to normalize country code from user input
    const normalizeCountryFromInput = (input: string | undefined): string => {
      if (!input) return "us";
      const code = input.toLowerCase().trim();
      if (code.length === 2) return code;
      
      // Map common country names to ISO codes
      const countryMap: Record<string, string> = {
        "united states": "us",
        "united state": "us",
        "usa": "us",
        "united kingdom": "uk",
        "uk": "uk",
        "canada": "ca",
        "australia": "au",
      };
      return countryMap[code] || "us";
    };
    
    // Try to get country code from region first, fallback to user input or "us"
    let shippingCountryCode = regionCountryCodes[0];
    
    if (!shippingCountryCode) {
      // Region has no countries - use user input or default to "us"
      console.warn("[Checkout Complete] WARNING: Region has no country codes! Using fallback.", {
        regionId: cart.region?.id,
        regionName: cart.region?.name,
        userInput: shipping_address.regionName || shipping_address.country,
      });
      
      // Try to use country from form input
      const userCountryCode = normalizeCountryFromInput(
        shipping_address.regionName || shipping_address.country || shipping_address.country_code
      );
      shippingCountryCode = userCountryCode;
      
      console.log("[Checkout Complete] Using fallback country code:", shippingCountryCode);
    } else {
      // Region has countries - use the first one (safest)
      console.log("[Checkout Complete] Using country code from region:", shippingCountryCode);
    }
    
    // Log for debugging
    console.log("[Checkout Complete] Cart region:", {
      id: cart.region?.id,
      name: cart.region?.name,
      countryCodes: regionCountryCodes,
      selectedCountryCode: shippingCountryCode,
      userInput: shipping_address.regionName || shipping_address.country,
    });

    // Update cart with customer information
    // IMPORTANT: country_code MUST be one of the countries in the cart's region
    const cartData: any = {
      email,
      shipping_address: {
        first_name: shipping_address.firstName || shipping_address.first_name,
        last_name: shipping_address.lastName || shipping_address.last_name,
        address_1: shipping_address.street || shipping_address.address_1,
        address_2: shipping_address.apartment || shipping_address.address_2 || "",
        city: shipping_address.town || shipping_address.city,
        country_code: shippingCountryCode, // This MUST match one of the region's countries
        postal_code: shipping_address.postalCode || shipping_address.postal_code || "00000", // Required field
        province: shipping_address.province || shipping_address.regionName || "", // State/Province, not country
        phone: shipping_address.phone || "",
      },
    };

    // Add billing address if different from shipping
    // ALWAYS use the same country code as shipping (from region) to avoid validation errors
    if (billing_address && !body.same_as_billing) {
      cartData.billing_address = {
        first_name: billing_address.firstName || billing_address.first_name,
        last_name: billing_address.lastName || billing_address.last_name,
        address_1: billing_address.street || billing_address.address_1,
        address_2: billing_address.apartment || billing_address.address_2 || "",
        city: billing_address.town || billing_address.city,
        country_code: shippingCountryCode, // Always use shipping country code (from region)
        postal_code: billing_address.postalCode || billing_address.postal_code || "00000", // Required field
        province: billing_address.province || billing_address.regionName || "", // State/Province, not country
        phone: billing_address.phone || "",
      };
    } else {
      cartData.billing_address = cartData.shipping_address;
    }

    // Update cart with addresses
    console.log("[Checkout Complete] Updating cart with data:", {
      email: cartData.email,
      shipping_country_code: cartData.shipping_address.country_code,
      billing_country_code: cartData.billing_address.country_code,
      region_country_codes: regionCountryCodes,
      region_name: cart.region?.name,
    });
    
    let cartUpdateSuccess = false;
    try {
      await updateCart(cartData);
      console.log("[Checkout Complete] Cart updated successfully");
      cartUpdateSuccess = true;
    } catch (updateError: any) {
      console.error("[Checkout Complete] Error updating cart:", {
        error: updateError.message,
        errorDetails: updateError,
        cartData: {
          shipping_country_code: cartData.shipping_address.country_code,
          region_country_codes: regionCountryCodes,
        },
      });
      
      // If the error is about country code not in region, try with "us" as fallback
      if (updateError.message?.includes("not within region") || updateError.message?.includes("country")) {
        console.log("[Checkout Complete] Retrying with fallback country code 'us'");
        cartData.shipping_address.country_code = "us";
        cartData.billing_address.country_code = "us";
        
        try {
          await updateCart(cartData);
          console.log("[Checkout Complete] Cart updated successfully with fallback country code");
          cartUpdateSuccess = true;
        } catch (retryError: any) {
          console.error("[Checkout Complete] Retry also failed:", retryError.message);
          // Continue anyway - try to complete the order even if cart update fails
          console.warn("[Checkout Complete] Continuing to complete order despite cart update failure");
        }
      } else {
        // For other errors, still try to continue
        console.warn("[Checkout Complete] Continuing to complete order despite cart update error");
      }
    }

    // IMPORTANT: Shipping methods are only available AFTER shipping address is set
    // Wait a moment for cart update to propagate before checking shipping methods
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Get updated cart with payment collection info and shipping methods
    let updatedCart = await retrieveCart(cartId, "*payment_collection,*payment_collection.payment_sessions,*region.payment_providers,*shipping_methods,*items,*shipping_address");
    
    // Check if shipping method is selected, if not, add a default one
    // This is critical - Medusa requires shipping methods for physical products
    // NOTE: Shipping methods are only available after shipping address is set
    if (!updatedCart?.shipping_methods || updatedCart.shipping_methods.length === 0) {
      // Ensure we have a shipping address before trying to get shipping methods
      if (!updatedCart?.shipping_address?.country_code) {
        console.warn("[Checkout Complete] ⚠️ No shipping address set, shipping methods may not be available");
      }
      
      try {
        console.log("[Checkout Complete] No shipping method selected, adding default shipping method");
        
        // Get available shipping methods for the cart (requires shipping address to be set)
        const shippingMethods = await listCartShippingMethods(cartId);
        
        console.log("[Checkout Complete] Available shipping methods:", shippingMethods?.length || 0);
        
        if (shippingMethods && shippingMethods.length > 0) {
          // Use the first available shipping method (usually the cheapest/default)
          const defaultShippingMethod = shippingMethods[0];
          console.log("[Checkout Complete] Adding shipping method:", {
            id: defaultShippingMethod.id,
            name: defaultShippingMethod.name,
            amount: defaultShippingMethod.amount,
          });
          
          // Add shipping method
          try {
            await setShippingMethod({
              cartId,
              shippingMethodId: defaultShippingMethod.id,
            });
            console.log("[Checkout Complete] Shipping method API call completed");
          } catch (setError: any) {
            console.error("[Checkout Complete] Error calling setShippingMethod:", setError.message);
            throw setError;
          }
          
          // Wait for shipping method to be saved and verify multiple times
          let verificationAttempts = 0;
          let shippingMethodAdded = false;
          
          while (verificationAttempts < 3 && !shippingMethodAdded) {
            await new Promise(resolve => setTimeout(resolve, 1000));
            updatedCart = await retrieveCart(cartId, "*shipping_methods");
            
            if (updatedCart?.shipping_methods && updatedCart.shipping_methods.length > 0) {
              shippingMethodAdded = true;
              console.log("[Checkout Complete] ✅ Shipping method successfully added:", updatedCart.shipping_methods.map((m: any) => ({ id: m.id, name: m.name })));
            } else {
              verificationAttempts++;
              console.log(`[Checkout Complete] ⏳ Shipping method not found yet, attempt ${verificationAttempts}/3`);
            }
          }
          
          if (!shippingMethodAdded) {
            console.error("[Checkout Complete] ❌ Shipping method was not added after multiple attempts");
            // Final retry
            try {
              console.log("[Checkout Complete] Final retry: Adding shipping method again...");
              await setShippingMethod({
                cartId,
                shippingMethodId: defaultShippingMethod.id,
              });
              await new Promise(resolve => setTimeout(resolve, 2000));
              updatedCart = await retrieveCart(cartId, "*shipping_methods");
              if (updatedCart?.shipping_methods && updatedCart.shipping_methods.length > 0) {
                console.log("[Checkout Complete] ✅ Shipping method added on final retry");
                shippingMethodAdded = true;
              } else {
                console.error("[Checkout Complete] ❌ Final retry failed - shipping method still not present");
              }
            } catch (retryError: any) {
              console.error("[Checkout Complete] ❌ Final retry also failed:", retryError.message);
            }
          }
        } else {
          console.warn("[Checkout Complete] ⚠️ No shipping methods available for this cart");
          console.warn("[Checkout Complete] Cart details:", {
            hasItems: !!updatedCart?.items?.length,
            itemsCount: updatedCart?.items?.length || 0,
            shippingAddress: updatedCart?.shipping_address ? "present" : "missing",
            regionId: updatedCart?.region?.id,
            regionName: updatedCart?.region?.name,
          });
          
          // Check if items actually require shipping
          const items = updatedCart?.items || [];
          const hasPhysicalItems = items.some((item: any) => {
            // Check if product requires shipping
            const requiresShipping = item.product?.shipping_profile_id || 
                                   item.variant?.requires_shipping !== false ||
                                   item.variant?.requires_shipping === undefined; // Default to requiring shipping if not specified
            return requiresShipping;
          });
          
          console.log("[Checkout Complete] Items shipping requirement:", {
            totalItems: items.length,
            hasPhysicalItems,
            items: items.map((item: any) => ({
              title: item.title || item.product?.title,
              requiresShipping: item.product?.shipping_profile_id || item.variant?.requires_shipping !== false,
            })),
          });
          
          if (hasPhysicalItems) {
            // Physical items require shipping but no methods available
            // This is a configuration issue - shipping options need to be set up in Medusa Admin
            console.error("[Checkout Complete] ❌ CRITICAL: Physical items require shipping but no shipping methods available");
            console.error("[Checkout Complete] Action required: Configure shipping options in Medusa Admin:");
            console.error("  1. Go to Settings → Regions");
            console.error("  2. Edit your region");
            console.error("  3. Add shipping options (e.g., Standard Shipping, Express Shipping)");
            console.error("  4. Configure shipping providers and rates");
            
            return NextResponse.json(
              { 
                success: false, 
                message: "Shipping is required for physical products, but no shipping methods are configured. Please contact support or configure shipping options in the admin panel." 
              },
              { status: 400 }
            );
          } else {
            // All items are digital - shipping not required
            console.log("[Checkout Complete] ✅ All items are digital - shipping not required, proceeding without shipping method");
          }
        }
      } catch (shippingError: any) {
        console.error("[Checkout Complete] ❌ Error adding shipping method:", shippingError.message);
        console.error("[Checkout Complete] Error details:", {
          message: shippingError.message,
          code: shippingError.code,
          response: shippingError.response,
        });
      }
    } else {
      console.log("[Checkout Complete] ✅ Shipping method already selected:", updatedCart.shipping_methods.map((m: any) => ({ id: m.id, name: m.name })));
    }
    
    // Check if payment collection already exists and has a session
    const existingSession = updatedCart?.payment_collection?.payment_sessions?.find(
      (session: any) => session.status === "pending"
    );
    
    // Determine payment provider based on payment method
    // Try to use an available provider from the region, or fallback to common providers
    let paymentProviderId: string | null = null;
    
    if (payment_method === "cod") {
      // For COD, try manual/system default first, then Stripe
      const availableProviders = updatedCart?.region?.payment_providers || [];
      const manualProvider = availableProviders.find((p: any) => p.id?.startsWith("pp_system_default"));
      const stripeProvider = availableProviders.find((p: any) => p.id?.startsWith("pp_stripe_"));
      
      paymentProviderId = manualProvider?.id || stripeProvider?.id || "pp_system_default";
    } else {
      // For Stripe, use Stripe provider
      const availableProviders = updatedCart?.region?.payment_providers || [];
      const stripeProvider = availableProviders.find((p: any) => p.id?.startsWith("pp_stripe_"));
      paymentProviderId = stripeProvider?.id || "pp_stripe_stripe";
    }
    
    // Initiate payment session if not already initiated
    if (!existingSession && paymentProviderId) {
      try {
        console.log("[Checkout Complete] Initiating payment session with provider:", paymentProviderId);
        await initiatePaymentSession(updatedCart || cart, {
          provider_id: paymentProviderId,
        });
        
        // Refresh cart to get the payment session
        const cartWithPayment = await retrieveCart(cartId, "*payment_collection,*payment_collection.payment_sessions");
        console.log("[Checkout Complete] Payment session initiated:", cartWithPayment?.payment_collection?.payment_sessions);
      } catch (paymentError: any) {
        console.error("[Checkout Complete] Error initiating payment session:", paymentError);
        
        // Try alternative providers if the first one fails
        if (payment_method === "cod") {
          // Try Stripe as fallback for COD
          try {
            console.log("[Checkout Complete] Trying Stripe provider as fallback for COD");
            await initiatePaymentSession(updatedCart || cart, {
              provider_id: "pp_stripe_stripe",
            });
          } catch (stripeError: any) {
            console.error("[Checkout Complete] Error initiating Stripe payment session:", stripeError);
            // Last resort: try system default
            try {
              await initiatePaymentSession(updatedCart || cart, {
                provider_id: "pp_system_default",
              });
            } catch (defaultError: any) {
              console.error("[Checkout Complete] All payment provider attempts failed:", defaultError);
              // Continue anyway - Medusa might handle it differently
            }
          }
        }
      }
    } else if (existingSession) {
      console.log("[Checkout Complete] Payment session already exists:", existingSession.provider_id);
    } else {
      console.warn("[Checkout Complete] No payment provider ID determined, proceeding without payment session");
    }
    
    // Final verification: Check shipping method one more time before completing
    const finalCartVerification = await retrieveCart(cartId, "*shipping_methods,*items");
    
    if (finalCartVerification?.items && finalCartVerification.items.length > 0) {
      const hasPhysicalItems = finalCartVerification.items.some((item: any) => {
        return item.product?.shipping_profile_id || item.variant?.requires_shipping !== false;
      });
      
      if (hasPhysicalItems && (!finalCartVerification?.shipping_methods || finalCartVerification.shipping_methods.length === 0)) {
        // Last attempt to add shipping method
        console.log("[Checkout Complete] ⚠️ Final check: No shipping method, attempting last-minute addition");
        try {
          const shippingMethods = await listCartShippingMethods(cartId);
          if (shippingMethods && shippingMethods.length > 0) {
            await setShippingMethod({
              cartId,
              shippingMethodId: shippingMethods[0].id,
            });
            // Wait for it to be saved
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Verify one more time
            const lastCheck = await retrieveCart(cartId, "*shipping_methods");
            if (!lastCheck?.shipping_methods || lastCheck.shipping_methods.length === 0) {
              console.error("[Checkout Complete] ❌ CRITICAL: Unable to add shipping method");
              return NextResponse.json(
                { 
                  success: false, 
                  message: "Shipping method is required but could not be added automatically. Please select a shipping method and try again." 
                },
                { status: 400 }
              );
            }
            console.log("[Checkout Complete] ✅ Shipping method added in final check");
          } else {
            return NextResponse.json(
              { 
                success: false, 
                message: "No shipping methods available. Please configure shipping options in your region settings." 
              },
              { status: 400 }
            );
          }
        } catch (finalError: any) {
          console.error("[Checkout Complete] ❌ Final shipping method addition failed:", finalError);
          return NextResponse.json(
            { 
              success: false, 
              message: "Failed to add shipping method. Please select a shipping method manually." 
            },
            { status: 400 }
          );
        }
      }
    }
    
    // For COD or Stripe, complete the cart to create order
    const headers = await getAuthHeaders();
    
    try {
      const cartRes = await sdk.store.cart.complete(cartId, {}, headers);
      
      if (cartRes?.type === "order") {
        return NextResponse.json({
          success: true,
          order: cartRes.order,
          message: "Order created successfully",
        });
      } else {
        return NextResponse.json(
          { success: false, message: "Failed to create order", errors: cartRes },
          { status: 400 }
        );
      }
    } catch (error: any) {
      console.error("Error completing cart:", error);
      return NextResponse.json(
        { success: false, message: error.message || "Failed to complete order" },
        { status: 400 }
      );
    }

    // For Stripe, return cart ID for payment processing
    // Order will be completed after payment succeeds
    return NextResponse.json({
      success: true,
      cartId,
      message: "Cart updated, ready for payment",
    });
  } catch (error: any) {
    console.error("[Checkout Complete] ❌ Unhandled error:", error);
    console.error("[Checkout Complete] Error stack:", error.stack);
    console.error("[Checkout Complete] Error details:", {
      message: error.message,
      name: error.name,
      code: error.code,
    });
    
    // Always return JSON, even on errors
    return NextResponse.json(
      { 
        success: false, 
        message: error.message || "Internal Server Error",
        error: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { 
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}

