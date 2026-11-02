"use client";

import Icon from "./Icon";
import Answer from "./Answer";
import { useAsk } from "./useAsk";

const QUESTION =
  "Analyze my business data: revenue trend, clients by status and service, upcoming sessions and open tasks. " +
  "Give me 3 short, concrete insights and one action for this week.";

export default function InsightsCard({ connected, tip }: { connected: boolean; tip: string }) {
  const { answer, error, loading, ask } = useAsk();
  return (
    <div className="card insights">
      <div className="card-head">
        <h2><span className="head-icon"><Icon name="chart" size={22} /></span> Business insights</h2>
      </div>
      <p className="insights-legend"><span className="dot dot-green" /> Your data <span className="dot dot-pink" /> Grok analysis</p>
      <div className="insights-body" aria-live="polite">
        {loading ? <p className="thinking">Analyzing your business…</p>
          : error ? <p className="answer-error">{error}</p>
          : answer ? <Answer text={answer} />
          : <p>{tip}</p>}
      </div>
      <button type="button" className="run-btn" onClick={() => ask(QUESTION)} disabled={!connected || loading}>
        {loading ? "Running…" : answer ? "Run again" : "Run analysis"}
      </button>
      {!connected && <p className="insights-off">Connect Grok on the Setup page to run an analysis.</p>}
    </div>
  );
}
