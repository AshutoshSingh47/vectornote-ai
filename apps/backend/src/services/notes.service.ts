import { prisma } from "@repo/db";
import { queue } from "../lib/bullmq-connection";

export type SearchResult = {
  id: string;
  title: string;
  content: string;
  similarity: number;
};

export async function saveNote(title: string, content: string) {
  const note = await prisma.note.create({ data: { title, content } });

  await queue.add("generate-note-embedding", {
    id: note.id,
    content,
  });

  return note;
}

export function findAllNotes() {
  return prisma.note.findMany();
}

export function searchSimilarNotes(embedding: number[]) {
  const vector = JSON.stringify(embedding);

  return prisma.$queryRaw<SearchResult[]>`
    SELECT
      "id",
      "title",
      "content",
      1 - ("embedding" <=> ${vector}::vector) AS "similarity"
    FROM "Note"
    WHERE "embedding" IS NOT NULL
    ORDER BY "embedding" <=> ${vector}::vector
    LIMIT 3
  `;
}
