# 📊 DocChart — RAG-Powered Document Q&A

DocChart is a full-stack Retrieval-Augmented Generation (RAG) application, heavily inspired by Google's NotebookLM. It allows users to upload PDF or TXT documents, parses their content into an AI vector database, and lets users ask questions with answers fully grounded in the uploaded materials.

![DocChart Preview placeholder — Imagine a beautiful dark mode UI with a sidebar and chat window]

## 🏗️ Architecture

DocChart relies on a modern AI stack to ensure high-quality answers with ZERO hallucinations.

### 🧠 How RAG Works
RAG (Retrieval-Augmented Generation) prevents LLM hallucination by restricting the AI’s knowledge base. 
1. The user asks a question.
2. The system searches the vector database for the most relevant document chunks.
3. These chunks are provided to the LLM in the "system prompt" alongside the user's question.
4. The LLM is instructed to answer *strictly* using the provided text.

### 🧩 Why Chunking is Needed
LLMs have context window limits. Supplying an entire 500-page PDF in a single prompt is expensive, slow, and reduces answer accuracy. By splitting documents into smaller chunks (e.g., 1000 characters) with overlap (e.g., 200 characters), we extract *only* the specific paragraphs needed to answer a question.

### 🧮 Why Embeddings & Vector Databases
Traditional SQL databases search by exact keyword match. Vector databases (like Qdrant) use "embeddings" — numerical representations of text meaning. This allows semantic search: asking "How to fix errors?" will successfully match a chunk discussing "debugging procedures", even if the exact words differ.

## 🛠️ Tech Stack

**Frontend:**
- React 18 + TypeScript
- Vite
- TailwindCSS v4 (Custom Dark Mode UI)
- Server-Sent Events (SSE) for streaming text

**Backend:**
- Node.js + Express + TypeScript
- LangChain (`@langchain/openai`, `@langchain/core`)
- OpenAI (`gpt-4.1-mini`, `text-embedding-3-large`)
- Vector Store: Qdrant
- PDF Parsing: `pdf-parse`

---

## 🚀 Local Setup & Installation

### 1. Prerequisites
- Node.js v18+
- Docker (for local Qdrant)
- OpenAI API Key

### 2. Start Local Vector Database (Qdrant)
Run Qdrant locally using Docker:
```bash
docker run -p 6333:6333 -p 6334:6334 \
    -v $(pwd)/qdrant_storage:/qdrant/storage:z \
    qdrant/qdrant
```

### 3. Backend Setup
```bash
cd backend
npm install

# Copy env template and add your OpenAI API Key
cp .env.example .env

# Start dev server
npm run dev
```

### 4. Frontend Setup
In a new terminal window:
```bash
cd frontend
npm install

# Start Vite server
npm run dev
```
Visit `http://localhost:5173` in your browser.

---

## ☁️ Deployment Guide

### Deploying Qdrant Database (Qdrant Cloud)
1. Go to [Qdrant Cloud](https://cloud.qdrant.io/) and create a free tier cluster.
2. Get the Cluster URL and API Key.
3. Update these in your Backend environment variables.

### Deploying the Backend (Render / Railway)
1. Push your code to GitHub.
2. Create a new Web Service on Render or Railway, pointing to the `backend` folder.
3. **Build Command:** `npm install && npm run build`
4. **Start Command:** `npm run start`
5. **Environment Variables Required:**
   - `OPENAI_API_KEY`
   - `QDRANT_URL` (from Qdrant Cloud)
   - `QDRANT_API_KEY`
   - `FRONTEND_URL` (your future Vercel URL)

### Deploying the Frontend (Vercel)
1. In `frontend/vite.config.ts`, remove the proxy config (proxy is only for local dev).
2. Point Vercel to your `frontend` folder.
3. **Build Command:** `npm run build`
4. **Environment Variables:**
   - Note: Make sure to hardcode your Render backend URL in `src/services/api.ts` (replace `/api` with `https://your-backend.onrender.com/api`) before deploying, or use a Vite env variable (`VITE_API_URL`).

---

## 🔌 API Documentation

### `POST /api/upload`
Uploads a document for processing.
- **Body:** `multipart/form-data` with `file` key (PDF or TXT)
- **Response:** `{ "message": "...", "documentId": "uuid", "totalChunks": 42 }`

### `POST /api/chat/stream`
Streams an answer using Server-Sent Events.
- **Body (JSON):**
  ```json
  {
    "question": "What is the main topic?",
    "documentId": "optional-uuid-to-filter"
  }
  ```

### `GET /api/documents`
Lists all uploaded documents.

### `DELETE /api/documents/:id`
Deletes a document and its vectors from Qdrant.
