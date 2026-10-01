import type { Request, Response } from "express";
import { findAllNotes, saveNote } from "../services/notes.service";

export async function createNote(req: Request, res: Response) {
  try {
    const { title, content } = req.body;
    const note = await saveNote(title, content);

    res.status(201).json({
      success: true,
      message: "Note created successfully",
      id: note.id,
    });
  } catch (error) {
    console.error("Failed to save note:", error);
    res.status(500).json({ success: false, message: "Failed to save note" });
  }
}

export async function listNotes(_req: Request, res: Response) {
  try {
    const notes = await findAllNotes();

    res.status(200).json({
      success: true,
      message: "Successfully fetched notes",
      data: notes,
    });
  } catch (error) {
    console.error("Failed to fetch notes:", error);
    res.status(500).json({ success: false, message: "Failed to fetch notes" });
  }
}
