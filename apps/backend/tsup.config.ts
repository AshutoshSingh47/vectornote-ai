import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    index: "src/index.ts",
    "workers/index": "src/workers/index.ts",
  },
  format: "esm",
  platform: "node",
  target: "node24",
  outDir: "dist",
  clean: true,
  // Keep each entry self-contained so `dotenv/config` runs before @repo/db reads DATABASE_URL.
  splitting: false,
  // @repo/db ships raw TypeScript, so it has to be bundled rather than imported at runtime.
  noExternal: ["@repo/db"],
  banner: {
    js: `import { createRequire as __createRequire } from "node:module"; const require = __createRequire(import.meta.url);`,
  },
});
