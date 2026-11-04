import "server-only";

// Sends email through Resend (resend.com). Needs RESEND_API_KEY, and PORTAL_FROM_EMAIL set to an
// address on a domain verified in Resend, e.g. "Jaider Feliciana <portal@jaiderfeliciana.com>".

export const isEmailConfigured = () => Boolean(process.env.RESEND_API_KEY);

const escape = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);

// A simple branded email: heading, paragraphs and an optional button.
export async function sendEmail(to: string, subject: string, paragraphs: string[], button?: { label: string; url: string }) {
  if (!isEmailConfigured()) return { ok: false, error: "Email isn't connected yet (RESEND_API_KEY)." };
  const html = `<div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;padding:24px;color:#12111a">
    <p style="font-weight:700;letter-spacing:.06em;color:#6a3ff2;margin:0 0 18px">JAIDER FELICIANA</p>
    ${paragraphs.map((p) => `<p style="font-size:16px;line-height:1.55;margin:0 0 14px;white-space:pre-wrap">${escape(p)}</p>`).join("")}
    ${button ? `<p style="margin:22px 0"><a href="${escape(button.url)}" style="background:#6a3ff2;color:#fff;padding:12px 22px;border-radius:999px;text-decoration:none;font-weight:600">${escape(button.label)}</a></p>` : ""}
    <p style="font-size:13px;color:#57547a;margin-top:28px">Jaider Feliciana · Websites, social media & ads · Aruba</p></div>`;
  const text = [...paragraphs, ...(button ? [`${button.label}: ${button.url}`] : [])].join("\n\n");
  try {
    const res = await fetch(`${(process.env.RESEND_API_URL || "https://api.resend.com").replace(/\/$/, "")}/emails`, {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: process.env.PORTAL_FROM_EMAIL || "Jaider Feliciana <portal@jaiderfeliciana.com>", to, subject, html, text }),
      cache: "no-store",
    });
    return res.ok ? { ok: true } : { ok: false, error: `Email could not be sent (${res.status}).` };
  } catch {
    return { ok: false, error: "Email could not be sent." };
  }
}
