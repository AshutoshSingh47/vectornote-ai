import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },

  // CLI (migrate/push/studio) uses Neon's direct endpoint; the app runtime uses the pooled DATABASE_URL
  datasource: {
    url: env("DATABASE_URL_UNPOOLED"),
  },
});
