"use client";

import { useActionState } from "react";
import { login } from "../actions";

export default function LoginForm() {
  const [state, action, pending] = useActionState(login, { error: "" });
  return (
    <form action={action} className="login-form">
      <label>
        Password
        <input type="password" name="password" autoComplete="current-password" required autoFocus />
      </label>
      <p className="form-error" role="alert">{state.error}</p>
      <button type="submit" className="a-btn a-btn-primary" disabled={pending}>{pending ? "Checking…" : "Log in"}</button>
    </form>
  );
}
