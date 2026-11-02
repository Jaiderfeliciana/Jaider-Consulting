// Tiny trend line for a stat card. Decorative: the card's number and trend text carry the data.
export default function Sparkline({ values, color, id }: { values: number[]; color: string; id: string }) {
  const w = 200, h = 48, pad = 3;
  const max = Math.max(...values, 1);
  const x = (i: number) => (values.length > 1 ? (i / (values.length - 1)) * w : w / 2);
  const y = (v: number) => h - pad - (v / max) * (h - pad * 2);
  // Smooth curve through the points (Catmull-Rom converted to Bézier).
  let d = `M${x(0)},${y(values[0] ?? 0)}`;
  for (let i = 0; i < values.length - 1; i++) {
    const p0 = values[Math.max(0, i - 1)], p1 = values[i], p2 = values[i + 1], p3 = values[Math.min(values.length - 1, i + 2)];
    const c1x = x(i) + (x(i + 1) - x(Math.max(0, i - 1))) / 6, c1y = y(p1) + (y(p2) - y(p0)) / 6;
    const c2x = x(i + 1) - (x(Math.min(values.length - 1, i + 2)) - x(i)) / 6, c2y = y(p2) - (y(p3) - y(p1)) / 6;
    d += ` C${c1x.toFixed(1)},${Math.min(h, c1y).toFixed(1)} ${c2x.toFixed(1)},${Math.min(h, c2y).toFixed(1)} ${x(i + 1).toFixed(1)},${y(p2).toFixed(1)}`;
  }
  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="spark" aria-hidden="true">
      <defs>
        <linearGradient id={id} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor={color} stopOpacity="0.35" />
          <stop offset="1" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`${d} L${w},${h} L0,${h} Z`} fill={`url(#${id})`} />
      <path d={d} fill="none" stroke={color} strokeWidth="2" vectorEffect="non-scaling-stroke" strokeLinecap="round" />
    </svg>
  );
}
