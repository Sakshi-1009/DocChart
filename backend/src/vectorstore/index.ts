/**
 * Qdrant Vector Store — Manages embedding storage and similarity search.
 *
 * WHY VECTOR DATABASES:
 * Traditional databases use exact-match queries (SQL WHERE clauses).
 * But semantic search requires finding documents that are *similar in meaning*
 * to a query, not just matching keywords. Vector databases store high-dimensional
 * embeddings and use algorithms like HNSW (Hierarchical Navigable Small World)
 * to perform fast approximate nearest-neighbor search — enabling us to find
 * the most semantically relevant chunks for any given question.
 *
 * WHY EMBEDDINGS:
 * Embeddings are numerical representations of text in a high-dimensional
 * space where semantically similar texts are close together. By converting
 * both document chunks and user questions into the same embedding space,
 * we can use cosine similarity to find the most relevant chunks.
 */

import { QdrantClient } from "@qdrant/js-client-rest";
import { HuggingFaceTransformersEmbeddings } from "@langchain/community/embeddings/hf_transformers";
import { config } from "../config";
import type { DocumentChunk, SourceChunk } from "../types";
import { v4 as uuidv4 } from "uuid";

/** Singleton Qdrant client */
let qdrantClient: QdrantClient | null = null;

/** Singleton HF embeddings instance */
let embeddings: HuggingFaceTransformersEmbeddings | null = null;

/**
 * Get or create the Qdrant client instance.
 */
export function getQdrantClient(): QdrantClient {
  if (!qdrantClient) {
    qdrantClient = new QdrantClient({
      url: config.qdrantUrl,
      apiKey: config.qdrantApiKey,
    });
    console.log(`🔗 Connected to Qdrant at ${config.qdrantUrl}`);
  }
  return qdrantClient;
}

/**
 * Get or create the HF embeddings instance.
 */
export function getEmbeddings(): HuggingFaceTransformersEmbeddings {
  if (!embeddings) {
    embeddings = new HuggingFaceTransformersEmbeddings({
      modelName: config.embeddingModel,
    });
  }
  return embeddings;
}

/**
 * Ensure the Qdrant collection exists. Creates it if it doesn't.
 * Called at server startup.
 */
export async function ensureCollection(): Promise<void> {
  const client = getQdrantClient();

  try {
    const collections = await client.getCollections();
    const exists = collections.collections.some(
      (c) => c.name === config.collectionName
    );

    if (!exists) {
      await client.createCollection(config.collectionName, {
        vectors: {
          size: config.embeddingDimensions,
          distance: "Cosine",
        },
      });
      console.log(`✅ Created Qdrant collection: ${config.collectionName}`);
    } else {
      console.log(`✅ Qdrant collection "${config.collectionName}" already exists`);
    }
  } catch (error) {
    console.error("❌ Failed to connect to Qdrant:", error);
    throw new Error(
      "Could not connect to Qdrant. Make sure Qdrant is running at " +
        config.qdrantUrl
    );
  }
}

/**
 * Store document chunks as vectors in Qdrant.
 *
 * Flow:
 * 1. Convert chunk texts → embeddings using OpenAI
 * 2. Create Qdrant points with embeddings + metadata payload
 * 3. Upsert points into the collection
 */
export async function storeChunks(chunks: DocumentChunk[]): Promise<void> {
  const client = getQdrantClient();
  const embeddingsModel = getEmbeddings();

  // Generate embeddings for all chunk texts in batch
  const texts = chunks.map((c) => c.content);
  const vectors = await embeddingsModel.embedDocuments(texts);

  // Build Qdrant points
  const points = chunks.map((chunk, i) => ({
    id: uuidv4(),
    vector: vectors[i],
    payload: {
      documentId: chunk.metadata.documentId,
      filename: chunk.metadata.filename,
      chunkIndex: chunk.metadata.chunkIndex,
      pageNumber: chunk.metadata.pageNumber,
      content: chunk.metadata.content,
    },
  }));

  // Upsert in batches of 100 to avoid payload size limits
  const BATCH_SIZE = 100;
  for (let i = 0; i < points.length; i += BATCH_SIZE) {
    const batch = points.slice(i, i + BATCH_SIZE);
    await client.upsert(config.collectionName, {
      wait: true,
      points: batch,
    });
  }

  console.log(`📦 Stored ${chunks.length} vectors in Qdrant`);
}

/**
 * Perform similarity search — find the most relevant chunks for a question.
 *
 * HOW RETRIEVAL IMPROVES ANSWER QUALITY:
 * Instead of sending the entire document to the LLM (which may exceed
 * context limits and dilute focus), we retrieve only the top-K most
 * relevant chunks. This gives the LLM focused, relevant context —
 * leading to more accurate, concise answers.
 *
 * @param question - The user's question
 * @param topK - Number of results to return (default: config.retrievalTopK)
 * @param documentId - Optional document ID to filter results
 */
export async function searchSimilar(
  question: string,
  topK: number = config.retrievalTopK,
  documentId?: string
): Promise<SourceChunk[]> {
  const client = getQdrantClient();
  const embeddingsModel = getEmbeddings();

  // Embed the question into the same vector space as the document chunks
  const queryVector = await embeddingsModel.embedQuery(question);

  // Build optional filter to scope search to a specific document
  const filter = documentId
    ? {
        must: [
          {
            key: "documentId",
            match: { value: documentId },
          },
        ],
      }
    : undefined;

  // Perform similarity search
  const results = await client.search(config.collectionName, {
    vector: queryVector,
    limit: topK,
    with_payload: true,
    filter,
  });

  // Map Qdrant results to our SourceChunk interface
  return results.map((result) => ({
    content: (result.payload?.content as string) || "",
    filename: (result.payload?.filename as string) || "",
    chunkIndex: (result.payload?.chunkIndex as number) || 0,
    pageNumber: (result.payload?.pageNumber as number) || -1,
    score: result.score,
  }));
}

/**
 * Delete all vectors belonging to a specific document.
 */
export async function deleteDocumentVectors(documentId: string): Promise<void> {
  const client = getQdrantClient();

  await client.delete(config.collectionName, {
    filter: {
      must: [
        {
          key: "documentId",
          match: { value: documentId },
        },
      ],
    },
  });

  console.log(`🗑️ Deleted vectors for document: ${documentId}`);
}
