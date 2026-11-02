"use client";

// A submit button that asks "are you sure?" before deleting something.
export default function ConfirmButton({ message, children }: { message: string; children: React.ReactNode }) {
  return (
    <button type="submit" className="a-btn a-btn-danger" onClick={(e) => { if (!confirm(message)) e.preventDefault(); }}>
      {children}
    </button>
  );
}
