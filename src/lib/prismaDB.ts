import { PrismaClient } from "@prisma/client";

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
//
// Learn more:
// https://pris.ly/d/help/next-js-best-practices

const globalForPrisma = global as unknown as { prisma: PrismaClient };

// For serverless/production, use connection pooler settings
const prismaOptions: any = {
  log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
};

// Configure datasource URL for all connection types
// Prisma Accelerate URLs (prisma+postgres://) are handled automatically by Prisma
// Supabase pooler URLs need explicit configuration
if (process.env.DATABASE_URL) {
  // For Supabase pooler, explicitly set the datasource
  if (process.env.DATABASE_URL.includes("pooler.supabase.com")) {
    prismaOptions.datasources = {
      db: {
        url: process.env.DATABASE_URL,
      },
    };
  }
  // Prisma Accelerate URLs work automatically, no special config needed
  // But we ensure the URL is available
}

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient(prismaOptions);

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
