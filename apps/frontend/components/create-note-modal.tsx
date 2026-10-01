"use client";

import { PlusIcon } from "lucide-react";
import { ChangeEvent, useState } from "react";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { toast } from "./ui/toast";
import { useRouter } from "next/navigation";
import { Separator } from "./ui/separator";

export function CreateNoteModal() {
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: ChangeEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch("http://localhost:8080/api/notes", {
        method: "POST",
        body: JSON.stringify({ title, content }),
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();

      if (!response.ok) {
        toast.add({
          title: "Failed to create note",
          description: data.message,
          type: "error",
        });

        return;
      }
      toast.add({
        title: "Note created",
        description: data.message,
        type: "success",
      });
      setTitle("");
      setContent("");
      setOpen(false);

      router.refresh();
    } catch (error) {
      toast.add({
        title: "Something went wrong",
        description: "Unable to connect to the server.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  }

  function handleTitleChange(e: ChangeEvent<HTMLInputElement>) {
    setTitle(e.target.value);
  }

  function handleContentChange(e: ChangeEvent<HTMLTextAreaElement>) {
    setContent(e.target.value);
  }

  return (
    <Dialog open={open} onOpenChange={(open) => setOpen(open)}>
      <DialogTrigger render={<Button className="flex w-fit self-end" />}>
        <PlusIcon />
        New note
      </DialogTrigger>
      <DialogContent className="overflow-hidden">
        <DialogHeader>
          <DialogTitle>Add a note</DialogTitle>
          <DialogDescription>
            Add your favourite note, then save your changes.
          </DialogDescription>
        </DialogHeader>
        <form className="grid gap-5" onSubmit={handleSubmit}>
          <div className="grid gap-2">
            <Label htmlFor="note-title">Title</Label>
            <Input
              id="note-title"
              value={title}
              onChange={handleTitleChange}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="note-content">Content</Label>
            <Textarea
              className="overflow-y-scroll h-60 max-h-80"
              id="note-content"
              value={content}
              onChange={handleContentChange}
              required
            />
          </div>
          <DialogFooter>
            <DialogClose render={<Button type="button" variant="outline" />}>
              Cancel
            </DialogClose>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
