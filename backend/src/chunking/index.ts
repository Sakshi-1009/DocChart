/**
 * Text Chunking — Split documents into smaller, overlapping pieces.
 *
 * WHY CHUNKING IS NECESSARY:
 * LLMs have limited context windows. Even with large windows, stuffing
 * an entire document into a prompt is wasteful and reduces answer quality.
 * By splitting documents into small, focused chunks, we can retrieve ONLY
 * the most relevant pieces for each question — leading to more precise,
 * grounded answers and lower token costs.
 *
 * WHY OVERLAP IMPROVES RETRIEVAL:
 * Without overlap, a piece of information that spans a chunk boundary
 * would be split across two chunks, and neither chunk alone would contain
 * the full context. Overlap (e.g., 200 characters) ensures that
 * boundary-spanning content appears in at least one complete chunk,
 * significantly improving retrieval recall.
 */

import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import type { DocumentChunk, ChunkMetadata } from "../types";
import type { LoadedDocument } from "../loaders";

/** Default chunking configuration */
const DEFAULT_CHUNK_SIZE = 1000;
const DEFAULT_CHUNK_OVERLAP = 200;

/**
 * Split a loaded document into overlapping chunks with metadata.
 *
 * Uses LangChain's RecursiveCharacterTextSplitter which tries to split
 * on natural boundaries (paragraphs → sentences → words) before falling
 * back to character-level splits. This preserves semantic coherence
 * within each chunk.
 */
export async function chunkDocument(
  loadedDoc: LoadedDocument,
  documentId: string,
  filename: string,
  chunkSize: number = DEFAULT_CHUNK_SIZE,
  chunkOverlap: number = DEFAULT_CHUNK_OVERLAP
): Promise<DocumentChunk[]> {
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize,
    chunkOverlap,
    // Split on natural boundaries in this priority order:
    // double newline → single newline → sentence end → comma → space → character
    separators: ["\n\n", "\n", ". ", ", ", " ", ""],
  });

  const chunks: DocumentChunk[] = [];

  // Process each page separately to preserve page number metadata
  for (let pageIdx = 0; pageIdx < loadedDoc.pages.length; pageIdx++) {
    const pageText = loadedDoc.pages[pageIdx];
    if (!pageText.trim()) continue;

    const pageChunks = await splitter.splitText(pageText);

    for (const chunkText of pageChunks) {
      const metadata: ChunkMetadata = {
        documentId,
        filename,
        chunkIndex: chunks.length, // Global chunk index across the document
        pageNumber: pageIdx + 1, // 1-based page number
        content: chunkText,
      };

      chunks.push({ content: chunkText, metadata });
    }
  }

  console.log(
    `📄 Chunked "${filename}" into ${chunks.length} chunks ` +
      `(chunkSize=${chunkSize}, overlap=${chunkOverlap})`
  );

  return chunks;
}
