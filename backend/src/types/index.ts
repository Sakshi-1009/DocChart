/**
 * TypeScript interfaces used across the DocChart backend.
 */

/** Metadata stored alongside each vector in Qdrant */
export interface ChunkMetadata {
  /** Unique document identifier */
  documentId: string;
  /** Original filename */
  filename: string;
  /** Zero-based chunk index within the document */
  chunkIndex: number;
  /** Page number (1-based) if available, -1 otherwise */
  pageNumber: number;
  /** The raw text content of the chunk */
  content: string;
}

/** A single chunk produced by the splitter */
export interface DocumentChunk {
  content: string;
  metadata: ChunkMetadata;
}

/** Shape of the POST /chat request body */
export interface ChatRequest {
  question: string;
  /** Optional: limit retrieval to a specific document */
  documentId?: string;
  /** Optional: previous messages for conversation memory */
  history?: ChatMessage[];
}

/** A single chat message (user or assistant) */
export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

/** A retrieved source chunk returned to the frontend */
export interface SourceChunk {
  content: string;
  filename: string;
  chunkIndex: number;
  pageNumber: number;
  score: number;
}

/** Shape of the POST /chat response */
export interface ChatResponse {
  answer: string;
  sources: SourceChunk[];
}

/** Shape of the POST /upload response */
export interface UploadResponse {
  message: string;
  documentId: string;
  filename: string;
  totalChunks: number;
}

/** Document record stored in-memory */
export interface DocumentRecord {
  documentId: string;
  filename: string;
  uploadedAt: Date;
  totalChunks: number;
}
