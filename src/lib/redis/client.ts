/**
 * Redis Client Configuration
 * For caching and session management
 */

import { createClient, RedisClientType } from "redis";

let redisClient: RedisClientType | null = null;

export function getRedisClient(): RedisClientType | null {
  const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";

  if (!redisClient) {
    try {
      redisClient = createClient({
        url: redisUrl,
      });

      redisClient.on("error", (err) => {
        console.error("Redis Client Error:", err);
      });

      redisClient.on("connect", () => {
        console.log("✓ Redis connected");
      });

      // Only connect in server-side code
      if (typeof window === "undefined") {
        redisClient.connect().catch((err) => {
          console.error("Redis connection failed:", err);
          console.log("Continuing without Redis (optional for this project)");
        });
      }
    } catch (error) {
      console.error("Failed to create Redis client:", error);
      console.log("Continuing without Redis (optional for this project)");
      return null;
    }
  }

  return redisClient;
}

/**
 * Check if Redis is available
 */
export async function isRedisAvailable(): Promise<boolean> {
  const client = getRedisClient();
  if (!client) return false;

  try {
    await client.ping();
    return true;
  } catch {
    return false;
  }
}

/**
 * Cache helper functions
 */
export async function getCache(key: string): Promise<string | null> {
  const client = getRedisClient();
  if (!client) return null;

  try {
    return await client.get(key);
  } catch {
    return null;
  }
}

export async function setCache(
  key: string,
  value: string,
  ttl?: number
): Promise<boolean> {
  const client = getRedisClient();
  if (!client) return false;

  try {
    if (ttl) {
      await client.setEx(key, ttl, value);
    } else {
      await client.set(key, value);
    }
    return true;
  } catch {
    return false;
  }
}

export async function deleteCache(key: string): Promise<boolean> {
  const client = getRedisClient();
  if (!client) return false;

  try {
    await client.del(key);
    return true;
  } catch {
    return false;
  }
}

