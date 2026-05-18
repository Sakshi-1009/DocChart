/**
 * Sidebar — Shows uploaded documents and branding.
 */

import { useState } from "react";
import type { DocumentRecord } from "../types";

interface SidebarProps {
  documents: DocumentRecord[];
  activeDocumentId: string | null;
  onSelectDocument: (id: string | null) => void;
  onDeleteDocument: (id: string) => void;
  onUploadClick: () => void;
}

export default function Sidebar({
  documents,
  activeDocumentId,
  onSelectDocument,
  onDeleteDocument,
  onUploadClick,
}: SidebarProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <aside
      style={{
        width: "280px",
        minWidth: "280px",
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        background: "linear-gradient(180deg, #0a0a18 0%, #0d0d1f 100%)",
        borderRight: "1px solid rgba(124, 58, 237, 0.15)",
        position: "relative",
        zIndex: 10,
      }}
    >
      {/* Ambient glow top-left */}
      <div
        style={{
          position: "absolute",
          top: "-60px",
          left: "-60px",
          width: "220px",
          height: "220px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      {/* Logo / Brand */}
      <div
        style={{
          padding: "24px 20px 20px",
          borderBottom: "1px solid rgba(124, 58, 237, 0.1)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "12px",
              background: "linear-gradient(135deg, #7c3aed, #a855f7)",
              boxShadow: "0 0 24px rgba(124, 58, 237, 0.5), inset 0 1px 0 rgba(255,255,255,0.15)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "14px",
              fontWeight: "800",
              color: "white",
              letterSpacing: "-0.5px",
              flexShrink: 0,
            }}
          >
            DC
          </div>
          <div>
            <h1
              style={{
                fontSize: "18px",
                fontWeight: "800",
                color: "#eeeef5",
                letterSpacing: "-0.5px",
                lineHeight: 1.2,
              }}
            >
              DocChart
            </h1>
            <p
              style={{
                fontSize: "9px",
                color: "#55557a",
                textTransform: "uppercase",
                letterSpacing: "2px",
                fontWeight: "600",
                marginTop: "2px",
              }}
            >
              RAG-Powered Q&A
            </p>
          </div>
        </div>
      </div>

      {/* Upload Button */}
      <div style={{ padding: "16px" }}>
        <button
          onClick={onUploadClick}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            padding: "11px 16px",
            borderRadius: "12px",
            border: "none",
            background: "linear-gradient(135deg, #7c3aed 0%, #9333ea 100%)",
            boxShadow: "0 4px 20px rgba(124, 58, 237, 0.35), inset 0 1px 0 rgba(255,255,255,0.12)",
            color: "white",
            fontSize: "13.5px",
            fontWeight: "600",
            cursor: "pointer",
            transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
            letterSpacing: "0.2px",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow = "0 8px 30px rgba(124, 58, 237, 0.5), inset 0 1px 0 rgba(255,255,255,0.15)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 4px 20px rgba(124, 58, 237, 0.35), inset 0 1px 0 rgba(255,255,255,0.12)";
          }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          Upload Document
        </button>
      </div>

      {/* Documents Section Label */}
      <div style={{ padding: "4px 20px 8px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <p style={{
            fontSize: "10px",
            textTransform: "uppercase",
            letterSpacing: "1.5px",
            color: "#55557a",
            fontWeight: "700",
          }}>
            Library
          </p>
          <div style={{
            background: "rgba(124, 58, 237, 0.2)",
            color: "#c4b5fd",
            fontSize: "9px",
            fontWeight: "700",
            padding: "1px 7px",
            borderRadius: "20px",
            border: "1px solid rgba(124, 58, 237, 0.3)",
          }}>
            {documents.length}
          </div>
        </div>
      </div>

      {/* Documents List */}
      <div style={{ flex: 1, overflowY: "auto", padding: "0 10px" }}>
        {documents.length === 0 ? (
          <div
            style={{
              padding: "36px 16px",
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <div
              style={{
                width: "52px",
                height: "52px",
                borderRadius: "16px",
                background: "rgba(124, 58, 237, 0.08)",
                border: "1px dashed rgba(124, 58, 237, 0.25)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "22px",
              }}
            >
              📄
            </div>
            <p style={{ fontSize: "12px", color: "#55557a", lineHeight: 1.6 }}>
              No documents yet.
              <br />
              <span style={{ color: "#9898b8" }}>Upload a PDF or TXT to begin.</span>
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
            {/* All Documents option */}
            <button
              onClick={() => onSelectDocument(null)}
              style={{
                width: "100%",
                textAlign: "left",
                padding: "10px 12px",
                borderRadius: "10px",
                border: activeDocumentId === null ? "1px solid rgba(124, 58, 237, 0.35)" : "1px solid transparent",
                background: activeDocumentId === null
                  ? "linear-gradient(135deg, rgba(124,58,237,0.15) 0%, rgba(168,85,247,0.08) 100%)"
                  : "transparent",
                cursor: "pointer",
                transition: "all 0.15s ease",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                marginBottom: "4px",
              }}
              onMouseEnter={(e) => {
                if (activeDocumentId !== null) {
                  e.currentTarget.style.background = "rgba(124, 58, 237, 0.07)";
                  e.currentTarget.style.border = "1px solid rgba(124, 58, 237, 0.15)";
                }
              }}
              onMouseLeave={(e) => {
                if (activeDocumentId !== null) {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.border = "1px solid transparent";
                }
              }}
            >
              <span style={{ fontSize: "16px", lineHeight: 1 }}>📚</span>
              <span style={{
                fontSize: "13px",
                fontWeight: "600",
                color: activeDocumentId === null ? "#c4b5fd" : "#9898b8",
              }}>
                All Documents
              </span>
            </button>

            {documents.map((doc) => (
              <div
                key={doc.documentId}
                style={{
                  position: "relative",
                  borderRadius: "10px",
                  border: activeDocumentId === doc.documentId
                    ? "1px solid rgba(124, 58, 237, 0.35)"
                    : "1px solid transparent",
                  background: activeDocumentId === doc.documentId
                    ? "linear-gradient(135deg, rgba(124,58,237,0.15) 0%, rgba(168,85,247,0.08) 100%)"
                    : hoveredId === doc.documentId
                      ? "rgba(124, 58, 237, 0.07)"
                      : "transparent",
                  transition: "all 0.15s ease",
                }}
                onMouseEnter={() => setHoveredId(doc.documentId)}
                onMouseLeave={() => setHoveredId(null)}
              >
                <button
                  onClick={() => onSelectDocument(doc.documentId)}
                  style={{
                    width: "100%",
                    textAlign: "left",
                    padding: "10px 12px",
                    paddingRight: hoveredId === doc.documentId ? "40px" : "12px",
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    transition: "padding 0.15s ease",
                  }}
                >
                  <span style={{ fontSize: "15px", lineHeight: 1, flexShrink: 0 }}>
                    {doc.filename.endsWith(".pdf") ? "📕" : "📝"}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{
                      fontSize: "12.5px",
                      fontWeight: "600",
                      color: activeDocumentId === doc.documentId ? "#c4b5fd" : "#eeeef5",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}>
                      {doc.filename}
                    </p>
                    <p style={{ fontSize: "10px", color: "#55557a", marginTop: "1px" }}>
                      {doc.totalChunks} chunks
                    </p>
                  </div>
                </button>

                {/* Delete button */}
                {hoveredId === doc.documentId && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteDocument(doc.documentId);
                    }}
                    style={{
                      position: "absolute",
                      right: "8px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      padding: "5px",
                      borderRadius: "7px",
                      border: "none",
                      background: "rgba(248, 113, 113, 0.1)",
                      color: "#f87171",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "all 0.15s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "rgba(248, 113, 113, 0.2)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "rgba(248, 113, 113, 0.1)";
                    }}
                    title="Delete document"
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                    </svg>
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div
        style={{
          padding: "14px 20px",
          borderTop: "1px solid rgba(124, 58, 237, 0.1)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "6px",
        }}
      >
        <div
          style={{
            width: "6px",
            height: "6px",
            borderRadius: "50%",
            background: "#34d399",
            boxShadow: "0 0 8px #34d399",
            animation: "pulse-glow 2s ease-in-out infinite",
          }}
        />
        <p style={{ fontSize: "10px", color: "#55557a", letterSpacing: "0.5px" }}>
          Powered by Groq + Qdrant
        </p>
      </div>
    </aside>
  );
}
