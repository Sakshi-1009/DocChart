/**
 * Document Service — Orchestrates the document upload → chunk → embed → store pipeline.
 *
 * This service ties together:
 * 1. Document loading (PDF/TXT parsing)
 * 2. Text chunking (splitting into overlapping pieces)
 * 3. Vector storage (embedding + storing in Qdrant)
 *
 * It also maintains an in-memory registry of uploaded documents.
 */

import fs from "fs";
import { v4 as uuidv4 } from "uuid";
import { loadDocument } from "../loaders";
import { chunkDocument } from "../chunking";
import { storeChunks, deleteDocumentVectors } from "../vectorstore";
import type { DocumentRecord, UploadResponse } from "../types";

/** In-memory document registry (would use a DB in production) */
const documentRegistry: Map<string, DocumentRecord> = new Map();

/**
 * Process an uploaded file through the full RAG ingestion pipeline.
 *
 * Steps:
 * 1. Generate a unique document ID
 * 2. Load and parse the document
 * 3. Chunk the text into overlapping pieces
 * 4. Generate embeddings and store vectors in Qdrant
 * 5. Clean up the temporary file
 * 6. Return success metadata
 */
export async function processDocument(
  filePath: string,
  originalFilename: string
): Promise<UploadResponse> {
  const documentId = uuidv4();

  try {
    console.log(`\n📥 Processing document: ${originalFilename}`);
    console.log(`   Document ID: ${documentId}`);

    // Step 1: Load the document
    console.log("   Step 1: Loading document...");
    const loadedDoc = await loadDocument(filePath);
    console.log(`   ✅ Loaded ${loadedDoc.pageCount} page(s), ${loadedDoc.text.length} characters`);

    // Step 2: Chunk the document
    console.log("   Step 2: Chunking document...");
    const chunks = await chunkDocument(loadedDoc, documentId, originalFilename);

    // Step 3: Embed and store chunks
    console.log("   Step 3: Generating embeddings and storing in Qdrant...");
    await storeChunks(chunks);

    // Step 4: Register the document
    const record: DocumentRecord = {
      documentId,
      filename: originalFilename,
      uploadedAt: new Date(),
      totalChunks: chunks.length,
    };
    documentRegistry.set(documentId, record);

    console.log(`   ✅ Document processed successfully: ${chunks.length} chunks stored\n`);

    return {
      message: "Document uploaded and processed successfully",
      documentId,
      filename: originalFilename,
      totalChunks: chunks.length,
    };
  } finally {
    // Always clean up the temporary file
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch {
      console.warn(`⚠️ Could not delete temp file: ${filePath}`);
    }
  }
}

/**
 * Get all uploaded documents.
 */
export function getAllDocuments(): DocumentRecord[] {
  return Array.from(documentRegistry.values()).sort(
    (a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime()
  );
}

/**
 * Get a specific document by ID.
 */
export function getDocument(documentId: string): DocumentRecord | undefined {
  return documentRegistry.get(documentId);
}

/**
 * Delete a document and its vectors.
 */
export async function deleteDocument(documentId: string): Promise<void> {
  const doc = documentRegistry.get(documentId);
  if (!doc) {
    throw new Error(`Document not found: ${documentId}`);
  }

  // Delete vectors from Qdrant
  await deleteDocumentVectors(documentId);

  // Remove from registry
  documentRegistry.delete(documentId);

  console.log(`🗑️ Document deleted: ${doc.filename} (${documentId})`);
}
