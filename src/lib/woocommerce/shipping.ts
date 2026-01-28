/**
 * WooCommerce Shipping Methods Integration
 * Fetch shipping methods configured in WordPress/WooCommerce admin
 */

import { wcFetch } from "./client";
import { isWooCommerceEnabled } from "./config";

export interface WooCommerceShippingMethod {
  id: string;
  title: string;
  method_title: string;
  method_id: string;
  enabled: boolean;
  settings?: {
    title?: string;
    cost?: string;
    free_shipping?: string;
    requires?: string;
  };
}

export interface WooCommerceShippingZone {
  id: number;
  name: string;
  order: number;
  methods: WooCommerceShippingMethod[];
}

/** Raw zone from WC REST API (GET /shipping/zones) */
interface WCShippingZoneRaw {
  id: number;
  name?: string;
  order?: number;
}

/** Raw method from WC REST API (GET /shipping/zones/{id}/methods) */
interface WCShippingMethodRaw {
  instance_id?: number;
  method_id: string;
  method_title?: string;
  title?: string;
  enabled: boolean;
  settings?: {
    title?: { value?: string };
    cost?: { value?: string };
    [key: string]: { value?: string } | undefined;
  };
}

/**
 * Get shipping methods from WooCommerce (WordPress)
 * Uses WC REST: GET /shipping/zones then GET /shipping/zones/{id}/methods per zone.
 */
export async function getWooCommerceShippingMethods(): Promise<WooCommerceShippingMethod[]> {
  if (!isWooCommerceEnabled()) {
    throw new Error("WooCommerce is not enabled");
  }

  try {
    const zones = await wcFetch<WCShippingZoneRaw[]>("/shipping/zones");
    if (!zones?.length) return [];

    const allMethods: WooCommerceShippingMethod[] = [];

    for (const zone of zones) {
      const zoneId = zone.id;
      const methods = await wcFetch<WCShippingMethodRaw[]>(`/shipping/zones/${zoneId}/methods`);
      if (!methods?.length) continue;

      for (const m of methods) {
        if (!m.enabled) continue;
        const costVal = m.settings?.cost;
        const cost = typeof costVal === "object" && costVal && "value" in costVal ? (costVal as { value?: string }).value : String(costVal ?? "0");
        const titleVal = m.settings?.title ?? m.title ?? m.method_title ?? m.method_id;
        const title = typeof titleVal === "object" && titleVal && "value" in titleVal ? (titleVal as { value?: string }).value : String(titleVal ?? "");
        allMethods.push({
          id: `${zoneId}_${m.method_id}_${m.instance_id ?? 0}`,
          title,
          method_title: m.method_title ?? m.method_id,
          method_id: m.method_id,
          enabled: true,
          settings: { cost: String(cost ?? "0"), title },
        });
      }
    }

    return allMethods;
  } catch (error) {
    console.error("[getWooCommerceShippingMethods] Error:", error);
    throw error;
  }
}

/**
 * Get shipping zones from WooCommerce
 * This also requires a custom WordPress endpoint
 */
export async function getWooCommerceShippingZones(): Promise<WooCommerceShippingZone[]> {
  if (!isWooCommerceEnabled()) {
    throw new Error("WooCommerce is not enabled");
  }

  try {
    const zonesRaw = await wcFetch<WCShippingZoneRaw[]>("/shipping/zones");
    if (!zonesRaw?.length) return [];

    const zones: WooCommerceShippingZone[] = [];

    for (const z of zonesRaw) {
      const methods = await wcFetch<WCShippingMethodRaw[]>(`/shipping/zones/${z.id}/methods`);
      const mapped: WooCommerceShippingMethod[] = (methods || [])
        .filter((m) => m.enabled)
        .map((m) => {
          const costVal = m.settings?.cost;
          const cost = typeof costVal === "object" && costVal && "value" in costVal ? (costVal as { value?: string }).value : String(costVal ?? "0");
          const titleVal = m.settings?.title ?? m.title ?? m.method_title ?? m.method_id;
          const title = typeof titleVal === "object" && titleVal && "value" in titleVal ? (titleVal as { value?: string }).value : String(titleVal);
          return {
            id: `${z.id}_${m.method_id}_${m.instance_id ?? 0}`,
            title,
            method_title: m.method_title ?? m.method_id,
            method_id: m.method_id,
            enabled: true,
            settings: { cost, title },
          };
        });
      zones.push({
        id: z.id,
        name: z.name ?? "",
        order: z.order ?? 0,
        methods: mapped,
      });
    }

    return zones;
  } catch (error) {
    console.error("[getWooCommerceShippingZones] Error:", error);
    throw error;
  }
}

/**
 * Calculate shipping cost for an order
 * This can be used to get shipping rates based on cart contents and address
 */
export async function calculateShippingCost(
  address: {
    country: string;
    state?: string;
    postcode?: string;
  },
  cartItems: Array<{
    quantity: number;
    weight?: number;
  }>
): Promise<number> {
  // This would integrate with WooCommerce shipping calculation
  // For now, return 0 as placeholder
  // A custom WordPress endpoint would be needed to calculate shipping
  return 0;
}
