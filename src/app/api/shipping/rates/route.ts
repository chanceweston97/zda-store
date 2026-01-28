import { NextRequest, NextResponse } from "next/server";
import { getShippoRates, isShippoEnabled, convertShippoRateToShippingMethod, ShippoAddress, ShippoParcel } from "@/lib/shippo/client";
import { getStoreApiShippingRates, isStoreApiShippingEnabled } from "@/lib/woocommerce/store-api-shipping";
import { convertCartItemToWC } from "@/lib/woocommerce/utils";

/**
 * Get shipping rates for checkout.
 * 1) Store API–style (WordPress): HEADLESS_SHIPPING_RATES_URL with cart + address → calculated rates (zones, FedEx, etc.)
 * 2) Fallback: Shippo if enabled and requested
 *
 * Do NOT use /wc/v3/shipping/zones for checkout — that only lists zones, it does not calculate prices.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      address_from,
      address_to,
      parcels,
      cart_items: rawCartItems, // From use-shopping-cart (needed for Store API–style)
      use_shippo = false,
    } = body;

    // Validate required fields
    if (!address_to) {
      return NextResponse.json(
        { error: "address_to is required" },
        { status: 400 }
      );
    }

    // 1. Store API–style: custom WordPress endpoint with cart + address (calculates real rates)
    if (isStoreApiShippingEnabled() && rawCartItems && Array.isArray(rawCartItems) && rawCartItems.length > 0) {
      try {
        const wcCartItems = rawCartItems.map((item: any) => convertCartItemToWC(item));
        const storeApiItems = wcCartItems.map((item) => ({
          product_id: item.product_id,
          quantity: item.quantity,
          variation_id: item.variation_id,
          ...(item.price != null && { price: String(item.price) }),
        }));

        const methods = await getStoreApiShippingRates(storeApiItems, {
          country: address_to.country || address_to.country_code || "US",
          state: address_to.state || address_to.regionName || address_to.stateOrProvince || "",
          postcode: address_to.postalCode || address_to.zipCode || address_to.zip || "",
          city: address_to.town || address_to.city || "",
          address_1: address_to.street || address_to.address?.street || "",
        });

        if (methods.length > 0) {
          return NextResponse.json({
            success: true,
            methods,
            source: "woocommerce_store_api",
          });
        }
      } catch (storeApiError: any) {
        console.error("[Shipping Rates API] Store API shipping error:", storeApiError);
        // Fall through to Shippo
      }
    }

    // 2. Fallback: Shippo if enabled and requested
    if (use_shippo && isShippoEnabled()) {
      try {
        // Validate Shippo required fields
        if (!address_from || !parcels || !Array.isArray(parcels) || parcels.length === 0) {
          throw new Error("address_from and parcels are required for Shippo");
        }

        const shippoAddressFrom: ShippoAddress = {
          name: address_from.name || "ZDA",
          street1: address_from.street1 || address_from.street,
          street2: address_from.street2 || address_from.apartment,
          city: address_from.city,
          state: address_from.state,
          zip: address_from.zip || address_from.postalCode,
          country: address_from.country || "US",
          phone: address_from.phone,
          email: address_from.email,
        };

        const shippoAddressTo: ShippoAddress = {
          name: `${address_to.firstName || ""} ${address_to.lastName || ""}`.trim() || address_to.name || "Customer",
          street1: address_to.street1 || address_to.street || "",
          street2: address_to.street2 || address_to.apartment || "",
          city: address_to.city || address_to.town || "",
          state: address_to.state || address_to.stateOrProvince || address_to.regionName || "",
          zip: address_to.zip || address_to.postalCode || address_to.zipCode || "",
          country: address_to.country || address_to.country_code || "US",
          phone: address_to.phone || "",
          email: address_to.email || "",
        };

        const shippoParcels: ShippoParcel[] = parcels.map((parcel: any) => ({
          length: parcel.length || "10",
          width: parcel.width || "10",
          height: parcel.height || "5",
          distance_unit: parcel.distance_unit || "in",
          weight: parcel.weight || "1",
          mass_unit: parcel.mass_unit || "lb",
        }));

        const rates = await getShippoRates(shippoAddressFrom, shippoAddressTo, shippoParcels);
        
        const shippingMethods = rates.map(convertShippoRateToShippingMethod);

        return NextResponse.json({
          success: true,
          methods: shippingMethods,
          source: "shippo",
        });
      } catch (shippoError: any) {
        console.error("[Shipping Rates API] Shippo error:", shippoError);
      }
    }

    // If both WooCommerce and Shippo fail or return nothing
    return NextResponse.json({
      success: true,
      methods: [],
      source: "none",
      message: "No shipping methods available. Please configure Shippo or WooCommerce shipping methods.",
    });
  } catch (error: any) {
    console.error("[Shipping Rates API] Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch shipping rates",
      },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint to check shipping configuration
 */
export async function GET() {
  return NextResponse.json({
    shippo_enabled: isShippoEnabled(),
    store_api_shipping_enabled: isStoreApiShippingEnabled(),
  });
}
