/**
 * Database Connection Checker
 * Validates that the DATABASE_URL is configured correctly for the environment
 */

export function validateDatabaseUrl(): { valid: boolean; message: string } {
  const dbUrl = process.env.DATABASE_URL;

  if (!dbUrl) {
    return {
      valid: false,
      message: "DATABASE_URL environment variable is not set",
    };
  }

  // Prisma Accelerate URLs are always valid (they handle pooling)
  if (dbUrl.includes("accelerate.prisma-data.net") || dbUrl.startsWith("prisma+postgres://")) {
    return {
      valid: true,
      message: "Using Prisma Accelerate (correct for production)",
    };
  }

  // Check if it's a Supabase URL
  if (dbUrl.includes("supabase")) {
    const isProduction = process.env.NODE_ENV === "production" || process.env.VERCEL;

    // For production/serverless, should use pooler
    if (isProduction) {
      if (dbUrl.includes("pooler.supabase.com") && dbUrl.includes(":6543")) {
        return {
          valid: true,
          message: "Using connection pooler (correct for production)",
        };
      } else if (dbUrl.includes("db.") && dbUrl.includes(":5432")) {
        return {
          valid: false,
          message:
            "Using direct connection in production. Switch to connection pooler URL (port 6543, pooler.supabase.com)",
        };
      }
    } else {
      // Development can use either, but pooler is still recommended
      if (dbUrl.includes("pooler.supabase.com")) {
        return {
          valid: true,
          message: "Using connection pooler (recommended)",
        };
      } else {
        return {
          valid: true,
          message: "Using direct connection (works in development)",
        };
      }
    }
  }

  return {
    valid: true,
    message: "Database URL configured",
  };
}

export function getDatabaseConnectionInfo(): {
  hasUrl: boolean;
  isPooler: boolean;
  isDirect: boolean;
  isPrismaAccelerate: boolean;
  port: string | null;
  host: string | null;
} {
  const dbUrl = process.env.DATABASE_URL || "";

  if (!dbUrl) {
    return {
      hasUrl: false,
      isPooler: false,
      isDirect: false,
      isPrismaAccelerate: false,
      port: null,
      host: null,
    };
  }

  // Check for Prisma Accelerate
  const isPrismaAccelerate = dbUrl.includes("accelerate.prisma-data.net") || dbUrl.startsWith("prisma+postgres://");
  
  const isPooler = dbUrl.includes("pooler.supabase.com");
  const isDirect = dbUrl.includes("db.") && dbUrl.includes("supabase") && !isPrismaAccelerate;
  
  // Extract port
  const portMatch = dbUrl.match(/:(\d+)/);
  const port = portMatch ? portMatch[1] : null;

  // Extract host
  const hostMatch = dbUrl.match(/@([^:]+)/);
  const host = hostMatch ? hostMatch[1] : null;

  return {
    hasUrl: true,
    isPooler,
    isDirect,
    isPrismaAccelerate,
    port,
    host,
  };
}

