/**
 * TypingIndicator — Animated dots showing the AI is "thinking".
 */

export default function TypingIndicator() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "5px", padding: "4px 2px" }}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          style={{
            width: "7px",
            height: "7px",
            borderRadius: "50%",
            background: "linear-gradient(135deg, #7c3aed, #a855f7)",
            animation: `typing-dot 1.4s ease-in-out ${i * 0.22}s infinite`,
            boxShadow: "0 0 6px rgba(124, 58, 237, 0.4)",
          }}
        />
      ))}
    </div>
  );
}
