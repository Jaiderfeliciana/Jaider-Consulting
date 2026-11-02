"use client";

import { useState } from "react";
import { niceTicks, useWidth } from "./useWidth";

type Point = { label: string; value: number; extra: string };

// Single-series line + soft area with a crosshair that snaps to the nearest day.
export default function LineChart({ points, summary, unit }: { points: Point[]; summary: string; unit: string }) {
  const [ref, width] = useWidth<HTMLDivElement>();
  const [active, setActive] = useState<number | null>(null);
  const height = 200, top = 12, bottom = 28, left = 40;
  const plotW = width - left - 8, plotH = height - top - bottom;
  const ticks = niceTicks(Math.max(...points.map((p) => p.value), 0));
  const max = ticks[ticks.length - 1] || 1;
  const x = (i: number) => left + (points.length > 1 ? (i / (points.length - 1)) * plotW : plotW / 2);
  const y = (v: number) => top + plotH - (v / max) * plotH;
  const line = points.map((p, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(p.value).toFixed(1)}`).join(" ");
  const area = `${line} L${x(points.length - 1)},${y(0)} L${x(0)},${y(0)} Z`;
  const labelEvery = Math.ceil(points.length / Math.max(2, Math.floor(plotW / 70)));

  function onMove(e: React.PointerEvent<SVGRectElement>) {
    const box = e.currentTarget.getBoundingClientRect();
    const i = Math.round(((e.clientX - box.left) / box.width) * (points.length - 1));
    setActive(Math.min(points.length - 1, Math.max(0, i)));
  }

  const tip = active !== null ? points[active] : null;
  return (
    <div ref={ref} className="chart" onPointerLeave={() => setActive(null)}>
      <svg width={width} height={height} role="img" aria-label={summary}>
        <defs>
          <linearGradient id="area-fill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#6a3ff2" stopOpacity="0.22" />
            <stop offset="1" stopColor="#6a3ff2" stopOpacity="0" />
          </linearGradient>
        </defs>
        {ticks.map((t) => (
          <g key={t}>
            <line x1={left} x2={width} y1={y(t)} y2={y(t)} className="chart-grid" />
            <text x={left - 8} y={y(t)} className="chart-axis" textAnchor="end" dominantBaseline="middle">{t}</text>
          </g>
        ))}
        <path d={area} fill="url(#area-fill)" />
        <path d={line} className="chart-line" />
        {points.map((p, i) => (i % labelEvery === 0 || i === points.length - 1) && (
          <text key={p.label} x={x(i)} y={height - 8} className="chart-axis" textAnchor={i === 0 ? "start" : i === points.length - 1 ? "end" : "middle"}>{p.label}</text>
        ))}
        {tip && active !== null && (
          <g>
            <line x1={x(active)} x2={x(active)} y1={top} y2={y(0)} className="chart-crosshair" />
            <circle cx={x(active)} cy={y(tip.value)} r={5} className="chart-dot" />
          </g>
        )}
        <line x1={left} x2={width} y1={y(0)} y2={y(0)} className="chart-baseline" />
        <rect
          x={left} y={top} width={plotW} height={plotH} fill="transparent" tabIndex={0} aria-label={summary}
          onPointerMove={onMove} onFocus={() => setActive(points.length - 1)} onBlur={() => setActive(null)}
          onKeyDown={(e) => {
            if (e.key === "ArrowLeft") setActive((a) => Math.max(0, (a ?? points.length) - 1));
            if (e.key === "ArrowRight") setActive((a) => Math.min(points.length - 1, (a ?? -1) + 1));
          }}
        />
      </svg>
      {tip && active !== null && (
        <div className="chart-tip" style={{ left: Math.min(Math.max(x(active), 70), width - 70), top: Math.max(y(tip.value) - 10, 0) }}>
          <strong>{tip.value} {unit}</strong>
          <span>{tip.label} · {tip.extra}</span>
        </div>
      )}
    </div>
  );
}
