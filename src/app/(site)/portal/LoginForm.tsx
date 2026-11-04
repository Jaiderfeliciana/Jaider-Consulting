"use client";

import { useActionState } from "react";
import { portalLogin, type LoginState } from "./actions";

export default function LoginForm() {
  const [state, action, pending] = useActionState(portalLogin, { step: "email", email: "", error: "" } as LoginState);
  return (
    <form action={action} className="portal-login-form">
      {state.step === "email" ? (
        <>
          <label>Your email
            <input name="email" type="email" required autoComplete="email" autoFocus defaultValue={state.email} placeholder="name@email.com" />
          </label>
          <button type="submit" className="btn btn-primary" disabled={pending}>{pending ? "Sending…" : "Send me a login code"}</button>
        </>
      ) : (
        <>
          <p className="portal-sent">If <strong>{state.email}</strong> has a client portal, we just emailed it a 6-digit code. Check your inbox (and spam).</p>
          <label>Login code
            <input name="code" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9 ]*" maxLength={7} required autoFocus placeholder="123456" className="code-input" />
          </label>
          <button type="submit" className="btn btn-primary" disabled={pending}>{pending ? "Checking…" : "Log in"}</button>
          <button type="submit" name="intent" value="restart" formNoValidate className="link-button">Use a different email or send a new code</button>
        </>
      )}
      <p className="form-error" role="alert">{state.error}</p>
    </form>
  );
}
