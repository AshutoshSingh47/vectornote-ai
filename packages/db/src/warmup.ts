// packages/db/src/warmup.ts
import { prisma } from "./client";

// Runs `SELECT 1` to wake Neon and confirm the DB is reachable. Never throws.
export async function warmUpDatabase(): Promise<boolean> {
  const start = performance.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    console.log(
      `[db] ✅ connected in ${Math.round(performance.now() - start)}ms`,
    );
    return true;
  } catch (error) {
    // Last line holds the real cause; avoids printing the connection string
    const reason = (error as Error).message?.trim().split("\n").at(-1);
    console.error(`[db] ❌ not connected: ${reason}`);
    return false;
  }
}
