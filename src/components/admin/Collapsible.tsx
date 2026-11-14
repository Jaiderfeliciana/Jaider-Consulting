"use client";

import { useState } from "react";

// A <details> section that remembers being opened or closed, even when the page refreshes its data.
export default function Collapsible({ initiallyOpen, className, summary, children }: {
  initiallyOpen: boolean; className?: string; summary: React.ReactNode; children: React.ReactNode;
}) {
  const [open, setOpen] = useState(initiallyOpen);
  return (
    <details className={className} open={open} onToggle={(e) => setOpen(e.currentTarget.open)}>
      <summary>{summary}</summary>
      {children}
    </details>
  );
}
