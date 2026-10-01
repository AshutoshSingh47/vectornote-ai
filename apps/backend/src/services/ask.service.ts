import { groq } from "@ai-sdk/groq";
import { streamText } from "ai";
import { generateEmbedding } from "./embedding.service";
import { SearchResult, searchSimilarNotes } from "./notes.service";
import { redis } from "../lib/redis-connection";

type AskResult = { answer: string; sources: SearchResult[] };

// Cached answers are served as a single chunk (nothing left to stream),
// a live answer streams its text deltas as they arrive from the model.
type AskStreamResult =
  | { cached: true; answer: string; sources: SearchResult[] }
  | {
      cached: false;
      textStream: AsyncIterable<string>;
      sources: SearchResult[];
    };

const CACHE_TTL_SECONDS = 60;

export async function answerQuestionStream(
  query: string,
): Promise<AskStreamResult> {
  const cached = await getCachedAnswer(query);
  if (cached) {
    console.log(`cache [HIT] "${query}"`);
    return { cached: true, ...cached };
  }
  console.log(`cache [MISS] "${query}"`);
  // 1. Embed the question
  const embedding = await generateEmbedding(query);

  // 2. Find the closest notes
  const notes = await searchSimilarNotes(embedding);

  if (notes.length === 0) {
    return {
      cached: true,
      answer: "I don't know. No relevant notes were found.",
      sources: [],
    };
  }

  // 3. Build context
  const context = notes
    .map((note) => `Title: ${note.title}\nContent: ${note.content}`)
    .join("\n\n---\n\n");

  const result = streamText({
    model: groq("openai/gpt-oss-20b"),
    prompt: `Use the following notes to answer the question.
      Notes:
      ${context}

      Question:
      ${query}

      If the answer is not present in the notes, say you don't know.`,
    onEnd: async ({ text }) => {
      await cacheAnswer(query, { answer: text, sources: notes });
    },
  });

  return { cached: false, textStream: result.textStream, sources: notes };
}

export async function cacheAnswer(query: string, result: AskResult) {
  if (!redis.isReady) return;
  try {
    await redis.set(cacheKey(query), JSON.stringify(result), {
      expiration: { type: "EX", value: CACHE_TTL_SECONDS },
    });
  } catch (error) {
    console.error("[cache] write failed:", error);
  }
}

export async function getCachedAnswer(
  query: string,
): Promise<AskResult | null> {
  if (!redis.isReady) return null;
  try {
    const value = await redis.get(cacheKey(query));
    return value ? (JSON.parse(value) as AskResult) : null;
  } catch (error) {
    console.error("[cache] read failed:", error);
    return null;
  }
}

function cacheKey(query: string) {
  const normalized = query
    .trim()
    .toLowerCase()
    .replace(/[?.!,]/g, "")
    .replace(/\s+/g, " ");
  return `rag:${normalized}`;
}
