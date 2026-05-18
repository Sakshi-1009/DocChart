/**
 * Global error handling middleware.
 * Catches all errors and returns consistent JSON error responses.
 */

import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { MulterError } from "multer";

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  next: NextFunction
): void {
  console.error("❌ Error:", err.message);

  if (res.headersSent) {
    return next(err);
  }

  // Zod validation errors
  if (err instanceof ZodError) {
    res.status(400).json({
      error: "Validation error",
      details: err.errors.map((e) => ({
        field: e.path.join("."),
        message: e.message,
      })),
    });
    return;
  }

  // Multer file upload errors
  if (err instanceof MulterError) {
    const messages: Record<string, string> = {
      LIMIT_FILE_SIZE: "File is too large. Maximum size is 20MB.",
      LIMIT_UNEXPECTED_FILE: "Unexpected file field.",
      LIMIT_FILE_COUNT: "Too many files uploaded.",
    };
    res.status(400).json({
      error: messages[err.code] || `Upload error: ${err.message}`,
    });
    return;
  }

  // Known application errors (message is safe to expose)
  if (err.message.includes("Unsupported file type") ||
      err.message.includes("empty") ||
      err.message.includes("Invalid file type")) {
    res.status(400).json({ error: err.message });
    return;
  }

  // Groq errors
  if (err.message.includes("Groq") || err.message.includes("groq")) {
    res.status(502).json({
      error: "AI service error. Please check your Groq API key and try again.",
    });
    return;
  }

  // Qdrant errors
  if (err.message.includes("Qdrant") || err.message.includes("qdrant")) {
    res.status(502).json({
      error: "Vector database error. Please ensure Qdrant is running.",
    });
    return;
  }

  // Fallback: generic server error
  res.status(500).json({
    error: "An unexpected error occurred. Please try again.",
  });
}
