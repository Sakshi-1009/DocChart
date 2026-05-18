import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import ChatWindow from "../components/ChatWindow";
import FileUpload from "../components/FileUpload";
import { getDocuments, deleteDocument } from "../services/api";
import type { DocumentRecord, ChatMessage } from "../types";

export default function App() {
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [activeDocumentId, setActiveDocumentId] = useState<string | null>(null);
  const [showUpload, setShowUpload] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Maintain separate chat histories for each document (or global)
  // Using an object where keys are document IDs (or 'global' for null)
  const [chatHistories, setChatHistories] = useState<Record<string, ChatMessage[]>>({
    global: [],
  });

  // Current active chat history
  const activeChatId = activeDocumentId || "global";
  const messages = chatHistories[activeChatId] || [];

  // Update messages for current active chat
  const setMessages = (
    value: React.SetStateAction<ChatMessage[]>
  ) => {
    setChatHistories((prev) => {
      const currentMessages = prev[activeChatId] || [];
      const newMessages =
        typeof value === "function" ? value(currentMessages) : value;

      return {
        ...prev,
        [activeChatId]: newMessages,
      };
    });
  };

  const loadDocuments = async () => {
    try {
      const docs = await getDocuments();
      setDocuments(docs);
    } catch (err) {
      console.error("Failed to load documents:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await deleteDocument(id);
      setDocuments((prev) => prev.filter((d) => d.documentId !== id));
      
      // If deleting the active document, switch back to global
      if (activeDocumentId === id) {
        setActiveDocumentId(null);
      }
      
      // Clear chat history for deleted document
      setChatHistories((prev) => {
        const newHistories = { ...prev };
        delete newHistories[id];
        return newHistories;
      });
    } catch (err) {
      console.error("Failed to delete document:", err);
      alert("Failed to delete document. See console for details.");
    }
  };

  if (isLoading) {
    return (
      <div style={{
        minHeight: "100vh",
        background: "linear-gradient(160deg, #07070f 0%, #0a0a18 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: "20px",
      }}>
        <div style={{
          width: "56px",
          height: "56px",
          borderRadius: "16px",
          background: "linear-gradient(135deg, #7c3aed, #a855f7)",
          boxShadow: "0 0 40px rgba(124, 58, 237, 0.4)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "20px",
          fontWeight: "800",
          color: "white",
          animation: "pulse-glow 2s ease-in-out infinite",
        }}>
          DC
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
          <div style={{
            width: "36px",
            height: "36px",
            borderRadius: "50%",
            border: "3px solid rgba(124, 58, 237, 0.2)",
            borderTopColor: "#7c3aed",
            animation: "spin 0.8s linear infinite",
          }} />
          <p style={{ fontSize: "13px", color: "#9898b8", fontWeight: "500", letterSpacing: "0.5px" }}>
            Loading DocChart...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      display: "flex",
      height: "100vh",
      width: "100%",
      background: "#07070f",
      overflow: "hidden",
    }}>
      {/* Left Sidebar */}
      <Sidebar
        documents={documents}
        activeDocumentId={activeDocumentId}
        onSelectDocument={setActiveDocumentId}
        onDeleteDocument={handleDelete}
        onUploadClick={() => setShowUpload(true)}
      />

      {/* Main Chat Area */}
      <ChatWindow
        messages={messages}
        setMessages={setMessages}
        activeDocumentId={activeDocumentId}
      />

      {/* Upload Modal Overlay */}
      {showUpload && (
        <FileUpload
          onClose={() => setShowUpload(false)}
          onUploadComplete={(res) => {
            loadDocuments();
            setActiveDocumentId(res.documentId);
          }}
        />
      )}
    </div>
  );
}
