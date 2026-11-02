"use client";

import { useState } from "react";

// Builds a personal agreement link with the service and price already filled in.
export default function LinkMaker({ services, base }: { services: string[]; base: string }) {
  const [service, setService] = useState(services[0]);
  const [price, setPrice] = useState("");
  const [copied, setCopied] = useState(false);
  const link = `${base}/agreement?${new URLSearchParams({ service, ...(price ? { price } : {}) })}`;
  return (
    <div className="link-maker">
      <div className="a-form a-form-row lm-row">
        <label>Service
          <select value={service} onChange={(e) => setService(e.target.value)}>{services.map((s) => <option key={s}>{s}</option>)}</select>
        </label>
        <label>Agreed price (USD)
          <input value={price} onChange={(e) => setPrice(e.target.value.replace(/[^0-9.,]/g, ""))} inputMode="decimal" placeholder="e.g. 1000" />
        </label>
      </div>
      <p className="lm-link"><code>{link}</code></p>
      <div className="lm-actions">
        <button type="button" className="a-btn a-btn-primary" onClick={async () => { await navigator.clipboard.writeText(link); setCopied(true); setTimeout(() => setCopied(false), 2000); }}>
          {copied ? "Copied ✓" : "Copy link"}
        </button>
        <a className="a-btn a-btn-ghost" target="_blank" rel="noopener"
          href={`https://wa.me/?text=${encodeURIComponent(`Hi! Here is your client service agreement for ${service}. Please read it and sign online: ${link}`)}`}>
          Send on WhatsApp
        </a>
        <a className="a-btn a-btn-ghost" href={link} target="_blank" rel="noopener">Preview</a>
      </div>
    </div>
  );
}
