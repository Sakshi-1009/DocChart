/**
 * Document Loaders — Extract raw text from uploaded PDF and TXT files.
 *
 * WHY DOCUMENT LOADING MATTERS:
 * Before we can chunk, embed, and search a document, we need to extract
 * its textual content. PDF files are binary and need special parsing.
 * TXT files are plain text but still need to be read from disk.
 */

import fs from "fs";
import path from "path";
import pdfParse from "pdf-parse";

/** Result of loading a document — text content plus page info */
export interface LoadedDocument {
  text: string;
  /** Total number of pages (1 for TXT files) */
  pageCount: number;
  /** Text broken down by page, if available */
  pages: string[];
}

/**
 * Load and extract text from a file based on its extension.
 * Supports .pdf and .txt files.
 */
export async function loadDocument(filePath: string): Promise<LoadedDocument> {
  const ext = path.extname(filePath).toLowerCase();

  switch (ext) {
    case ".pdf":
      return loadPDF(filePath);
    case ".txt":
      return loadTXT(filePath);
    default:
      throw new Error(`Unsupported file type: ${ext}. Only .pdf and .txt are supported.`);
  }
}

/**
 * Parse a PDF file and extract text content.
 * Uses pdf-parse which handles most PDF formats.
 */
async function loadPDF(filePath: string): Promise<LoadedDocument> {
  const dataBuffer = fs.readFileSync(filePath);
  const data = await pdfParse(dataBuffer);

  if (!data.text || data.text.trim().length === 0) {
    throw new Error("The uploaded PDF appears to be empty or contains only images (no extractable text).");
  }

  // pdf-parse provides text with page breaks as form feed characters (\f)
  const pages = data.text.split(/\f/).filter((page) => page.trim().length > 0);

  return {
    text: data.text,
    pageCount: data.numpages,
    pages,
  };
}

/**
 * Load a plain text file.
 */
async function loadTXT(filePath: string): Promise<LoadedDocument> {
  const text = fs.readFileSync(filePath, "utf-8");

  if (!text || text.trim().length === 0) {
    throw new Error("The uploaded text file is empty.");
  }

  return {
    text,
    pageCount: 1,
    pages: [text],
  };
}
