"use client";

import { startTransition, useActionState, useRef } from "react";
import { addTasksBulk } from "@/app/admin/actions";

export default function BulkTasks({ today }: { today: string }) {
  const [state, action, pending] = useActionState(addTasksBulk, { message: "" });
  const form = useRef<HTMLFormElement>(null);
  return (
    <form
      ref={form}
      className="a-form bulk-tasks"
      onSubmit={(e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        startTransition(() => action(data));
      }}
    >
      <label>Tasks, one per line
        <textarea name="lines" rows={8} required placeholder={"Follow up with Maria's Bakery | 2026-11-10\nSend quote to Sunset Bar"} />
      </label>
      <label>Due date for lines without one<input name="due" type="date" defaultValue={today} /></label>
      <p className="muted bulk-hint">Add a date after a <code>|</code> to give a line its own due date. Tasks already on your list are skipped.</p>
      <div className="bulk-foot">
        <button type="submit" className="a-btn a-btn-primary" disabled={pending}>{pending ? "Adding…" : "Add tasks"}</button>
        <span role="status">{state.message}</span>
      </div>
    </form>
  );
}
