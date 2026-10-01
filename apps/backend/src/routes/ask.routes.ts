import { Router } from "express";
import { ask } from "../controllers/ask.controllers";

const router = Router();

router.post("/", ask); // POST /api/ask

export default router;
