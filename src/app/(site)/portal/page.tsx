import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Logo from "@/components/Logo";
import LoginForm from "./LoginForm";
import { currentPortal } from "@/lib/portal/auth";
import { whatsappHref } from "@/content/site";

export const metadata: Metadata = { title: "Client portal — Jaider Feliciana", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function PortalLogin() {
  if (await currentPortal()) redirect("/portal/home");
  return (
    <main className="portal-login">
      <div className="portal-login-card">
        <a href="/" className="portal-brand"><Logo id="jf-logo-portal-login" /> <span>Jaider Feliciana</span></a>
        <h1>Client portal</h1>
        <p>Follow your project, see payments and documents, and send files and feedback.</p>
        <LoginForm />
        <p className="portal-help">No portal yet? <a href={whatsappHref("Hi Jaider! I'd like access to my client portal.")} target="_blank" rel="noopener">Ask Jaider on WhatsApp</a></p>
      </div>
    </main>
  );
}
