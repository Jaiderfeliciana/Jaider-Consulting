"use client";

import { useState } from "react";
import { niceTicks, useWidth } from "./useWidth";

type Point = { label: string; value: number; extra?: string };

const fmt = (kind: "usd" | "count", n: number, axis = false) =>
  kind === "usd"
    ? axis && n >= 1000 ? `$${n / 1000}k` : `$${n.toLocaleString("en-US", { maximumFractionDigits: 2 })}`
    : n.toLocaleString("en-US");

// Single-series smooth area chart with a crosshair that snaps to the nearest point.
export default function LineChart({ points, summary, kind = "count", unit = "" }: { points: Point[]; summary: string; kind?: "usd" | "count"; unit?: string }) {
  const [ref, width] = useWidth<HTMLDivElement>();
  const [active, setActive] = useState<number | null>(null);
  const height = 240, top = 16, bottom = 30, left = 48;
  const plotW = width - left - 10, plotH = height - top - bottom;
  const ticks = niceTicks(Math.max(...points.map((p) => p.value), 0));
  const max = ticks[ticks.length - 1] || 1;
  const x = (i: number) => left + (points.length > 1 ? (i / (points.length - 1)) * plotW : plotW / 2);
  const y = (v: number) => top + plotH - (v / max) * plotH;
  const n = points.length;
  let line = `M${x(0)},${y(points[0]?.value ?? 0)}`;
  for (let i = 0; i < n - 1; i++) {
    const v = (k: number) => points[Math.min(n - 1, Math.max(0, k))].value;
    const xi = (k: number) => x(Math.min(n - 1, Math.max(0, k)));
    const c1y = Math.min(y(0), y(v(i)) + (y(v(i + 1)) - y(v(i - 1))) / 6);
    const c2y = Math.min(y(0), y(v(i + 1)) - (y(v(i + 2)) - y(v(i))) / 6);
    line += ` C${(x(i) + (xi(i + 1) - xi(i - 1)) / 6).toFixed(1)},${c1y.toFixed(1)} ${(x(i + 1) - (xi(i + 2) - xi(i)) / 6).toFixed(1)},${c2y.toFixed(1)} ${x(i + 1).toFixed(1)},${y(v(i + 1)).toFixed(1)}`;
  }
  const area = `${line} L${x(n - 1)},${y(0)} L${x(0)},${y(0)} Z`;
  const labelEvery = Math.ceil(n / Math.max(2, Math.floor(plotW / 64)));
  const fillId = `area-${kind}-${n}`;

  function onMove(e: React.PointerEvent<SVGRectElement>) {
    const box = e.currentTarget.getBoundingClientRect();
    setActive(Math.min(n - 1, Math.max(0, Math.round(((e.clientX - box.left) / box.width) * (n - 1)))));
  }

  const tip = active !== null ? points[active] : null;
  return (
    <div ref={ref} className="chart" onPointerLeave={() => setActive(null)}>
      <svg width={width} height={height} role="img" aria-label={summary}>
        <defs>
          <linearGradient id={fillId} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#7c4dff" stopOpacity="0.32" />
            <stop offset="1" stopColor="#7c4dff" stopOpacity="0.02" />
          </linearGradient>
        </defs>
        {ticks.map((t) => (
          <g key={t}>
            <line x1={left} x2={width} y1={y(t)} y2={y(t)} className="chart-grid" />
            <text x={left - 10} y={y(t)} className="chart-axis" textAnchor="end" dominantBaseline="middle">{fmt(kind, t, true)}</text>
          </g>
        ))}
        <path d={area} fill={`url(#${fillId})`} />
        <path d={line} className="chart-line" />
        {points.map((p, i) => (i % labelEvery === 0 || i === n - 1) && (
          <text key={p.label + i} x={x(i)} y={height - 8} className={active === i ? "chart-axis is-active" : "chart-axis"} textAnchor={i === 0 ? "start" : i === n - 1 ? "end" : "middle"}>{p.label}</text>
        ))}
        {tip && active !== null && (
          <g>
            <line x1={x(active)} x2={x(active)} y1={y(tip.value)} y2={y(0)} className="chart-crosshair" />
            <circle cx={x(active)} cy={y(tip.value)} r={6} className="chart-dot" />
          </g>
        )}
        <line x1={left} x2={width} y1={y(0)} y2={y(0)} className="chart-baseline" />
        <rect
          x={left} y={top} width={plotW} height={plotH} fill="transparent" tabIndex={0} aria-label={summary}
          onPointerMove={onMove} onFocus={() => setActive(n - 1)} onBlur={() => setActive(null)}
          onKeyDown={(e) => {
            if (e.key === "ArrowLeft") setActive((a) => Math.max(0, (a ?? n) - 1));
            if (e.key === "ArrowRight") setActive((a) => Math.min(n - 1, (a ?? -1) + 1));
          }}
        />
      </svg>
      {tip && active !== null && (
        <div className="chart-tip" style={{ left: Math.min(Math.max(x(active), 70), width - 70), top: Math.max(y(tip.value) - 14, 0) }}>
          <strong>{fmt(kind, tip.value)}{unit ? ` ${unit}` : ""}</strong>
          <span>{tip.label}{tip.extra ? ` · ${tip.extra}` : ""}</span>
        </div>
      )}
    </div>
  );
}
