import { CreateNoteModal } from "@/components/create-note-modal";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SparklesIcon } from "lucide-react";
import Link from "next/link";

interface Note {
  id: string;
  title: string;
  content: string;
  embedding: string | null;
  createdAt: string;
  updatedAt: string;
}

type NoteResponse =
  | {
      success: true;
      message: string;
      data: Note[];
    }
  | {
      success: false;
      message: string;
    };

export default async function Home() {
  try {
    const response = await fetch("http://localhost:8080/api/notes", {
      method: "GET",
      cache: "no-store",
    });

    const result: NoteResponse = await response.json();

    if (!result.success) {
      return (
        <div className="w-full p-5 font-sans">
          <p className="text-red-500">{result.message}</p>
        </div>
      );
    }

    const { data } = result;

    return (
      <div className="flex w-full flex-col gap-6 p-5 font-sans">
        <div className="flex gap-2 self-end">
          <CreateNoteModal />
          <Link
            href="/ai"
            children={
              <Button variant="default">
                <SparklesIcon />
                Ask AI
              </Button>
            }
          />
        </div>

        {data.length > 0 ? (
          <div className="flex flex-wrap gap-10">
            {data.map((note) => {
              return (
                <Card
                  key={note.id}
                  className="relative overflow-visible hover:-translate-y-1 h-60 aspect-square -rotate-1 rounded-sm border-none bg-amber-100 shadow-[0_8px_16px_rgba(0,0,0,0.18)] transition-transform hover:rotate-0 hover:scale-[1.02]"
                >
                  <CardHeader>
                    <CardTitle className="line-clamp-1 text-px">
                      {note.title}
                    </CardTitle>
                    <CardDescription className="text-amber-900/80 text-xs line-clamp-7 whitespace-pre-line leading-6">
                      {note.content}
                    </CardDescription>
                  </CardHeader>
                  <div
                    aria-hidden="true"
                    className="absolute left-1/2 top-0 flex size-4 -translate-x-1/2 -translate-y-2 items-center justify-center"
                  >
                    <div className="size-3 rounded-full bg-red-500 shadow-sm"></div>
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="flex items-center justify-center text-xl">
            No notes yet!
          </div>
        )}
      </div>
    );
  } catch (error) {
    console.error("Failed to fetch notes:", error);

    return (
      <div className="w-full p-5 font-sans">
        <p className="text-red-500">
          Unable to connect to the server. Please try again later.
        </p>
      </div>
    );
  }
}
