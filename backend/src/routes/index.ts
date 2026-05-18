/**
 * API Routes — Maps endpoints to controllers.
 */

import { Router } from "express";
import { upload } from "../middleware/upload";
import {
  uploadDocument,
  listDocuments,
  getDocumentById,
  deleteDocumentById,
} from "../controllers/documentController";
import { chat, chatStream } from "../controllers/chatController";

const router = Router();

// ─── Document Routes ──────────────────────────────────────
router.post("/upload", upload.single("file"), uploadDocument);
router.get("/documents", listDocuments);
router.get("/documents/:id", getDocumentById);
router.delete("/documents/:id", deleteDocumentById);

// ─── Chat Routes ──────────────────────────────────────────
router.post("/chat", chat);
router.post("/chat/stream", chatStream);

// ─── Health Check ─────────────────────────────────────────
router.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

export default router;
