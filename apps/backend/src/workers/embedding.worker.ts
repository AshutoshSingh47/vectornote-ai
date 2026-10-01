import "dotenv/config";
import { Worker } from "bullmq";
import { connection } from "../lib/bullmq-connection";
import { prisma } from "@repo/db";
import { generateEmbedding } from "../services/embedding.service";

const QUEUE_NAME = "myqueue";

export const worker = new Worker(
  QUEUE_NAME,
  async (job) => {
    console.log("Received job:", job.id);
    console.log("Content:", job.data.content);

    const vector = JSON.stringify(await generateEmbedding(job.data.content));

    await prisma.$executeRaw`
      UPDATE "Note"
      SET "embedding" = ${vector}::vector
      WHERE "id" = ${job.data.id}
    `;

    return {
      processed: true,
    };
  },
  { connection },
);

worker.on("completed", (job) => {
  console.log(`Job ${job.id} completed`);
});

worker.on("failed", (job, error) => {
  console.error(`Job ${job?.id} failed:`, error);
});
