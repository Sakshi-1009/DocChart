import dotenv from "dotenv";
dotenv.config();

/**
 * Centralized configuration — all environment variables are validated
 * and exported from here. Fail fast if required vars are missing.
 */
const requiredEnvVars = ["GROQ_API_KEY"] as const;

for (const key of requiredEnvVars) {
  if (!process.env[key]) {
    throw new Error(`❌ Missing required environment variable: ${key}`);
  }
}

export const config = {
  /** Groq API key for chat completions */

  /** Groq API key for chat completions */
  groqApiKey: process.env.GROQ_API_KEY!,

  /** Qdrant vector database connection URL */
  qdrantUrl: process.env.QDRANT_URL || "http://localhost:6333",

  /** Qdrant API key (needed for Qdrant Cloud) */
  qdrantApiKey: process.env.QDRANT_API_KEY || undefined,

  /** Express server port */
  port: parseInt(process.env.PORT || "5000", 10),

  /** Frontend URL for CORS */
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:5173",

  /** Qdrant collection name for document embeddings */
  collectionName: "docchart_docs_hf",

  /** Embedding model — using local HF MiniLM */
  embeddingModel: "Xenova/all-MiniLM-L6-v2",

  /** Embedding vector dimensions for MiniLM-L6-v2 */
  embeddingDimensions: 384,

  /** Chat model */
  chatModel: "llama3-8b-8192",

  /** Number of top-K chunks to retrieve for each question */
  retrievalTopK: 4,
} as const;
