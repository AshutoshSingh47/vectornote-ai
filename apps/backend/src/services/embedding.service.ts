const OLLAMA_URL = "http://localhost:11434/api/embed";
const EMBEDDING_DIMENSIONS = 384; // all-minilm output size, must match the DB vector column

export async function generateEmbedding(content: string): Promise<number[]> {
  const response = await fetch(OLLAMA_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model: "all-minilm", input: content }),
  });

  if (!response.ok) {
    throw new Error(`Ollama request failed: ${response.status}`);
  }

  const data = (await response.json()) as { embeddings: number[][] };
  const embedding = data.embeddings[0];

  if (embedding?.length !== EMBEDDING_DIMENSIONS) {
    throw new Error(
      `Expected ${EMBEDDING_DIMENSIONS} dimensions, received ${embedding?.length}`,
    );
  }

  return embedding;
}
