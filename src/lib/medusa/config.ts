/**
 * Medusa Backend Configuration
 * This file configures the connection to the Medusa backend
 */

// Use MEDUSA_BACKEND_URL for server-side (like front project), fallback to NEXT_PUBLIC_ for client-side
// This allows runtime configuration on server without rebuild
const MEDUSA_BACKEND_URL =
  process.env.MEDUSA_BACKEND_URL ||
  process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL ||
  "http://localhost:9000";

// Log the configured URL (helps debug server-side issues)
// Always log in production if LOG_MEDUSA_FETCH is enabled, or in development
const shouldLog = typeof window === 'undefined' && (
  process.env.NODE_ENV !== 'production' || 
  process.env.LOG_MEDUSA_FETCH === 'true'
);

if (shouldLog) {
  console.log(`[MedusaConfig] Backend URL: ${MEDUSA_BACKEND_URL}`);
  console.log(`[MedusaConfig] NEXT_PUBLIC_MEDUSA_BACKEND_URL: ${process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || 'not set'}`);
  console.log(`[MedusaConfig] MEDUSA_BACKEND_URL: ${process.env.MEDUSA_BACKEND_URL || 'not set'}`);
  
  // Warn if using localhost in production (common mistake)
  if (process.env.NODE_ENV === 'production' && MEDUSA_BACKEND_URL.includes('localhost')) {
    console.error(`[MedusaConfig] ⚠️ WARNING: Using localhost in production! This will fail on the server.`);
    console.error(`[MedusaConfig] Set NEXT_PUBLIC_MEDUSA_BACKEND_URL to your server IP (e.g., http://18.191.243.236:9000)`);
    console.error(`[MedusaConfig] Then rebuild: yarn build`);
  }
}

const MEDUSA_PUBLISHABLE_KEY =
  process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || "";

export const medusaConfig = {
  backendUrl: MEDUSA_BACKEND_URL,
  publishableKey: MEDUSA_PUBLISHABLE_KEY,
};

/**
 * Validate Medusa configuration at runtime
 * Logs warnings for common misconfigurations
 */
export function validateMedusaConfig() {
  const issues: string[] = [];
  
  if (!MEDUSA_BACKEND_URL || MEDUSA_BACKEND_URL === "http://localhost:9000") {
    issues.push("MEDUSA_BACKEND_URL is not set or is using localhost (will fail on server)");
  }
  
  if (MEDUSA_BACKEND_URL.includes('localhost') && process.env.NODE_ENV === 'production') {
    issues.push("Using localhost in production - this will fail. Use server IP instead.");
  }
  
  if (!MEDUSA_PUBLISHABLE_KEY) {
    issues.push("MEDUSA_PUBLISHABLE_KEY is not set");
  }
  
  if (issues.length > 0 && shouldLog) {
    console.warn(`[MedusaConfig] Configuration issues detected:`);
    issues.forEach(issue => console.warn(`  - ${issue}`));
  }
  
  return issues.length === 0;
}

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
  const hasConfig = !!(
    MEDUSA_BACKEND_URL &&
    MEDUSA_PUBLISHABLE_KEY
  );
  
  // Validate config on first check (only log once)
  if (hasConfig && typeof window === 'undefined') {
    validateMedusaConfig();
  }
  
  return hasConfig;
};

