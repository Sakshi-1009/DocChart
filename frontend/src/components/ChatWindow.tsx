/**
 * ChatWindow — Main conversational interface.
 */

import { useState, useRef, useEffect } from "react";
import type { ChatMessage } from "../types";
import MessageBubble from "./MessageBubble";
import { streamChatMessage, sendChatMessage } from "../services/api";

interface ChatWindowProps {
  messages: ChatMessage[];
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  activeDocumentId: string | null;
}

const SUGGESTIONS = [
  "Summarize the main points of this document",
  "What are the key takeaways?",
  "Find the section about...",
  "Explain this concept to me",
];

export default function ChatWindow({
  messages,
  setMessages,
  activeDocumentId,
}: ChatWindowProps) {
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    const history = messages.map((m) => ({ role: m.role, content: m.content }));
    const assistantId = crypto.randomUUID();

    setMessages((prev) => [
      ...prev,
      { id: assistantId, role: "assistant", content: "", timestamp: new Date(), isStreaming: true },
    ]);

    try {
      await streamChatMessage(
        userMessage.content,
        activeDocumentId || undefined,
        history,
        (text) => {
          setMessages((prev) =>
            prev.map((m) => m.id === assistantId ? { ...m, content: m.content + text } : m)
          );
        },
        (sources) => {
          setMessages((prev) =>
            prev.map((m) => m.id === assistantId ? { ...m, sources } : m)
          );
        },
        () => {
          setMessages((prev) =>
            prev.map((m) => m.id === assistantId ? { ...m, isStreaming: false } : m)
          );
          setIsLoading(false);
          setTimeout(() => inputRef.current?.focus(), 10);
        }
      );
    } catch (err) {
      console.error("Streaming failed, falling back to standard API:", err);
      try {
        const response = await sendChatMessage(
          userMessage.content,
          activeDocumentId || undefined,
          history
        );
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? { ...m, content: response.answer, sources: response.sources, isStreaming: false }
              : m
          )
        );
      } catch (fallbackErr) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? { ...m, content: "Sorry, I encountered an error while processing your request.", isStreaming: false }
              : m
          )
        );
      } finally {
        setIsLoading(false);
        setTimeout(() => inputRef.current?.focus(), 10);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const canSend = input.trim() && !isLoading;

  return (
    <div style={{
      flex: 1,
      display: "flex",
      flexDirection: "column",
      height: "100vh",
      background: "linear-gradient(160deg, #07070f 0%, #0a0a18 50%, #07070f 100%)",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Background ambient glow */}
      <div style={{
        position: "absolute",
        top: "20%",
        right: "10%",
        width: "500px",
        height: "500px",
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(124,58,237,0.04) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      {/* Header */}
      <header style={{
        height: "64px",
        padding: "0 28px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        borderBottom: "1px solid rgba(124, 58, 237, 0.12)",
        background: "rgba(7, 7, 15, 0.8)",
        backdropFilter: "blur(20px)",
        flexShrink: 0,
        position: "relative",
        zIndex: 5,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{
            width: "8px",
            height: "8px",
            borderRadius: "50%",
            background: activeDocumentId
              ? "linear-gradient(135deg, #7c3aed, #a855f7)"
              : "linear-gradient(135deg, #34d399, #10b981)",
            boxShadow: activeDocumentId
              ? "0 0 10px rgba(124, 58, 237, 0.6)"
              : "0 0 10px rgba(52, 211, 153, 0.6)",
          }} />
          <h2 style={{
            fontSize: "15px",
            fontWeight: "700",
            color: "#eeeef5",
            letterSpacing: "-0.2px",
          }}>
            {activeDocumentId ? "Document Q&A" : "Global Q&A — All Documents"}
          </h2>
        </div>

        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          padding: "5px 12px",
          borderRadius: "20px",
          background: "rgba(52, 211, 153, 0.08)",
          border: "1px solid rgba(52, 211, 153, 0.2)",
        }}>
          <span style={{
            width: "6px",
            height: "6px",
            borderRadius: "50%",
            background: "#34d399",
            boxShadow: "0 0 8px #34d399",
            animation: "pulse-glow 2s ease-in-out infinite",
            display: "inline-block",
          }} />
          <span style={{ fontSize: "11px", fontWeight: "600", color: "#34d399", letterSpacing: "0.5px" }}>
            AI Ready
          </span>
        </div>
      </header>

      {/* Chat Area */}
      <div style={{ flex: 1, overflowY: "auto", padding: "24px 20px", position: "relative", zIndex: 1 }}>
        <div style={{ maxWidth: "800px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "20px" }}>

          {messages.length === 0 ? (
            <div className="animate-fade-in-up" style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              minHeight: "55vh",
              textAlign: "center",
              padding: "32px 16px",
            }}>
              {/* Icon */}
              <div style={{
                width: "72px",
                height: "72px",
                borderRadius: "24px",
                background: "linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)",
                boxShadow: "0 0 50px rgba(124, 58, 237, 0.4), inset 0 1px 0 rgba(255,255,255,0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "24px",
                animation: "float 3s ease-in-out infinite",
              }}>
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                </svg>
              </div>

              <h2 style={{
                fontSize: "26px",
                fontWeight: "800",
                color: "#eeeef5",
                letterSpacing: "-0.5px",
                marginBottom: "10px",
              }}>
                How can I help you today?
              </h2>
              <p style={{
                fontSize: "14px",
                color: "#9898b8",
                maxWidth: "420px",
                lineHeight: 1.7,
                marginBottom: "36px",
              }}>
                Ask me anything about your uploaded documents. I'll find answers backed by exact citations from the source.
              </p>

              {/* Suggestion Cards */}
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
                gap: "10px",
                maxWidth: "620px",
                width: "100%",
              }}>
                {SUGGESTIONS.map((suggestion, i) => (
                  <button
                    key={i}
                    onClick={() => setInput(suggestion)}
                    style={{
                      padding: "13px 16px",
                      textAlign: "left",
                      borderRadius: "12px",
                      border: "1px solid rgba(124, 58, 237, 0.2)",
                      background: "rgba(124, 58, 237, 0.06)",
                      color: "#9898b8",
                      fontSize: "12.5px",
                      fontWeight: "500",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                      lineHeight: 1.5,
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "8px",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "rgba(124, 58, 237, 0.12)";
                      e.currentTarget.style.border = "1px solid rgba(124, 58, 237, 0.4)";
                      e.currentTarget.style.color = "#eeeef5";
                      e.currentTarget.style.transform = "translateY(-1px)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "rgba(124, 58, 237, 0.06)";
                      e.currentTarget.style.border = "1px solid rgba(124, 58, 237, 0.2)";
                      e.currentTarget.style.color = "#9898b8";
                      e.currentTarget.style.transform = "translateY(0)";
                    }}
                  >
                    <span style={{
                      color: "#7c3aed",
                      fontSize: "14px",
                      marginTop: "1px",
                      flexShrink: 0,
                    }}>✦</span>
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} />
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div style={{
        padding: "16px 20px 20px",
        background: "rgba(7, 7, 15, 0.9)",
        backdropFilter: "blur(20px)",
        borderTop: "1px solid rgba(124, 58, 237, 0.1)",
        flexShrink: 0,
        position: "relative",
        zIndex: 5,
      }}>
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
          <form
            onSubmit={handleSubmit}
            style={{
              display: "flex",
              alignItems: "flex-end",
              gap: "10px",
              padding: "10px 14px",
              borderRadius: "16px",
              background: "rgba(18, 18, 42, 0.9)",
              border: `1px solid ${canSend ? "rgba(124, 58, 237, 0.5)" : "rgba(30, 30, 61, 0.8)"}`,
              boxShadow: canSend
                ? "0 0 0 3px rgba(124, 58, 237, 0.08), 0 8px 32px rgba(0,0,0,0.3)"
                : "0 8px 32px rgba(0,0,0,0.3)",
              transition: "all 0.25s ease",
            }}
          >
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask a question about your documents..."
              rows={input.split("\n").length > 1 ? Math.min(input.split("\n").length, 5) : 1}
              style={{
                flex: 1,
                maxHeight: "128px",
                minHeight: "44px",
                padding: "10px 4px",
                background: "transparent",
                border: "none",
                outline: "none",
                resize: "none",
                color: "#eeeef5",
                fontSize: "14.5px",
                lineHeight: "1.6",
                fontFamily: "inherit",
              }}
            />

            <button
              type="submit"
              disabled={!canSend}
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "12px",
                border: "none",
                background: canSend
                  ? "linear-gradient(135deg, #7c3aed, #9333ea)"
                  : "rgba(30, 30, 61, 1)",
                boxShadow: canSend ? "0 4px 16px rgba(124, 58, 237, 0.4)" : "none",
                color: canSend ? "white" : "#55557a",
                cursor: canSend ? "pointer" : "not-allowed",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                transition: "all 0.2s ease",
                transform: canSend ? "scale(1)" : "scale(0.95)",
              }}
              onMouseEnter={(e) => {
                if (canSend) {
                  e.currentTarget.style.transform = "scale(1.08)";
                  e.currentTarget.style.boxShadow = "0 6px 24px rgba(124, 58, 237, 0.55)";
                }
              }}
              onMouseLeave={(e) => {
                if (canSend) {
                  e.currentTarget.style.transform = "scale(1)";
                  e.currentTarget.style.boxShadow = "0 4px 16px rgba(124, 58, 237, 0.4)";
                }
              }}
            >
              {isLoading ? (
                <div style={{
                  width: "16px",
                  height: "16px",
                  borderRadius: "50%",
                  border: "2px solid rgba(255,255,255,0.3)",
                  borderTopColor: "white",
                  animation: "spin 0.8s linear infinite",
                }} />
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              )}
            </button>
          </form>

          <p style={{
            textAlign: "center",
            fontSize: "10px",
            color: "#55557a",
            marginTop: "8px",
            letterSpacing: "0.3px",
          }}>
            Press <kbd style={{
              background: "rgba(124,58,237,0.1)",
              border: "1px solid rgba(124,58,237,0.2)",
              borderRadius: "4px",
              padding: "0 4px",
              fontSize: "9px",
              color: "#9898b8",
            }}>Enter</kbd> to send &nbsp;·&nbsp; <kbd style={{
              background: "rgba(124,58,237,0.1)",
              border: "1px solid rgba(124,58,237,0.2)",
              borderRadius: "4px",
              padding: "0 4px",
              fontSize: "9px",
              color: "#9898b8",
            }}>Shift+Enter</kbd> for new line &nbsp;·&nbsp; AI may make mistakes — verify with source citations
          </p>
        </div>
      </div>
    </div>
  );
}
