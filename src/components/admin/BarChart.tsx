"use client";

import { useState } from "react";
import { niceTicks, useWidth } from "./useWidth";

type Bar = { label: string; value: number; detail: string };

// Axis labels in dollars: $500, $1.5k, $3k.
const usd = (n: number) => (n >= 1000 ? `$${n / 1000}k` : `$${n}`);

// Single-series bar chart of dollar amounts: one violet bar per period, with a hover/focus tooltip on each bar.
export default function BarChart({ bars, summary, average = false }: { bars: Bar[]; summary: string; average?: boolean }) {
  const [ref, width] = useWidth<HTMLDivElement>();
  const [active, setActive] = useState<number | null>(null);
  const height = 220, top = 12, bottom = 28, left = 52;
  const plotW = width - left - 4, plotH = height - top - bottom;
  const ticks = niceTicks(Math.max(...bars.map((b) => b.value), 0));
  const max = ticks[ticks.length - 1] || 1;
  const band = plotW / bars.length;
  const barW = Math.min(36, Math.max(6, band - 8));
  const y = (v: number) => top + plotH - (v / max) * plotH;
  const tip = active !== null ? bars[active] : null;
  const labelEvery = Math.max(1, Math.ceil(bars.length / Math.max(2, Math.floor(plotW / 46))));
  const mean = bars.reduce((s, b) => s + b.value, 0) / (bars.length || 1);

  return (
    <div ref={ref} className="chart" onPointerLeave={() => setActive(null)}>
      <svg width={width} height={height} role="img" aria-label={summary}>
        {ticks.map((t) => (
          <g key={t}>
            <line x1={left} x2={width} y1={y(t)} y2={y(t)} className="chart-grid" />
            <text x={left - 8} y={y(t)} className="chart-axis" textAnchor="end" dominantBaseline="middle">{usd(t)}</text>
          </g>
        ))}
        {bars.map((b, i) => {
          const x = left + band * i + (band - barW) / 2;
          const h = Math.max(0, y(0) - y(b.value));
          const r = Math.min(4, h, barW / 2);
          const yTop = y(0) - h;
          const path = h > 0
            ? `M${x},${y(0)} V${yTop + r} Q${x},${yTop} ${x + r},${yTop} H${x + barW - r} Q${x + barW},${yTop} ${x + barW},${yTop + r} V${y(0)} Z`
            : "";
          const showLabel = (bars.length - 1 - i) % labelEvery === 0;
          return (
            <g key={b.label}>
              {path && <path d={path} className={active === i ? "chart-bar is-active" : "chart-bar"} />}
              <rect
                x={left + band * i} y={top} width={band} height={plotH} fill="transparent"
                tabIndex={0} aria-label={`${b.label}: ${b.detail}`}
                onPointerEnter={() => setActive(i)} onFocus={() => setActive(i)} onBlur={() => setActive(null)}
              />
              {showLabel && <text x={left + band * i + band / 2} y={height - 8} className="chart-axis" textAnchor="middle">{b.label}</text>}
            </g>
          );
        })}
        {average && mean > 0 && (
          <g>
            <line x1={left} x2={width} y1={y(mean)} y2={y(mean)} className="chart-average" />
            <text x={width} y={y(mean) - 6} className="chart-axis" textAnchor="end">avg {usd(Math.round(mean))}</text>
          </g>
        )}
        <line x1={left} x2={width} y1={y(0)} y2={y(0)} className="chart-baseline" />
      </svg>
      {tip && active !== null && (
        <div className="chart-tip" style={{ left: Math.min(Math.max(left + band * active + band / 2, 70), width - 70), top: Math.max(y(tip.value) - 8, 0) }}>
          <strong>{tip.detail}</strong>
          <span>{tip.label}</span>
        </div>
      )}
    </div>
  );
}
