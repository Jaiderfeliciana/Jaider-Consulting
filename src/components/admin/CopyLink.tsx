"use client";

import { useState } from "react";

export default function CopyLink({ link, label = "Copy client link" }: { link: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button type="button" className="a-btn a-btn-ghost" onClick={async () => { await navigator.clipboard.writeText(link); setCopied(true); setTimeout(() => setCopied(false), 2000); }}>
      {copied ? "Copied ✓" : label}
    </button>
  );
}
