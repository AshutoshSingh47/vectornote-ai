import cors from "cors";
import express from "express";
import askRoutes from "./routes/ask.routes";
import notesRoutes from "./routes/notes.routes";
import { redis } from "./lib/redis-connection";
import { queue } from "./lib/bullmq-connection";

export const app = express();

app.use(
  cors({
    origin: process.env.ALLOWED_ORIGINS ?? "http://localhost:3000",
    credentials: true,
  }),
);
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "learning-ai" });
});

app.use("/api/notes", notesRoutes);
app.use("/api/ask", askRoutes);
