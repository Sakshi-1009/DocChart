/**
 * SourceViewer — Displays retrieved source chunks with relevance scores.
 * Mimics NotebookLM's source citation panel.
 */

import { useState } from "react";
import type { SourceChunk } from "../types";

interface SourceViewerProps {
  sources: SourceChunk[];
}

export default function SourceViewer({ sources }: SourceViewerProps) {
  const [expanded, setExpanded] = useState<number | null>(null);

  if (sources.length === 0) return null;

  return (
    <div className="animate-fade-in" style={{ marginTop: "10px" }}>
      {/* Label */}
      <div style={{ display: "flex", alignItems: "center", gap: "7px", marginBottom: "8px" }}>
        <div style={{
          width: "18px",
          height: "18px",
          borderRadius: "6px",
          background: "rgba(124, 58, 237, 0.15)",
          border: "1px solid rgba(124, 58, 237, 0.3)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#c4b5fd" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
            <polyline points="14 2 14 8 20 8" />
          </svg>
        </div>
        <span style={{
          fontSize: "10px",
          fontWeight: "700",
          color: "#c4b5fd",
          textTransform: "uppercase",
          letterSpacing: "1.2px",
        }}>
          Sources · {sources.length}
        </span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        {sources.map((source, i) => {
          const isExpanded = expanded === i;
          const relevance = Math.round(source.score * 100);
          const relevanceColor =
            relevance >= 80 ? "#34d399" :
            relevance >= 60 ? "#fbbf24" : "#55557a";

          return (
            <div
              key={i}
              style={{
                borderRadius: "10px",
                border: `1px solid ${isExpanded ? "rgba(124, 58, 237, 0.3)" : "rgba(30, 30, 61, 0.8)"}`,
                background: isExpanded
                  ? "rgba(124, 58, 237, 0.06)"
                  : "rgba(12, 12, 30, 0.7)",
                overflow: "hidden",
                transition: "all 0.2s ease",
              }}
            >
              {/* Header */}
              <button
                onClick={() => setExpanded(isExpanded ? null : i)}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "9px 12px",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "background 0.15s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(124, 58, 237, 0.06)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px", minWidth: 0, flex: 1 }}>
                  <span style={{
                    fontSize: "10px",
                    fontWeight: "800",
                    color: "#7c3aed",
                    fontFamily: "JetBrains Mono, monospace",
                    background: "rgba(124, 58, 237, 0.12)",
                    padding: "1px 6px",
                    borderRadius: "4px",
                    border: "1px solid rgba(124, 58, 237, 0.2)",
                    flexShrink: 0,
                  }}>
                    #{i + 1}
                  </span>
                  <span style={{
                    fontSize: "11.5px",
                    color: "#9898b8",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}>
                    {source.filename}
                  </span>
                  <span style={{ fontSize: "10px", color: "#55557a", flexShrink: 0 }}>
                    p.{source.pageNumber}
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0, marginLeft: "8px" }}>
                  <span style={{
                    fontSize: "10px",
                    fontWeight: "700",
                    padding: "2px 7px",
                    borderRadius: "20px",
                    color: relevanceColor,
                    background: `${relevanceColor}18`,
                    border: `1px solid ${relevanceColor}30`,
                  }}>
                    {relevance}%
                  </span>
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#55557a"
                    strokeWidth="2.5"
                    style={{
                      transition: "transform 0.2s ease",
                      transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
                      flexShrink: 0,
                    }}
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </div>
              </button>

              {/* Expandable content */}
              {isExpanded && (
                <div className="animate-fade-in" style={{ padding: "0 12px 12px" }}>
                  <div style={{
                    borderTop: "1px solid rgba(124, 58, 237, 0.15)",
                    paddingTop: "10px",
                  }}>
                    <p style={{
                      fontSize: "12px",
                      color: "#9898b8",
                      lineHeight: 1.7,
                      whiteSpace: "pre-wrap",
                    }}>
                      {source.content}
                    </p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
