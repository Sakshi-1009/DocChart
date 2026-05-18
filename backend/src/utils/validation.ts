/**
 * Request validation schemas using Zod.
 * Ensures all incoming data is properly typed and validated.
 */

import { z } from "zod";

/** Validates POST /chat request body */
export const chatRequestSchema = z.object({
  question: z
    .string()
    .min(1, "Question cannot be empty")
    .max(2000, "Question is too long (max 2000 characters)"),
  documentId: z.string().uuid().optional(),
  history: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string(),
      })
    )
    .optional(),
});

/** Validates that an uploaded file exists on the request */
export function validateUploadedFile(file: Express.Multer.File | undefined): void {
  if (!file) {
    throw new Error("No file uploaded. Please upload a PDF or TXT file.");
  }
}
