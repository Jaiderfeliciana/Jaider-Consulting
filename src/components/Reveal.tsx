"use client";

import { useEffect } from "react";

// Fades section content up as it scrolls into view.
export default function Reveal() {
  useEffect(() => {
    if (!("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const en of entries) {
          if (en.isIntersecting) {
            en.target.classList.add("reveal-in");
            io.unobserve(en.target);
          }
        }
      },
      { threshold: 0.12 },
    );
    document.querySelectorAll("main section > div > *").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return null;
}
