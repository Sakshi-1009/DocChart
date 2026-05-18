/**
 * FileUpload — Drag-and-drop file upload component with progress indicator.
 */

import { useState, useRef, useCallback } from "react";
import { uploadFile } from "../services/api";
import type { UploadResponse } from "../types";

interface FileUploadProps {
  onUploadComplete: (response: UploadResponse) => void;
  onClose: () => void;
}

export default function FileUpload({ onUploadComplete, onClose }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [stage, setStage] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    async (file: File) => {
      const ext = file.name.split(".").pop()?.toLowerCase();
      if (ext !== "pdf" && ext !== "txt") {
        setError("Only PDF and TXT files are supported.");
        return;
      }
      if (file.size > 20 * 1024 * 1024) {
        setError("File is too large. Maximum size is 20MB.");
        return;
      }

      setError(null);
      setIsUploading(true);
      setProgress(0);
      setStage("Uploading...");

      try {
        const response = await uploadFile(file, (percent) => {
          setProgress(percent);
          setStage(percent < 100 ? "Uploading..." : "Processing document...");
        });
        setStage("Complete!");
        setProgress(100);
        setTimeout(() => {
          onUploadComplete(response);
          onClose();
        }, 800);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Upload failed");
        setIsUploading(false);
      }
    },
    [onUploadComplete, onClose]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = () => setIsDragging(false);
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <div
      className="animate-fade-in"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
        background: "rgba(7, 7, 15, 0.85)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="animate-fade-in-up"
        style={{
          position: "relative",
          width: "100%",
          maxWidth: "460px",
          borderRadius: "20px",
          padding: "32px",
          background: "linear-gradient(135deg, #0d0d1f 0%, #0a0a18 100%)",
          border: "1px solid rgba(124, 58, 237, 0.25)",
          boxShadow: "0 30px 80px rgba(0, 0, 0, 0.6), 0 0 60px rgba(124, 58, 237, 0.08)",
        }}
      >
        {/* Top ambient glow */}
        <div style={{
          position: "absolute",
          top: 0,
          left: "50%",
          transform: "translateX(-50%)",
          width: "200px",
          height: "2px",
          background: "linear-gradient(90deg, transparent, rgba(124,58,237,0.6), transparent)",
          borderRadius: "2px",
        }} />

        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "16px",
            right: "16px",
            width: "32px",
            height: "32px",
            borderRadius: "10px",
            border: "1px solid rgba(124, 58, 237, 0.15)",
            background: "rgba(124, 58, 237, 0.05)",
            color: "#55557a",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.15s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "#eeeef5";
            e.currentTarget.style.background = "rgba(124, 58, 237, 0.12)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "#55557a";
            e.currentTarget.style.background = "rgba(124, 58, 237, 0.05)";
          }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {/* Header */}
        <div style={{ marginBottom: "24px" }}>
          <div style={{
            width: "48px",
            height: "48px",
            borderRadius: "14px",
            background: "linear-gradient(135deg, #7c3aed, #a855f7)",
            boxShadow: "0 0 30px rgba(124, 58, 237, 0.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "16px",
          }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
          </div>
          <h2 style={{
            fontSize: "20px",
            fontWeight: "800",
            color: "#eeeef5",
            letterSpacing: "-0.4px",
            marginBottom: "5px",
          }}>
            Upload Document
          </h2>
          <p style={{ fontSize: "13px", color: "#9898b8", lineHeight: 1.5 }}>
            Upload a PDF or TXT file to start asking questions about its content.
          </p>
        </div>

        {/* Drop Zone */}
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
          style={{
            position: "relative",
            borderRadius: "14px",
            border: `2px dashed ${isDragging ? "#7c3aed" : "rgba(124, 58, 237, 0.25)"}`,
            padding: "36px 20px",
            textAlign: "center",
            cursor: "pointer",
            background: isDragging
              ? "rgba(124, 58, 237, 0.08)"
              : "rgba(124, 58, 237, 0.03)",
            transition: "all 0.2s ease",
            animation: isDragging ? "borderPulse 1s ease-in-out infinite" : "none",
          }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.txt"
            onChange={handleInputChange}
            style={{ display: "none" }}
          />

          {isUploading ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "14px" }}>
              {/* Spinner */}
              <div style={{
                width: "48px",
                height: "48px",
                borderRadius: "50%",
                border: "3px solid rgba(124, 58, 237, 0.2)",
                borderTopColor: "#7c3aed",
                animation: "spin 0.8s linear infinite",
              }} />
              <p style={{ fontSize: "14px", fontWeight: "600", color: "#eeeef5" }}>{stage}</p>
              {/* Progress Bar */}
              <div style={{
                width: "100%",
                maxWidth: "260px",
                height: "5px",
                borderRadius: "10px",
                background: "rgba(124, 58, 237, 0.12)",
                overflow: "hidden",
              }}>
                <div style={{
                  height: "100%",
                  borderRadius: "10px",
                  background: "linear-gradient(90deg, #7c3aed, #a855f7, #c084fc)",
                  width: `${progress}%`,
                  transition: "width 0.3s ease",
                  boxShadow: "0 0 10px rgba(124, 58, 237, 0.5)",
                }} />
              </div>
              <p style={{ fontSize: "11px", color: "#55557a", fontWeight: "600" }}>{progress}%</p>
            </div>
          ) : (
            <>
              <div style={{
                fontSize: "44px",
                marginBottom: "14px",
                animation: isDragging ? "float 0.6s ease-in-out infinite" : "none",
                display: "inline-block",
              }}>
                {isDragging ? "📥" : "📄"}
              </div>
              <p style={{ fontSize: "14px", fontWeight: "600", color: "#eeeef5", marginBottom: "5px" }}>
                {isDragging ? "Drop your file here!" : "Drag & drop a file here"}
              </p>
              <p style={{ fontSize: "12px", color: "#55557a" }}>
                or{" "}
                <span style={{ color: "#c4b5fd", fontWeight: "600" }}>click to browse</span>
                {" "}· PDF, TXT up to 20MB
              </p>
            </>
          )}
        </div>

        {/* Supported formats */}
        {!isUploading && (
          <div style={{ display: "flex", gap: "8px", marginTop: "14px", justifyContent: "center" }}>
            {["PDF", "TXT"].map((fmt) => (
              <span key={fmt} style={{
                padding: "3px 10px",
                borderRadius: "6px",
                background: "rgba(124, 58, 237, 0.08)",
                border: "1px solid rgba(124, 58, 237, 0.2)",
                fontSize: "10px",
                fontWeight: "700",
                color: "#9898b8",
                letterSpacing: "1px",
              }}>
                {fmt}
              </span>
            ))}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="animate-fade-in" style={{
            marginTop: "14px",
            padding: "10px 14px",
            borderRadius: "10px",
            background: "rgba(248, 113, 113, 0.08)",
            border: "1px solid rgba(248, 113, 113, 0.25)",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2.5">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <p style={{ fontSize: "12.5px", color: "#f87171" }}>{error}</p>
          </div>
        )}
      </div>
    </div>
  );
}
