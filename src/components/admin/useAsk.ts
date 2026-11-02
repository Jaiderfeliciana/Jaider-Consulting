"use client";

import { useState } from "react";

// Sends a question to the Grok assistant and keeps the latest answer.
export function useAsk() {
  const [answer, setAnswer] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function ask(question: string) {
    setLoading(true);
    setError("");
    setAnswer("");
    try {
      const res = await fetch("/admin/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });
      const json = (await res.json().catch(() => ({ error: "Please log in again." }))) as { answer?: string; error?: string };
      if (json.answer) setAnswer(json.answer);
      else setError(json.error ?? "Something went wrong.");
    } catch {
      setError("No connection. Check your internet and try again.");
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setAnswer("");
    setError("");
  }

  return { answer, error, loading, ask, reset };
}
