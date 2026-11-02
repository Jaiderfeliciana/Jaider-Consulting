"use client";

export default function PrintButton({ className = "btn btn-primary", label = "Print or save as PDF" }: { className?: string; label?: string }) {
  return <button type="button" className={className} onClick={() => window.print()}>{label}</button>;
}
