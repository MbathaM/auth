import 'dotenv/config';
import { createClient, type RedisClientType } from "redis";

/**
 * Redis client instance configured with environment variable URL
 * @type {import("redis").RedisClientType}
 */
const redis: RedisClientType = createClient({
    url: process.env.REDIS_URL,
  });
   

/**
 * Establishes connection to Redis server if not already connected
 * @returns {Promise<void>} Resolves when connection is established
 * @throws {Error} If connection fails
 * @example
 * await connectRedis(); // Explicitly establish connection
 */
async function connectRedis() {
    if (!redis.isOpen) {
        await redis.connect();
    }
}

// Auto-connect on module import but handle errors gracefully
connectRedis().catch((error) => {
    console.error("Failed to connect to Redis:", error.message);
});

export { redis };