"use client";

import { startTransition, useActionState } from "react";
import SignaturePad from "@/components/SignaturePad";
import { contactTopics } from "@/content/site";
import { signAgreement } from "./actions";

export default function AgreementForm({ service, price, today }: { service?: string; price?: string; today: string }) {
  const [state, action, pending] = useActionState(signAgreement, { error: "" });
  // Submitting through onSubmit (not the form's action) keeps what the client typed if there's an error.
  return (
    <form
      className="sign-form"
      onSubmit={(e) => { e.preventDefault(); const data = new FormData(e.currentTarget); startTransition(() => action(data)); }}
    >
      <h2>Client information</h2>
      <div className="sign-grid">
        <label>Full name<input name="fullName" required autoComplete="name" placeholder="Full name" /></label>
        <label>Company name<input name="company" autoComplete="organization" placeholder="Optional" /></label>
        <label>Email<input name="email" type="email" required autoComplete="email" placeholder="name@email.com" /></label>
        <label>Service purchased
          {service
            ? <input name="service" value={service} readOnly className="is-fixed" />
            : <select name="service" defaultValue="" required>
                <option value="" disabled>Choose a service</option>
                {contactTopics.map((t) => <option key={t}>{t}</option>)}
              </select>}
        </label>
        <label>Agreed price (USD)
          {price
            ? <input name="price" value={price} readOnly className="is-fixed" />
            : <input name="price" inputMode="decimal" required placeholder="e.g. 1000" />}
        </label>
        <label>Date<input value={today} readOnly className="is-fixed" aria-label="Date" /></label>
      </div>
      <input type="text" name="website_url" tabIndex={-1} autoComplete="off" className="hp" aria-hidden="true" />

      <h2>Digital signature</h2>
      <SignaturePad name="signature" label="Client signature" />

      <label className="accept">
        <input type="checkbox" name="accept" required />
        <span>I have read, understood and accept these terms and the approved project quotation.</span>
      </label>

      <p className="form-error" role="alert">{state.error}</p>
      <button type="submit" className="btn btn-primary sign-submit" disabled={pending}>
        {pending ? "Signing…" : "Sign agreement"}
      </button>
      <p className="sign-note">Your name, email, signature, the date and your internet (IP) address are saved as a record of this agreement.</p>
    </form>
  );
}
