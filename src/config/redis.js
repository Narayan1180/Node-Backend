import { createClient } from "redis";

 const redisClient = createClient({
  url: process.env.REDIS_URL
});

redisClient.on("connect", () => {
  console.log("🔴 Redis connecting...");
});

redisClient.on("ready", () => {
  console.log("✅ Redis connected");
});

redisClient.on("error", (err) => {
  console.error("❌ Redis error:", err);
});

redisClient.on("end", () => {
  console.log("⚠️ Redis connection closed");
});

// connect once when app starts
export const connectRedis = async () => {
  if (!redisClient.isOpen) {
    await redisClient.connect();
  }
};

export default redisClient