"use client";

import { startTransition, useActionState } from "react";
import SignaturePad from "@/components/SignaturePad";
import { countersignAgreement } from "@/app/admin/actions";

export default function CountersignForm({ id }: { id: string }) {
  const [state, action, pending] = useActionState(countersignAgreement, { error: "" });
  return (
    <form
      className="a-form countersign"
      onSubmit={(e) => { e.preventDefault(); const data = new FormData(e.currentTarget); startTransition(() => action(data)); }}
    >
      <input type="hidden" name="id" value={id} />
      <label>Authorized representative<input name="name" defaultValue="Jaider Feliciana" required /></label>
      <SignaturePad name="signature" label="Your signature" />
      <p className="form-error" role="alert">{state.error}</p>
      <button type="submit" className="a-btn a-btn-primary" disabled={pending}>{pending ? "Saving…" : "Countersign agreement"}</button>
    </form>
  );
}
