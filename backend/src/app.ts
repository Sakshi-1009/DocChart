/**
 * DocChart Backend — Express Application Entry Point
 *
 * This is the main server file that:
 * 1. Loads environment variables
 * 2. Configures Express middleware (CORS, JSON parsing, logging)
 * 3. Registers API routes
 * 4. Initializes the Qdrant vector store collection
 * 5. Starts listening for requests
 */

import express from "express";
import cors from "cors";
import morgan from "morgan";
import path from "path";
import fs from "fs";
import { config } from "./config";
import routes from "./routes";
import { errorHandler } from "./middleware/errorHandler";
import { ensureCollection } from "./vectorstore";

const app = express();

// ─── Middleware ────────────────────────────────────────────
app.use(
  cors({
    origin: config.frontendUrl,
    credentials: true,
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev")); // HTTP request logging

// ─── Ensure uploads directory exists ──────────────────────
const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// ─── API Routes ───────────────────────────────────────────
app.use("/api", routes);

// ─── Error Handler (must be last) ─────────────────────────
app.use(errorHandler);

// ─── Server Startup ───────────────────────────────────────
async function startServer() {
  try {
    // Initialize Qdrant collection before accepting requests
    await ensureCollection();

    app.listen(config.port, () => {
      console.log(`
╔═══════════════════════════════════════════════╗
║                                               ║
║   📊 DocChart Backend Server                  ║
║                                               ║
║   🌐 URL:     http://localhost:${config.port}         ║
║   📦 Qdrant:  ${config.qdrantUrl}    ║
║   🤖 Model:   ${config.chatModel}               ║
║   📐 Embed:   ${config.embeddingModel}    ║
║                                               ║
║   Ready to process documents! 🚀              ║
║                                               ║
╚═══════════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
}

startServer();

export default app;
