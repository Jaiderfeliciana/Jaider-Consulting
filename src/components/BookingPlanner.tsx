"use client";

import { useEffect, useState } from "react";
import Cal, { getCalApi } from "@calcom/embed-react";
import { booking, whatsappHref } from "@/content/site";
import { trackGoal } from "@/lib/track";

export default function BookingPlanner() {
  const [selected, setSelected] = useState(booking.sessions[0].title);
  const session = booking.sessions.find((s) => s.title === selected) ?? booking.sessions[0];
  const enabled = booking.calUsername.trim() !== "" && session.slug !== "";

  useEffect(() => {
    if (!enabled) return;
    (async () => {
      const cal = await getCalApi({ namespace: session.slug });
      cal("ui", {
        theme: "light",
        layout: "month_view",
        cssVarsPerTheme: { light: { "cal-brand": "#6a3ff2" }, dark: { "cal-brand": "#8b5cf6" } },
      });
      // Count a booked consultation once per page view (Cal.com may send both event versions).
      let counted = false;
      const onBooked = () => { if (!counted) { counted = true; trackGoal("consultation"); } };
      cal("on", { action: "bookingSuccessfulV2", callback: onBooked });
      cal("on", { action: "bookingSuccessful", callback: onBooked });
    })();
  }, [enabled, session.slug]);

  return (
    <>
      <div className="session-tabs" role="radiogroup" aria-label="Choose a session">
        {booking.sessions.map((s) => (
          <button
            key={s.title}
            type="button"
            role="radio"
            aria-checked={s.title === selected}
            className={s.title === selected ? "session-tab is-selected" : "session-tab"}
            onClick={() => setSelected(s.title)}
          >
            <span className="session-meta">{s.duration} · {s.price}</span>
            <span className="session-title">{s.title}</span>
            <span className="session-desc">{s.description}</span>
          </button>
        ))}
      </div>

      <div className={enabled ? "planner is-live" : "planner"}>
        {enabled ? (
          <Cal
            key={session.slug}
            namespace={session.slug}
            calLink={`${booking.calUsername.trim()}/${session.slug}`}
            config={{ layout: "month_view", theme: "light" }}
            style={{ width: "100%", height: "100%", overflow: "auto" }}
          />
        ) : (
          <div className="planner-fallback">
            <p className="eyebrow">Online booking opens soon</p>
            <h2>Book your {session.title.toLowerCase()} on WhatsApp</h2>
            <p>Send me a message with a day and time that works for you, and I&apos;ll confirm within 24 hours.</p>
            <a
              href={whatsappHref(`Hi Jaider! I'd like to book a ${session.title.toLowerCase()} (${session.duration}).`)}
              target="_blank"
              rel="noopener"
              className="btn btn-primary"
            >
              Book on WhatsApp
            </a>
          </div>
        )}
      </div>
    </>
  );
}
