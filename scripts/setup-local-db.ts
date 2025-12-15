/**
 * Setup Local Database Script
 * Creates the database and runs migrations
 * 
 * Run: tsx scripts/setup-local-db.ts
 */

import { PrismaClient } from "@prisma/client";
import * as pg from "pg";
import * as dotenv from "dotenv";
import * as path from "path";

// Load environment variables
dotenv.config({ path: path.join(process.cwd(), ".env.local") });

const { Client } = pg;

async function createDatabase() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    console.error("❌ DATABASE_URL is not set in .env.local");
    process.exit(1);
  }

  // Parse the database URL
  const url = new URL(databaseUrl);
  const databaseName = url.pathname.slice(1); // Remove leading '/'
  const dbConfig = {
    host: url.hostname,
    port: parseInt(url.port || "5432"),
    user: url.username,
    password: url.password,
    database: "postgres", // Connect to default postgres database first
  };

  console.log(`📦 Creating database: ${databaseName}...`);

  const client = new Client(dbConfig);

  try {
    await client.connect();
    console.log("✓ Connected to PostgreSQL");

    // Check if database exists
    const result = await client.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`,
      [databaseName]
    );

    if (result.rows.length === 0) {
      // Create database
      await client.query(`CREATE DATABASE "${databaseName}"`);
      console.log(`✓ Database "${databaseName}" created`);
    } else {
      console.log(`✓ Database "${databaseName}" already exists`);
    }

    await client.end();
  } catch (error: any) {
    console.error("❌ Error creating database:", error.message);
    await client.end();
    process.exit(1);
  }
}

async function runMigrations() {
  console.log("\n🔄 Running Prisma migrations...");

  const { execSync } = require("child_process");

  try {
    // Generate Prisma Client
    console.log("Generating Prisma Client...");
    execSync("npx prisma generate", { stdio: "inherit" });

    // Run migrations
    console.log("Running migrations...");
    execSync("npx prisma migrate dev --name init", { stdio: "inherit" });

    console.log("✓ Migrations completed");
  } catch (error: any) {
    console.error("❌ Error running migrations:", error.message);
    process.exit(1);
  }
}

async function testConnection() {
  console.log("\n🔍 Testing database connection...");

  try {
    const prisma = new PrismaClient();
    await prisma.$connect();
    console.log("✓ Database connection successful");
    await prisma.$disconnect();
  } catch (error: any) {
    console.error("❌ Database connection failed:", error.message);
    console.error("\nPlease check:");
    console.error("1. PostgreSQL is running");
    console.error("2. DATABASE_URL in .env.local is correct");
    console.error("3. Database user has proper permissions");
    process.exit(1);
  }
}

async function main() {
  console.log("🚀 Setting up local database...\n");

  await createDatabase();
  await runMigrations();
  await testConnection();

  console.log("\n✅ Setup complete!");
  console.log("\nNext steps:");
  console.log("1. Update .env.local with your actual database credentials");
  console.log("2. Run: npm run dev");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});

