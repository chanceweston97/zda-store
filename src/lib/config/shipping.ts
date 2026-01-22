/**
 * Shipping Configuration
 * Warehouse/Store origin address for shipping calculations
 */

export interface WarehouseAddress {
  name: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  phone?: string;
  email?: string;
}

/**
 * Get warehouse address from environment variables or defaults
 * These should be configured in .env.local
 */
export function getWarehouseAddress(): WarehouseAddress {
  return {
    name: process.env.NEXT_PUBLIC_WAREHOUSE_NAME || "ZDA",
    street: process.env.NEXT_PUBLIC_WAREHOUSE_STREET || "",
    city: process.env.NEXT_PUBLIC_WAREHOUSE_CITY || "",
    state: process.env.NEXT_PUBLIC_WAREHOUSE_STATE || "",
    zip: process.env.NEXT_PUBLIC_WAREHOUSE_ZIP || "",
    country: process.env.NEXT_PUBLIC_WAREHOUSE_COUNTRY || "US",
    phone: process.env.NEXT_PUBLIC_WAREHOUSE_PHONE,
    email: process.env.NEXT_PUBLIC_WAREHOUSE_EMAIL,
  };
}
