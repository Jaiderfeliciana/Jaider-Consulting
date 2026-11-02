type Slice = { name: string; color: string; value: number };

// Share of clients per service family. Each slice is labelled in the legend with its percentage.
export default function Donut({ slices }: { slices: Slice[] }) {
  const total = slices.reduce((s, x) => s + x.value, 0);
  const r = 60, c = 2 * Math.PI * r, gap = slices.filter((s) => s.value).length > 1 ? 3 : 0;
  let offset = 0;
  const top = [...slices].sort((a, b) => b.value - a.value)[0];
  const pct = (v: number) => (total ? Math.round((v / total) * 100) : 0);
  return (
    <div className="donut">
      <svg viewBox="0 0 160 160" width="168" height="168" role="img" aria-label={slices.map((s) => `${s.name} ${pct(s.value)}%`).join(", ")}>
        <circle cx="80" cy="80" r={r} fill="none" stroke="#ece9f8" strokeWidth="20" />
        {slices.filter((s) => s.value).map((s) => {
          const len = (s.value / total) * c;
          const el = (
            <circle key={s.name} cx="80" cy="80" r={r} fill="none" stroke={s.color} strokeWidth="20"
              strokeDasharray={`${Math.max(0, len - gap)} ${c}`} strokeDashoffset={-offset} transform="rotate(-90 80 80)">
              <title>{`${s.name}: ${s.value} client${s.value === 1 ? "" : "s"} (${pct(s.value)}%)`}</title>
            </circle>
          );
          offset += len;
          return el;
        })}
        <text x="80" y="74" textAnchor="middle" className="donut-pct">{pct(top?.value ?? 0)}%</text>
        <text x="80" y="96" textAnchor="middle" className="donut-sub">{top?.name ?? ""}</text>
      </svg>
      <ul className="donut-legend">
        {slices.map((s) => (
          <li key={s.name}>
            <span className="dot" style={{ background: s.color }} />
            <span>{s.name}</span>
            <strong>{pct(s.value)}%</strong>
          </li>
        ))}
      </ul>
    </div>
  );
}
