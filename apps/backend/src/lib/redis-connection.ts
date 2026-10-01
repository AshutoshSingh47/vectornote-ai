// apps/backend/src/redis.ts
import { createClient } from "redis";

export const redis = createClient({
  url: process.env.REDIS_URL ?? "redis://localhost:6379",
  pingInterval: 30_000, // keeps the idle connection alive
  socket: {
    reconnectStrategy: (retries) => Math.min(retries * 1000, 5000), // retry every ≤5s
  },
});

redis.on("ready", () => console.log("[redis] ✅ connected"));
redis.on("reconnecting", () => console.warn("[redis] reconnecting..."));
redis.on("error", (err: NodeJS.ErrnoException) =>
  // localhost ECONNREFUSED has an empty message, so prefer the code
  console.error("[redis] ❌", err.code ?? err.message),
);

export function connectRedis() {
  // Not awaited: if Redis is down, it keeps retrying in the background
  // instead of blocking the server from starting. Errors are logged above.
  if (!redis.isOpen) redis.connect().catch(() => {});
}
