// Counts a conversion for the admin Visitors page: a booked consultation or a sent project inquiry.
export function trackGoal(goal: "consultation" | "inquiry") {
  try {
    const body = JSON.stringify({ goal });
    if (navigator.sendBeacon) navigator.sendBeacon("/api/track", new Blob([body], { type: "application/json" }));
    else fetch("/api/track", { method: "POST", body, headers: { "Content-Type": "application/json" }, keepalive: true }).catch(() => {});
  } catch {
    // Counting must never break the page.
  }
}
