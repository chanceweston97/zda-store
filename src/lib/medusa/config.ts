/**
 * Medusa Backend Configuration
 * This file configures the connection to the Medusa backend
 */

// Get backend URL from environment variables
// IMPORTANT: In production, NEXT_PUBLIC_MEDUSA_BACKEND_URL MUST be set
const MEDUSA_BACKEND_URL =
  process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL ||
  process.env.MEDUSA_BACKEND_URL ||
  (process.env.NODE_ENV === 'production' 
    ? (() => {
        // In production, throw error if not set (don't fallback to localhost)
        console.error(`[MedusaConfig] ❌ CRITICAL ERROR: NEXT_PUBLIC_MEDUSA_BACKEND_URL is not set in production!`);
        console.error(`[MedusaConfig] Set NEXT_PUBLIC_MEDUSA_BACKEND_URL=http://18.224.229.214:9000 in your .env.local file`);
        console.error(`[MedusaConfig] Then rebuild: yarn build`);
        // Still return localhost as fallback, but log the error
        return "http://localhost:9000";
      })()
    : "http://localhost:9000"); // Only use localhost in development

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
    console.error(`[MedusaConfig] Set NEXT_PUBLIC_MEDUSA_BACKEND_URL to your server IP`);
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
  
  // Always log in production to help debug
  if (typeof window === 'undefined' && (process.env.NODE_ENV === 'production' || process.env.LOG_MEDUSA_FETCH === 'true')) {
    if (!useMedusa) {
      console.warn(`[isMedusaEnabled] Medusa is DISABLED because NEXT_PUBLIC_USE_MEDUSA is not set to "true"`);
      console.warn(`[isMedusaEnabled] Current value: ${process.env.NEXT_PUBLIC_USE_MEDUSA || "not set"}`);
      console.warn(`[isMedusaEnabled] To enable: Set NEXT_PUBLIC_USE_MEDUSA=true in your environment variables`);
    }
  }
  
  if (!useMedusa) {
    return false;
  }
  
  // If enabled, check if required config is present
  const hasConfig = !!(
    MEDUSA_BACKEND_URL &&
    MEDUSA_PUBLISHABLE_KEY
  );
  
  // Always log config status in production
  if (typeof window === 'undefined' && (process.env.NODE_ENV === 'production' || process.env.LOG_MEDUSA_FETCH === 'true')) {
    if (!hasConfig) {
      console.error(`[isMedusaEnabled] Medusa is enabled but missing required config:`);
      if (!MEDUSA_BACKEND_URL) {
        console.error(`[isMedusaEnabled]   - NEXT_PUBLIC_MEDUSA_BACKEND_URL is not set`);
      }
      if (!MEDUSA_PUBLISHABLE_KEY) {
        console.error(`[isMedusaEnabled]   - NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY is not set`);
      }
    } else {
      console.log(`[isMedusaEnabled] Medusa is ENABLED and configured`);
      console.log(`[isMedusaEnabled] Backend URL: ${MEDUSA_BACKEND_URL}`);
    }
  }
  
  // Validate config on first check (only log once)
  if (hasConfig && typeof window === 'undefined') {
    validateMedusaConfig();
  }
  
  return hasConfig;
};

