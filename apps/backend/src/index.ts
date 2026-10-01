// Must load before anything that imports @repo/db (it reads DATABASE_URL at import time)
import "dotenv/config";
import { warmUpDatabase } from "@repo/db";
import { app } from "./app";
import { connectRedis } from "./lib/redis-connection";

const PORT = process.env.PORT ?? 8080;

function startServer() {
  connectRedis(); // non-blocking

  app
    .listen(PORT, () => {
      console.log(`[server] ✅ running on http://localhost:${PORT}`);
      void warmUpDatabase(); // wake Neon without delaying startup
    })
    .on("error", (err) => {
      console.error("[server] ❌ failed to start:", err.message); // e.g. port in use
      process.exit(1);
    });
}

startServer();
