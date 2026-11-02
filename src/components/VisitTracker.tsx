"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

// Tells the admin panel's visitor counter that a page was viewed.
// "New visitor" means the first page view from this browser today.
export default function VisitTracker() {
  const path = usePathname();

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    let newVisitor = true;
    try {
      newVisitor = localStorage.getItem("jf_seen") !== today;
      localStorage.setItem("jf_seen", today);
    } catch {
      // Private browsing: count the view, treat as new.
    }
    const body = JSON.stringify({ path, newVisitor });
    if (navigator.sendBeacon) navigator.sendBeacon("/api/track", new Blob([body], { type: "application/json" }));
    else fetch("/api/track", { method: "POST", body, headers: { "Content-Type": "application/json" }, keepalive: true }).catch(() => {});
  }, [path]);

  return null;
}
