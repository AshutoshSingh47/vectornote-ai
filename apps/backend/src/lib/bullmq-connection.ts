import { Queue, createNodeRedisClient } from "bullmq";
import { createClient } from "redis";

const QUEUE_NAME = "myqueue";

const rawClient = createClient({
  url: process.env.REDIS_URL ?? "redis://localhost:6379",
});

export const connection = createNodeRedisClient(rawClient);

export const queue = new Queue(QUEUE_NAME, { connection });
