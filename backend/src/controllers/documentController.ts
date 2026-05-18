/**
 * Document Controller — Handles HTTP requests for document operations.
 */

import { Request, Response, NextFunction } from "express";
import {
  processDocument,
  getAllDocuments,
  getDocument,
  deleteDocument,
} from "../services/documentService";
import { validateUploadedFile } from "../utils/validation";

/**
 * POST /api/upload
 * Upload and process a PDF or TXT document.
 */
export async function uploadDocument(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    validateUploadedFile(req.file);

    const file = req.file!;
    const result = await processDocument(file.path, file.originalname);

    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/documents
 * List all uploaded documents.
 */
export async function listDocuments(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const documents = getAllDocuments();
    res.json({ documents });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/documents/:id
 * Get a specific document's info.
 */
export async function getDocumentById(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const doc = getDocument(req.params.id);
    if (!doc) {
      res.status(404).json({ error: "Document not found" });
      return;
    }
    res.json(doc);
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/documents/:id
 * Delete a document and its vectors.
 */
export async function deleteDocumentById(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    await deleteDocument(req.params.id);
    res.json({ message: "Document deleted successfully" });
  } catch (error) {
    next(error);
  }
}
