/**
 * Chat Service — Handles the retrieval-augmented generation (RAG) pipeline.
 *
 * HOW RAG WORKS:
 * 1. User asks a question
 * 2. The question is embedded into the same vector space as the document chunks
 * 3. We perform similarity search in Qdrant to find the most relevant chunks
 * 4. The retrieved chunks are assembled into a "context" string
 * 5. The context + question are sent to the LLM with strict grounding instructions
 * 6. The LLM generates an answer ONLY from the provided context
 *
 * This approach ensures answers are grounded in the user's documents and
 * prevents the model from hallucinating or using external knowledge.
 */

import { ChatGroq } from "@langchain/groq";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { config } from "../config";
import { searchSimilar } from "../vectorstore";
import { SYSTEM_PROMPT, buildUserPrompt } from "../prompts";
import type { ChatRequest, ChatResponse, SourceChunk } from "../types";

/** Singleton ChatGroq instance */
let chatModel: ChatGroq | null = null;

function getChatModel(): ChatGroq {
  if (!chatModel) {
    chatModel = new ChatGroq({
      apiKey: config.groqApiKey,
      modelName: config.chatModel,
      temperature: 0.1, // Low temperature for factual, grounded answers
      streaming: false,
    });
  }
  return chatModel;
}

/**
 * Process a chat question through the full RAG pipeline.
 *
 * Steps:
 * 1. Retrieve relevant chunks from Qdrant
 * 2. Build context from retrieved chunks
 * 3. Send context + question to OpenAI
 * 4. Return answer + sources
 */
export async function processChat(request: ChatRequest): Promise<ChatResponse> {
  const { question, documentId, history } = request;

  console.log(`\n💬 Processing question: "${question}"`);
  if (documentId) {
    console.log(`   Scoped to document: ${documentId}`);
  }

  // Step 1: Retrieve relevant chunks
  console.log("   Step 1: Retrieving relevant chunks...");
  const sources: SourceChunk[] = await searchSimilar(
    question,
    config.retrievalTopK,
    documentId
  );

  if (sources.length === 0) {
    return {
      answer:
        "I could not find any relevant information in the uploaded documents. Please upload a document first or try a different question.",
      sources: [],
    };
  }

  console.log(`   ✅ Retrieved ${sources.length} chunks`);

  // Step 2: Build context from retrieved chunks
  const context = sources
    .map(
      (source, i) =>
        `[Chunk ${i + 1}] (${source.filename}, Page ${source.pageNumber}, Score: ${source.score.toFixed(3)}):\n${source.content}`
    )
    .join("\n\n---\n\n");

  // Step 3: Send to LLM with grounding prompt
  console.log("   Step 2: Generating answer with LLM...");
  const model = getChatModel();

  const userPrompt = buildUserPrompt(context, question, history);

  const response = await model.invoke([
    new SystemMessage(SYSTEM_PROMPT),
    new HumanMessage(userPrompt),
  ]);

  const answer =
    typeof response.content === "string"
      ? response.content
      : JSON.stringify(response.content);

  console.log(`   ✅ Answer generated (${answer.length} chars)\n`);

  return { answer, sources };
}

/**
 * Stream a chat response using Server-Sent Events.
 * Returns an async generator of text chunks.
 */
export async function* streamChat(
  request: ChatRequest
): AsyncGenerator<{ type: "chunk" | "sources" | "done"; data: string }> {
  const { question, documentId, history } = request;

  // Step 1: Retrieve relevant chunks
  const sources: SourceChunk[] = await searchSimilar(
    question,
    config.retrievalTopK,
    documentId
  );

  if (sources.length === 0) {
    yield {
      type: "chunk",
      data: "I could not find any relevant information in the uploaded documents. Please upload a document first or try a different question.",
    };
    yield { type: "done", data: "" };
    return;
  }

  // Send sources first
  yield { type: "sources", data: JSON.stringify(sources) };

  // Build context
  const context = sources
    .map(
      (source, i) =>
        `[Chunk ${i + 1}] (${source.filename}, Page ${source.pageNumber}):\n${source.content}`
    )
    .join("\n\n---\n\n");

  // Stream from LLM
  const model = new ChatGroq({
    apiKey: config.groqApiKey,
    modelName: config.chatModel,
    temperature: 0.1,
    streaming: true,
  });

  const userPrompt = buildUserPrompt(context, question, history);

  const stream = await model.stream([
    new SystemMessage(SYSTEM_PROMPT),
    new HumanMessage(userPrompt),
  ]);

  for await (const chunk of stream) {
    const text =
      typeof chunk.content === "string"
        ? chunk.content
        : JSON.stringify(chunk.content);
    if (text) {
      yield { type: "chunk", data: text };
    }
  }

  yield { type: "done", data: "" };
}
