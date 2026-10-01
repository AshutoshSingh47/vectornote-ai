import { Router } from "express";
import { createNote, listNotes } from "../controllers/notes.controllers";

const router = Router();

router.post("/", createNote); // POST /api/notes
router.get("/", listNotes); //   GET  /api/notes

export default router;
