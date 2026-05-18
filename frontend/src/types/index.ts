/** Frontend TypeScript interfaces — mirrors backend types */

export interface SourceChunk {
  content: string;
  filename: string;
  chunkIndex: number;
  pageNumber: number;
  score: number;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: SourceChunk[];
  timestamp: Date;
  isStreaming?: boolean;
}

export interface DocumentRecord {
  documentId: string;
  filename: string;
  uploadedAt: string;
  totalChunks: number;
}

export interface UploadResponse {
  message: string;
  documentId: string;
  filename: string;
  totalChunks: number;
}

export interface ChatResponse {
  answer: string;
  sources: SourceChunk[];
}

export interface StreamEvent {
  type: "chunk" | "sources" | "done";
  data: string;
}
