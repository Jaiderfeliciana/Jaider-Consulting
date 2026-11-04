"use client";

import { useState } from "react";
import Icon from "./Icon";
import Answer from "./Answer";
import { useAsk } from "./useAsk";

const chips = [
  { label: "Follow-ups", question: "Which clients or leads should I follow up with this week, and why?" },
  { label: "This month", question: "Summarize how my business is doing this month compared with last month." },
  { label: "Next steps", question: "What are the three most useful things I can do this week to get more clients?" },
];

const tiles = [
  { icon: "mail", label: "Write a message", question: "Write a friendly WhatsApp follow-up message for my newest lead, offering a free consultation." },
  { icon: "bolt", label: "Plan my week", question: "Make a simple plan for my week using my open tasks and upcoming sessions." },
  { icon: "chart", label: "Grow revenue", question: "Based on my clients and services, which services should I promote to increase revenue? Be specific." },
  { icon: "users", label: "Reply to a client", question: "Help me write a short, professional reply to a client who asks for a discount on a website." },
];

export default function AssistantCard({ connected }: { connected: boolean }) {
  const { answer, error, loading, ask, reset } = useAsk();
  const [input, setInput] = useState("");

  function send(question: string) {
    if (!question.trim() || loading) return;
    ask(question.trim());
  }

  return (
    <div className="assistant">
      <p className="assistant-hi">Hi, Jaider 👋</p>
      <h2>How can I help you?</h2>
      {!connected ? (
        <p className="assistant-off">Connect Grok on the <a href="/admin/setup">Integrations</a> page to use the assistant.</p>
      ) : (
        <>
          <div className="assistant-chips">
            {chips.map((c) => <button key={c.label} type="button" onClick={() => send(c.question)} disabled={loading}>{c.label}</button>)}
          </div>
          {answer || error || loading ? (
            <div className="assistant-answer" aria-live="polite">
              {loading ? <p className="thinking">Grok is thinking…</p> : error ? <p className="answer-error">{error}</p> : <Answer text={answer} />}
              {!loading && <button type="button" className="assistant-back" onClick={reset}>← Back to suggestions</button>}
            </div>
          ) : (
            <div className="assistant-tiles">
              {tiles.map((t) => (
                <button key={t.label} type="button" onClick={() => send(t.question)} disabled={loading}>
                  <span><Icon name={t.icon} size={22} /></span>
                  {t.label}
                </button>
              ))}
            </div>
          )}
          <form className="assistant-ask" onSubmit={(e) => { e.preventDefault(); send(input); }}>
            <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask something…" aria-label="Ask the assistant" maxLength={2000} />
            <button type="submit" aria-label="Send" disabled={loading || !input.trim()}><Icon name="arrow" size={20} /></button>
          </form>
        </>
      )}
    </div>
  );
}
