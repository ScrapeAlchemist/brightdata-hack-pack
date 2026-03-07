"use client";

import { useState, useRef, useEffect } from "react";
import type { VacancyParcel, CopilotResponse } from "@/app/lib/types";
import { PRESET_QUESTIONS } from "@/app/lib/copilot";

interface Props {
  parcels: VacancyParcel[];
  selectedParcel: VacancyParcel | null;
  onHighlight: (parcelIds: string[]) => void;
}

interface Message {
  role: "user" | "assistant";
  content: string;
  response?: CopilotResponse;
}

export default function CopilotPanel({ selectedParcel, onHighlight }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function ask(question: string) {
    if (!question.trim() || loading) return;
    setLoading(true);

    const userMsg: Message = { role: "user", content: question };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    try {
      const res = await fetch("/api/copilot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, selectedParcel }),
      });

      const data: CopilotResponse = await res.json();

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.answer, response: data },
      ]);

      if (data.highlightedParcels?.length) {
        onHighlight(data.highlightedParcels);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, I couldn't process that request. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    ask(input);
  }

  return (
    <div className="panel copilot-panel">
      <div className="panel-header">
        <div className="panel-title">🤖 Ask the Planning Copilot</div>
        <span className="badge" style={{ background: "#0d948820", color: "#0d9488" }}>AI</span>
      </div>

      <div className="preset-questions">
        {PRESET_QUESTIONS.map((q) => (
          <button
            key={q}
            className="preset-btn"
            onClick={() => ask(q)}
            disabled={loading}
          >
            {q}
          </button>
        ))}
      </div>

      <div className="copilot-messages">
        {messages.length === 0 && (
          <div className="copilot-empty">
            Ask a planning question or click a preset above. Results will highlight parcels on the map.
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`copilot-msg ${msg.role === "user" ? "msg-user" : "msg-assistant"}`}>
            <div className="msg-label">{msg.role === "user" ? "You" : "Copilot"}</div>
            <div className="msg-text" dangerouslySetInnerHTML={{ __html: msg.content.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>") }} />
            {msg.response && (
              <div className="msg-meta">
                {msg.response.highlightedParcels?.length > 0 && (
                  <div className="msg-highlight">
                    🗺️ Highlighted {msg.response.highlightedParcels.length} parcel{msg.response.highlightedParcels.length !== 1 ? "s" : ""} on map
                  </div>
                )}
                <div className="msg-reasoning">💡 {msg.response.reasoning}</div>
                <div className="msg-mcp">⚡ {msg.response.mcpNote}</div>
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="copilot-msg msg-assistant">
            <div className="msg-label">Copilot</div>
            <div className="typing-indicator">
              <span /><span /><span />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSubmit} className="copilot-form">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about redevelopment, parks, zoning..."
          className="copilot-input"
          disabled={loading}
        />
        <button type="submit" disabled={loading || !input.trim()} className="copilot-send">
          Send
        </button>
      </form>
    </div>
  );
}
