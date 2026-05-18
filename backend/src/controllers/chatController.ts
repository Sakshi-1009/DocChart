/**
 * Chat Controller — Handles HTTP requests for the chat/Q&A pipeline.
 */

import { Request, Response, NextFunction } from "express";
import { processChat, streamChat } from "../services/chatService";
import { chatRequestSchema } from "../utils/validation";

/**
 * POST /api/chat
 * Ask a question and get a grounded answer from uploaded documents.
 */
export async function chat(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // Validate request body
    const validatedBody = chatRequestSchema.parse(req.body);

    const result = await processChat(validatedBody);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/chat/stream
 * Stream a chat response using Server-Sent Events (SSE).
 *
 * The frontend connects to this endpoint and receives real-time text
 * chunks as the LLM generates them, providing a more responsive UX.
 */
export async function chatStream(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const validatedBody = chatRequestSchema.parse(req.body);

    // Set up SSE headers
    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    });

    // Stream chunks to client
    for await (const event of streamChat(validatedBody)) {
      res.write(`data: ${JSON.stringify(event)}\n\n`);
    }

    res.end();
  } catch (error) {
    next(error);
  }
}
