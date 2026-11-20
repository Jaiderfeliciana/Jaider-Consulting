"use client";

import { startTransition, useActionState, useEffect, useRef, useState } from "react";
import { bookingSlots, manageBooking } from "@/app/admin/actions";
import { hours } from "@/content/site";

const TZ = hours.timeZone;

const dayOf = (iso: string) => new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(new Date(iso));
const timeOf = (iso: string) =>
  new Intl.DateTimeFormat("en-GB", { timeZone: TZ, hour: "2-digit", minute: "2-digit" }).format(new Date(iso));
const longDay = (day: string) =>
  new Date(`${day}T12:00:00Z`).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", timeZone: "UTC" });

// "2026-12-03" + "18:30" in your time zone → an exact moment (ISO), whatever time zone this browser is in.
function zonedIso(day: string, time: string) {
  const guess = Date.parse(`${day}T${time}:00Z`);
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-US", { timeZone: TZ, hourCycle: "h23", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" })
      .formatToParts(new Date(guess)).map((p) => [p.type, p.value]),
  );
  const shown = Date.parse(`${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}:00Z`);
  return new Date(guess - (shown - guess)).toISOString();
}

type Mode = null | "reschedule" | "cancel";

export default function BookingActions({ id, status, slug, start, name, session }: {
  id: string; status: string; slug: string; start: string; name: string; session: string;
}) {
  const [state, action, pending] = useActionState(manageBooking, { error: "" });
  const [mode, setMode] = useState<Mode>(null);
  // Which button sent the last request, so an error shows next to the right one.
  const [sent, setSent] = useState<"accept" | Mode>(null);
  const dialog = useRef<HTMLDialogElement>(null);

  const [day, setDay] = useState(() => dayOf(start));
  const [slots, setSlots] = useState<string[] | null>(null);
  const [slotError, setSlotError] = useState("");
  const [picked, setPicked] = useState("");
  const [manual, setManual] = useState("");

  useEffect(() => {
    if (mode) dialog.current?.showModal();
    else dialog.current?.close();
  }, [mode]);

  // Load your free times for the chosen day.
  useEffect(() => {
    if (mode !== "reschedule" || !day) return;
    let live = true;
    setSlots(null); setSlotError(""); setPicked("");
    bookingSlots(slug, day).then((r) => {
      if (!live) return;
      setSlots(r.slots.filter((s) => Date.parse(s) > Date.now()));
      setSlotError(r.error ?? "");
    });
    return () => { live = false; };
  }, [mode, day, slug]);

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    setSent(mode ?? "accept");
    if (mode === "reschedule") data.set("start", picked || (manual ? zonedIso(day, manual) : ""));
    startTransition(() => action(data));
  }

  function open(next: Exclude<Mode, null>) {
    setDay(dayOf(start)); setPicked(""); setManual(""); setSent(null);
    setMode(next);
  }

  const today = dayOf(new Date().toISOString());
  const when = `${longDay(dayOf(start))} at ${timeOf(start)}`;

  return (
    <div>
      <div className="booking-actions">
        {status === "pending" && (
          <form onSubmit={submit}>
            <input type="hidden" name="id" value={id} />
            <input type="hidden" name="do" value="accept" />
            <button type="submit" className="a-btn a-btn-accept" disabled={pending}>{pending && !mode ? "Accepting…" : "Accept"}</button>
          </form>
        )}
        <button type="button" className="a-btn a-btn-small" onClick={() => open("reschedule")}>Reschedule</button>
        <button type="button" className="a-btn a-btn-danger" onClick={() => open("cancel")}>Cancel</button>
      </div>
      {sent === "accept" && state.error && <p className="form-error booking-error" role="alert">{state.error}</p>}

      <dialog ref={dialog} className="a-dialog" onClose={() => setMode(null)}>
        {mode && (
          <form className="a-form" onSubmit={submit}>
            <input type="hidden" name="id" value={id} />
            <input type="hidden" name="do" value={mode} />
            <div className="a-dialog-head">
              <h2>{mode === "reschedule" ? "Reschedule session" : "Cancel session"}</h2>
              <p className="muted">{session} with {name} · {when} (Aruba time)</p>
            </div>

            {mode === "reschedule" && (
              <>
                <label>
                  New date
                  <input type="date" value={day} min={today} onChange={(e) => setDay(e.target.value)} required />
                </label>
                <div className="slot-picker" aria-live="polite">
                  <span className="slot-label">Your free times (Aruba time)</span>
                  {slots === null ? (
                    <p className="muted">Checking your calendar…</p>
                  ) : slots.length ? (
                    <div className="slot-grid">
                      {slots.map((s) => (
                        <button
                          type="button"
                          key={s}
                          className={`slot${picked === s ? " slot-on" : ""}`}
                          aria-pressed={picked === s}
                          onClick={() => { setPicked(s); setManual(""); }}
                        >
                          {timeOf(s)}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="muted">{slotError || "No free times on this day. Pick another date, or enter a time below."}</p>
                  )}
                </div>
                <label>
                  Or enter a time yourself
                  <input type="time" value={manual} onChange={(e) => { setManual(e.target.value); setPicked(""); }} />
                </label>
              </>
            )}

            <label>
              <span>{mode === "reschedule" ? "Message to the client" : "Reason (sent to the client)"} <span className="optional">(optional)</span></span>
              <textarea
                name="reason"
                rows={3}
                placeholder={mode === "reschedule" ? "e.g. Something came up, I hope this new time works for you." : "e.g. I'm sorry, I'm not available at this time."}
              />
            </label>

            <p className="form-error" role="alert">{sent === mode ? state.error : ""}</p>
            <div className="a-dialog-actions">
              <button type="button" className="a-btn a-btn-ghost" onClick={() => setMode(null)} disabled={pending}>Back</button>
              {mode === "reschedule" ? (
                <button type="submit" className="a-btn a-btn-primary" disabled={pending || (!picked && !manual)}>
                  {pending ? "Moving…" : "Move session"}
                </button>
              ) : (
                <button type="submit" className="a-btn a-btn-cancel" disabled={pending}>{pending ? "Cancelling…" : "Cancel session"}</button>
              )}
            </div>
          </form>
        )}
      </dialog>
    </div>
  );
}
