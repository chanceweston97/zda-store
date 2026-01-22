import { NextRequest, NextResponse } from "next/server";
import { getShippoRates, isShippoEnabled, convertShippoRateToShippingMethod, ShippoAddress, ShippoParcel } from "@/lib/shippo/client";
import { getWooCommerceShippingMethods } from "@/lib/woocommerce/shipping";
import { isWooCommerceEnabled } from "@/lib/woocommerce/config";

/**
 * Get shipping rates
 * Priority: Shippo (if enabled) > WooCommerce shipping methods
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      address_from,
      address_to,
      parcels,
      use_shippo = true, // Default to Shippo if enabled
    } = body;

    // Validate required fields
    if (!address_to) {
      return NextResponse.json(
        { error: "address_to is required" },
        { status: 400 }
      );
    }

    // Try Shippo first if enabled and requested
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
          state: address_to.state || address_to.regionName || "",
          zip: address_to.zip || address_to.postalCode || "",
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
        // Fall through to WooCommerce if Shippo fails
      }
    }

    // Fallback to WooCommerce shipping methods
    if (isWooCommerceEnabled()) {
      try {
        const wcMethods = await getWooCommerceShippingMethods();
        
        if (wcMethods && wcMethods.length > 0) {
          const shippingMethods = wcMethods
            .filter(method => method.enabled)
            .map(method => ({
              id: method.id,
              name: method.title || method.method_title,
              price: parseFloat(method.settings?.cost || "0"),
              provider: method.method_id,
              methodId: method.method_id,
            }));

          return NextResponse.json({
            success: true,
            methods: shippingMethods,
            source: "woocommerce",
          });
        }
      } catch (wcError: any) {
        console.error("[Shipping Rates API] WooCommerce error:", wcError);
      }
    }

    // If both fail, return empty array
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
    woocommerce_enabled: isWooCommerceEnabled(),
  });
}
