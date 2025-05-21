import { createClient, type RedisClientType } from "redis";

const globalForRedis = global as unknown as { 
  redis: RedisClientType | undefined 
};

export const redis = globalForRedis.redis || createClient();

if (!globalForRedis.redis) {
  globalForRedis.redis = redis;
  redis.connect().catch((err) => {
    console.error("Redis connection error", err);
  });
}

// Optional: Properly handle cleanup on process exit
process.on('exit', async () => {
  if (redis.isOpen) {
    await redis.quit();
  }
});

// Handle other termination signals
['SIGINT', 'SIGTERM'].forEach(signal => {
  process.on(signal, async () => {
    if (redis.isOpen) {
      await redis.quit();
    }
    process.exit();
  });
});

export default redis;