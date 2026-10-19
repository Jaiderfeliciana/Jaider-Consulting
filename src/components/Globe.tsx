"use client";

import { useEffect, useRef } from "react";

// Rotating dot-and-line globe drawn behind the hero headline.
export default function Globe() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cv = ref.current;
    const ctx = cv?.getContext("2d");
    if (!cv || !ctx) return;

    const N = 170;
    const ga = Math.PI * (3 - Math.sqrt(5));
    const pts: number[][] = [];
    for (let i = 0; i < N; i++) {
      const y = 1 - (i / (N - 1)) * 2, r = Math.sqrt(1 - y * y), t = ga * i;
      pts.push([Math.cos(t) * r, y, Math.sin(t) * r, Math.random() * 6.28]);
    }
    const pairs: [number, number][] = [];
    for (let i = 0; i < N; i++) for (let j = i + 1; j < N; j++) {
      const a = pts[i], b = pts[j];
      const d = (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2;
      if (d < 0.085) pairs.push([i, j]);
    }

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    const tick = (ts: number) => {
      const w = cv.clientWidth, h = cv.clientHeight, dpr = window.devicePixelRatio || 1;
      if (cv.width !== w * dpr) { cv.width = w * dpr; cv.height = h * dpr; }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      const R = Math.min(w, h) * 0.46, cx = w / 2, cy = h / 2;
      const rot = reduce ? 0.6 : ts * 0.00006, tilt = 0.32;
      const cr = Math.cos(rot), sr = Math.sin(rot), ct = Math.cos(tilt), st = Math.sin(tilt);
      const P = pts.map((p) => {
        const x = p[0] * cr + p[2] * sr, z0 = -p[0] * sr + p[2] * cr;
        const y = p[1] * ct - z0 * st, z = p[1] * st + z0 * ct;
        return [cx + x * R, cy + y * R, z, p[1], p[3]];
      });
      ctx.lineWidth = 1;
      for (const [i, j] of pairs) {
        const a = P[i], b = P[j], depth = ((a[2] + b[2]) / 2 + 1) / 2;
        ctx.strokeStyle = `rgba(106,63,242,${(0.05 + depth * 0.28).toFixed(3)})`;
        ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke();
      }
      for (const p of P) {
        const depth = (p[2] + 1) / 2, mix = (p[3] + 1) / 2;
        const tw = reduce ? 1 : 0.65 + 0.35 * Math.sin(ts * 0.002 + p[4]);
        const r = Math.round(106 + (217 - 106) * mix), g = Math.round(63 + (78 - 63) * mix), bl = Math.round(242 + (203 - 242) * mix);
        const rad = (1.2 + depth * 2.6) * tw;
        if (depth > 0.55) {
          ctx.fillStyle = `rgba(${r},${g},${bl},${(0.14 * depth * tw).toFixed(3)})`;
          ctx.beginPath(); ctx.arc(p[0], p[1], rad * 3.4, 0, 6.283); ctx.fill();
        }
        ctx.fillStyle = `rgba(${r},${g},${bl},${(0.25 + depth * 0.75).toFixed(3)})`;
        ctx.beginPath(); ctx.arc(p[0], p[1], rad, 0, 6.283); ctx.fill();
      }
      if (!reduce) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return <canvas ref={ref} />;
}
