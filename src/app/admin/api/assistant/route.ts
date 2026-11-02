import { cookies } from "next/headers";
import { SESSION_COOKIE, isValidSession } from "@/lib/admin/session";
import { askAssistant } from "@/lib/admin/assistant";

export const maxDuration = 60;

export async function POST(request: Request) {
  if (!(await isValidSession((await cookies()).get(SESSION_COOKIE)?.value))) {
    return Response.json({ error: "Please log in again." }, { status: 401 });
  }
  let question = "";
  try {
    const body = (await request.json()) as { question?: unknown };
    question = typeof body.question === "string" ? body.question.trim().slice(0, 2000) : "";
  } catch {
    // fall through to the empty-question answer
  }
  if (!question) return Response.json({ error: "Type a question first." }, { status: 400 });
  return Response.json(await askAssistant(question));
}
