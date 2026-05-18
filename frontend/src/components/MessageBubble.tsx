/**
 * MessageBubble — Renders a single chat message (user or assistant).
 */

import type { ChatMessage } from "../types";
import SourceViewer from "./SourceViewer";
import TypingIndicator from "./TypingIndicator";

interface MessageBubbleProps {
  message: ChatMessage;
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user";

  return (
    <div
      className="animate-fade-in-up"
      style={{
        display: "flex",
        gap: "12px",
        justifyContent: isUser ? "flex-end" : "flex-start",
        animationDelay: "0.05s",
      }}
    >
      {/* Avatar — assistant only */}
      {!isUser && (
        <div
          style={{
            width: "34px",
            height: "34px",
            borderRadius: "12px",
            background: "linear-gradient(135deg, #7c3aed, #a855f7)",
            boxShadow: "0 0 16px rgba(124, 58, 237, 0.3), inset 0 1px 0 rgba(255,255,255,0.15)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            marginTop: "2px",
          }}
        >
          <span style={{ fontSize: "11px", fontWeight: "800", color: "white", letterSpacing: "-0.5px" }}>DC</span>
        </div>
      )}

      <div style={{ maxWidth: "76%", minWidth: "80px" }}>
        {/* Message Bubble */}
        <div
          style={{
            borderRadius: isUser ? "18px 18px 6px 18px" : "18px 18px 18px 6px",
            padding: "12px 16px",
            background: isUser
              ? "linear-gradient(135deg, #7c3aed 0%, #9333ea 100%)"
              : "rgba(18, 18, 42, 0.95)",
            border: isUser
              ? "none"
              : "1px solid rgba(124, 58, 237, 0.15)",
            boxShadow: isUser
              ? "0 4px 20px rgba(124, 58, 237, 0.25), inset 0 1px 0 rgba(255,255,255,0.12)"
              : "0 2px 16px rgba(0,0,0,0.2)",
          }}
        >
          {message.isStreaming && !message.content ? (
            <TypingIndicator />
          ) : (
            <div
              className={`text-sm leading-relaxed markdown-content`}
              style={{
                fontSize: "14px",
                lineHeight: "1.7",
                color: isUser ? "white" : "#eeeef5",
              }}
              dangerouslySetInnerHTML={{
                __html: formatMarkdown(message.content),
              }}
            />
          )}
        </div>

        {/* Sources */}
        {!isUser && message.sources && message.sources.length > 0 && (
          <SourceViewer sources={message.sources} />
        )}

        {/* Timestamp */}
        <p
          style={{
            fontSize: "10px",
            color: "#55557a",
            marginTop: "4px",
            textAlign: isUser ? "right" : "left",
          }}
        >
          {new Date(message.timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>

      {/* Avatar — user only */}
      {isUser && (
        <div
          style={{
            width: "34px",
            height: "34px",
            borderRadius: "12px",
            background: "rgba(18, 18, 42, 0.9)",
            border: "1px solid rgba(124, 58, 237, 0.25)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            marginTop: "2px",
          }}
        >
          <span style={{ fontSize: "12px", fontWeight: "700", color: "#c4b5fd" }}>U</span>
        </div>
      )}
    </div>
  );
}

/**
 * Simple markdown-to-HTML converter for chat messages.
 */
function formatMarkdown(text: string): string {
  if (!text) return "";

  let html = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/```(\w*)\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>')
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/^### (.+)$/gm, "<h3>$1</h3>")
    .replace(/^## (.+)$/gm, "<h2>$1</h2>")
    .replace(/^# (.+)$/gm, "<h1>$1</h1>")
    .replace(/^> (.+)$/gm, "<blockquote>$1</blockquote>")
    .replace(/^- (.+)$/gm, "<li>$1</li>")
    .replace(/^\d+\. (.+)$/gm, "<li>$1</li>")
    .replace(/\n\n/g, "</p><p>")
    .replace(/\n/g, "<br/>");

  html = `<p>${html}</p>`;
  html = html.replace(/<p><\/p>/g, "");
  html = html.replace(/(<li>.*?<\/li>)+/g, "<ul>$&</ul>");

  return html;
}
