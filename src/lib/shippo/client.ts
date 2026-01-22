/**
 * Shippo API Client
 * Integration for fetching real-time shipping rates
 */

const SHIPPO_API_URL = process.env.SHIPPO_API_URL || "https://api.goshippo.com";
const SHIPPO_API_TOKEN = process.env.SHIPPO_API_TOKEN || "";

export interface ShippoAddress {
  name: string;
  street1: string;
  street2?: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  phone?: string;
  email?: string;
}

export interface ShippoParcel {
  length: string;
  width: string;
  height: string;
  distance_unit: "in" | "cm";
  weight: string;
  mass_unit: "lb" | "kg";
}

export interface ShippoRate {
  object_id: string;
  amount: string;
  currency: string;
  provider: string;
  servicelevel: {
    name: string;
    token: string;
  };
  estimated_days?: number;
  duration_terms?: string;
}

export interface ShippoShipmentRequest {
  address_from: ShippoAddress;
  address_to: ShippoAddress;
  parcels: ShippoParcel[];
  async?: boolean;
}

/**
 * Check if Shippo is configured
 */
export function isShippoEnabled(): boolean {
  return !!(SHIPPO_API_TOKEN && SHIPPO_API_TOKEN.length > 0);
}

/**
 * Fetch shipping rates from Shippo
 */
export async function getShippoRates(
  addressFrom: ShippoAddress,
  addressTo: ShippoAddress,
  parcels: ShippoParcel[]
): Promise<ShippoRate[]> {
  if (!isShippoEnabled()) {
    throw new Error("Shippo API token is not configured");
  }

  const url = `${SHIPPO_API_URL}/shipments`;
  
  const requestBody: ShippoShipmentRequest = {
    address_from: addressFrom,
    address_to: addressTo,
    parcels,
    async: false,
  };

  try {
    // Create shipment
    const shipmentResponse = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `ShippoToken ${SHIPPO_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!shipmentResponse.ok) {
      const errorText = await shipmentResponse.text();
      console.error("[Shippo] Shipment creation error:", errorText);
      throw new Error(`Shippo API error: ${shipmentResponse.status} - ${errorText}`);
    }

    const shipment = await shipmentResponse.json();

    // Fetch rates for the shipment
    if (!shipment.object_id) {
      throw new Error("Shipment created but no object_id returned");
    }

    const ratesUrl = `${SHIPPO_API_URL}/shipments/${shipment.object_id}/rates/${shipment.currency || "USD"}`;
    const ratesResponse = await fetch(ratesUrl, {
      method: "GET",
      headers: {
        "Authorization": `ShippoToken ${SHIPPO_API_TOKEN}`,
      },
    });

    if (!ratesResponse.ok) {
      const errorText = await ratesResponse.text();
      console.error("[Shippo] Rates fetch error:", errorText);
      throw new Error(`Shippo rates API error: ${ratesResponse.status} - ${errorText}`);
    }

    const ratesData = await ratesResponse.json();
    return ratesData.results || [];
  } catch (error: any) {
    console.error("[Shippo] Error fetching rates:", error);
    throw error;
  }
}

/**
 * Convert Shippo rate to frontend format
 */
export function convertShippoRateToShippingMethod(rate: ShippoRate): {
  id: string;
  name: string;
  price: number;
  provider: string;
  estimatedDays?: number;
  serviceLevel?: string;
} {
  return {
    id: rate.object_id,
    name: rate.servicelevel?.name || rate.provider,
    price: parseFloat(rate.amount),
    provider: rate.provider,
    estimatedDays: rate.estimated_days,
    serviceLevel: rate.servicelevel?.token,
  };
}
