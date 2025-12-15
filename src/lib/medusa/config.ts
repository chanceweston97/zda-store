/**
 * Medusa Backend Configuration
 * This file configures the connection to the Medusa backend
 */

const MEDUSA_BACKEND_URL =
  process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL ||
  process.env.MEDUSA_BACKEND_URL ||
  "http://localhost:9000";

const MEDUSA_PUBLISHABLE_KEY =
  process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || "";

export const medusaConfig = {
  backendUrl: MEDUSA_BACKEND_URL,
  publishableKey: MEDUSA_PUBLISHABLE_KEY,
};

/**
 * Check if Medusa integration is enabled
 */
export const isMedusaEnabled = () => {
  // Check if explicitly enabled via environment variable
  const useMedusa = process.env.NEXT_PUBLIC_USE_MEDUSA === "true";
  
  if (!useMedusa) {
    return false;
  }
  
  // If enabled, check if required config is present
  return !!(
    MEDUSA_BACKEND_URL &&
    MEDUSA_PUBLISHABLE_KEY
  );
};

