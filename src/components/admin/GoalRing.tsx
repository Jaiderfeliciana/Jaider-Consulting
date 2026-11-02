// Progress ring for the monthly earnings goal.
export default function GoalRing({ value, goal }: { value: number; goal: number }) {
  const pct = goal > 0 ? Math.min(100, Math.round((value / goal) * 100)) : 0;
  const r = 54, c = 2 * Math.PI * r;
  return (
    <svg viewBox="0 0 140 140" width="150" height="150" role="img" aria-label={`${pct}% of this month's goal reached`}>
      <circle cx="70" cy="70" r={r} fill="none" stroke="#ece9f8" strokeWidth="16" />
      <circle
        cx="70" cy="70" r={r} fill="none" stroke="url(#goal-grad)" strokeWidth="16" strokeLinecap="round"
        strokeDasharray={`${(pct / 100) * c} ${c}`} transform="rotate(-90 70 70)"
      />
      <defs>
        <linearGradient id="goal-grad" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="#6a3ff2" />
          <stop offset="1" stopColor="#d94ecb" />
        </linearGradient>
      </defs>
      <text x="70" y="70" textAnchor="middle" dominantBaseline="central" className="goal-pct">{pct}%</text>
    </svg>
  );
}
