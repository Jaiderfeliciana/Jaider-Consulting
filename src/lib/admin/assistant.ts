import "server-only";
import { contact, hours, services } from "@/content/site";
import { getBookings } from "./cal";
import { getClients, getPayments, getTasks, getVisits, isDbConfigured } from "./data";
import { dayKey, lastMonths, money } from "./dates";

// The Grok assistant: answers questions about the business using a summary of its data.
// Needs XAI_API_KEY. XAI_MODEL can override the model; if xAI rejects it, a current model is picked automatically.

const API = (process.env.XAI_API_URL || "https://api.x.ai/v1").replace(/\/$/, "");
let workingModel: string | null = null;

export const isAssistantConfigured = () => Boolean(process.env.XAI_API_KEY);

// What the assistant knows. Contact details (phone, email, links) are left out on purpose.
async function businessSummary() {
  const lines: string[] = [
    `Today is ${dayKey()} (Aruba time). Business: Jaider Feliciana — websites, social media, ads, branding, SEO, AI chatbots, consulting and an online course, based in ${contact.location}.`,
    `Working hours: ${hours.days} ${hours.start}–${hours.end} ${hours.place} time.`,
    `Services and prices: ${services.map((s) => `${s.title} ${s.price}${s.priceNote ? ` ${s.priceNote}` : ""}`).join("; ")}.`,
  ];
  if (isDbConfigured()) {
    const [clients, payments, tasks, visits] = await Promise.all([getClients(), getPayments(), getTasks(), getVisits(30)]);
    lines.push(`Clients (${clients.length}): ` + (clients.slice(0, 60).map((c) =>
      `${c.name}${c.business ? ` (${c.business})` : ""} — ${c.service || "no service"}, ${c.status}, added ${c.createdAt.slice(0, 10)}${c.notes ? `, notes: ${c.notes.replace(/\s+/g, " ").slice(0, 200)}` : ""}`).join(" | ") || "none"));
    const months = lastMonths(6).map((m) => `${m}: ${money(payments.filter((p) => p.date.startsWith(m)).reduce((s, p) => s + p.amount, 0))}`);
    lines.push(`Revenue per month (last 6): ${months.join(", ")}.`);
    lines.push(`Recent payments: ${payments.slice(0, 20).map((p) => `${p.date} ${money(p.amount)}${p.client ? ` from ${p.client}` : ""}${p.description ? ` (${p.description})` : ""}`).join("; ") || "none"}.`);
    lines.push(`Open tasks: ${tasks.filter((t) => !t.done).map((t) => `${t.title}${t.due ? ` (due ${t.due})` : ""}`).join("; ") || "none"}.`);
    lines.push(`Website visitors last 30 days: ${visits.days.reduce((s, d) => s + d.visitors, 0)}.`);
  } else {
    lines.push("The client/payments database is not connected yet, so there is no client data.");
  }
  const bookings = await getBookings();
  if (!bookings.error) {
    lines.push(`Upcoming sessions: ${bookings.upcoming.filter((b) => b.status !== "cancelled").slice(0, 15).map((b) => `${b.start} ${b.session} with ${b.name}`).join("; ") || "none"}.`);
  }
  return lines.join("\n");
}

async function pickModel(key: string) {
  const res = await fetch(`${API}/models`, { headers: { Authorization: `Bearer ${key}` }, cache: "no-store" });
  if (!res.ok) return null;
  const ids = ((await res.json()) as { data?: { id: string }[] }).data?.map((m) => m.id) ?? [];
  const chat = ids.filter((id) => /^grok-\d/.test(id) && !/image|vision|imagine|video|tts|embed/.test(id)).sort().reverse();
  return chat[0] ?? null;
}

async function complete(key: string, model: string, question: string, context: string) {
  return fetch(`${API}/chat/completions`, {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    cache: "no-store",
    signal: AbortSignal.timeout(60000),
    body: JSON.stringify({
      model,
      max_tokens: 900,
      temperature: 0.4,
      messages: [
        {
          role: "system",
          content:
            "You are the business assistant inside Jaider Feliciana's private admin panel. Jaider runs a small web design and digital marketing business in Aruba. " +
            "Answer briefly and practically, using the business data below. Never invent numbers or clients that aren't in the data; say so when data is missing. " +
            "Answer in the language of the question (English, Papiamento, Spanish or Dutch). When asked to write a message for a client, write it ready to paste into WhatsApp. " +
            "Use short paragraphs or '-' bullet points; no tables.\n\nBusiness data:\n" + context,
        },
        { role: "user", content: question },
      ],
    }),
  });
}

export async function askAssistant(question: string): Promise<{ answer?: string; error?: string }> {
  const key = process.env.XAI_API_KEY;
  if (!key) return { error: "The assistant isn't connected yet. Add XAI_API_KEY in Vercel (see Setup)." };
  try {
    const context = await businessSummary();
    let model = workingModel ?? process.env.XAI_MODEL ?? "grok-4.6";
    let res = await complete(key, model, question, context);
    if (res.status === 404 || res.status === 400) {
      // The model name may be outdated: ask xAI which models exist and retry once.
      const picked = await pickModel(key);
      if (picked && picked !== model) {
        model = picked;
        res = await complete(key, model, question, context);
      }
    }
    if (res.status === 401 || res.status === 403) return { error: "xAI did not accept the API key. Check XAI_API_KEY in Vercel." };
    if (res.status === 429) return { error: "xAI says you've reached your usage or credit limit. Check your xAI account." };
    if (!res.ok) return { error: `xAI answered with an error (${res.status}).` };
    workingModel = model;
    const json = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    const answer = json.choices?.[0]?.message?.content?.trim();
    return answer ? { answer } : { error: "Grok returned an empty answer. Try asking again." };
  } catch (e) {
    return { error: e instanceof Error && e.name === "TimeoutError" ? "Grok took too long to answer. Try again." : "Could not reach xAI. Try again in a moment." };
  }
}
