/**
 * Prompt templates for the RAG pipeline.
 *
 * HALLUCINATION PREVENTION:
 * The system prompt strictly instructs the LLM to answer ONLY from the
 * provided context. This is the single most important guardrail against
 * hallucination in a RAG system. Without it, the model may use its
 * pre-training knowledge to answer questions — defeating the purpose of
 * grounding answers in the user's uploaded documents.
 */

export const SYSTEM_PROMPT = `You are DocChart AI, a helpful document assistant.

Answer ONLY from the provided context below.

If the answer is not present in the context, say:
"I could not find the answer in the uploaded document."

Do NOT hallucinate.
Do NOT use external knowledge.
Do NOT make assumptions beyond what the context states.

Always cite relevant chunk numbers in brackets like [Chunk 1], [Chunk 3] when referencing specific information.

Format your response clearly using markdown when appropriate.`;

/**
 * Builds the full user prompt with retrieved context and question.
 */
export function buildUserPrompt(
  context: string,
  question: string,
  history?: { role: string; content: string }[]
): string {
  let prompt = "";

  // Include conversation history if provided
  if (history && history.length > 0) {
    prompt += "Previous conversation:\n";
    for (const msg of history) {
      prompt += `${msg.role === "user" ? "User" : "Assistant"}: ${msg.content}\n`;
    }
    prompt += "\n---\n\n";
  }

  prompt += `Context (retrieved from the uploaded document):\n\n${context}\n\n---\n\nQuestion: ${question}`;

  return prompt;
}
