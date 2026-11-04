"use client";

import { startTransition, useActionState } from "react";

type Result = { message: string; error: string };

// A form for a server action that answers with a message or an error.
// Submits via onSubmit so typed values stay in place if something goes wrong.
export default function ResultForm({ action, className, children, submit, reset = false }: {
  action: (prev: Result, form: FormData) => Promise<Result>;
  className?: string;
  children: React.ReactNode;
  submit: string;
  reset?: boolean;
}) {
  const [state, run, pending] = useActionState(action, { message: "", error: "" });
  return (
    <form
      className={className}
      onSubmit={(e) => {
        e.preventDefault();
        const el = e.currentTarget;
        const data = new FormData(el);
        startTransition(async () => {
          await run(data);
          if (reset) el.reset();
        });
      }}
    >
      {children}
      <div className="rf-foot">
        <button type="submit" className="a-btn a-btn-primary" disabled={pending}>{pending ? "Saving…" : submit}</button>
        {state.error ? <span className="rf-error" role="alert">{state.error}</span> : state.message && <span className="rf-ok" role="status">{state.message}</span>}
      </div>
    </form>
  );
}
