/**
 * API Service — Handles all HTTP communication with the backend.
 */

import type {
  UploadResponse,
  ChatResponse,
  DocumentRecord,
  SourceChunk,
  ChatMessage,
  StreamEvent,
} from "../types";

const API_BASE = "/api";

/**
 * Upload a file to the backend for processing.
 */
export async function uploadFile(
  file: File,
  onProgress?: (percent: number) => void
): Promise<UploadResponse> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    formData.append("file", file);

    // Track upload progress
    xhr.upload.addEventListener("progress", (e) => {
      if (e.lengthComputable && onProgress) {
        const percent = Math.round((e.loaded / e.total) * 100);
        onProgress(percent);
      }
    });

    xhr.addEventListener("load", () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(JSON.parse(xhr.responseText));
      } else {
        const errBody = JSON.parse(xhr.responseText);
        reject(new Error(errBody.error || "Upload failed"));
      }
    });

    xhr.addEventListener("error", () => reject(new Error("Network error during upload")));
    xhr.addEventListener("abort", () => reject(new Error("Upload cancelled")));

    xhr.open("POST", `${API_BASE}/upload`);
    xhr.send(formData);
  });
}

/**
 * Send a chat question and get a response (non-streaming).
 */
export async function sendChatMessage(
  question: string,
  documentId?: string,
  history?: { role: string; content: string }[]
): Promise<ChatResponse> {
  const res = await fetch(`${API_BASE}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question, documentId, history }),
  });

  if (!res.ok) {
    const errBody = await res.json();
    throw new Error(errBody.error || "Chat request failed");
  }

  return res.json();
}

/**
 * Send a chat question and stream the response via SSE.
 */
export async function streamChatMessage(
  question: string,
  documentId?: string,
  history?: { role: string; content: string }[],
  onChunk?: (text: string) => void,
  onSources?: (sources: SourceChunk[]) => void,
  onDone?: () => void
): Promise<void> {
  const res = await fetch(`${API_BASE}/chat/stream`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question, documentId, history }),
  });

  if (!res.ok) {
    const errBody = await res.json();
    throw new Error(errBody.error || "Chat stream failed");
  }

  const reader = res.body?.getReader();
  if (!reader) throw new Error("No response body");

  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });

    // Parse SSE events from buffer
    const lines = buffer.split("\n");
    buffer = lines.pop() || ""; // Keep incomplete line in buffer

    for (const line of lines) {
      if (line.startsWith("data: ")) {
        try {
          const event: StreamEvent = JSON.parse(line.slice(6));

          switch (event.type) {
            case "chunk":
              onChunk?.(event.data);
              break;
            case "sources":
              onSources?.(JSON.parse(event.data));
              break;
            case "done":
              onDone?.();
              break;
          }
        } catch {
          // Skip malformed events
        }
      }
    }
  }

  onDone?.();
}

/**
 * Get all uploaded documents.
 */
export async function getDocuments(): Promise<DocumentRecord[]> {
  const res = await fetch(`${API_BASE}/documents`);
  if (!res.ok) throw new Error("Failed to fetch documents");
  const data = await res.json();
  return data.documents;
}

/**
 * Delete a document.
 */
export async function deleteDocument(documentId: string): Promise<void> {
  const res = await fetch(`${API_BASE}/documents/${documentId}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    const errBody = await res.json();
    throw new Error(errBody.error || "Delete failed");
  }
}
