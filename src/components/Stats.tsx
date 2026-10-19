import { stats } from "@/content/site";

export default function Stats() {
  return (
    <section className="stats">
      <div className="container stats-grid">
        {stats.map((s) => (
          <div key={s.label}>
            <p className="stat-value">{s.value}</p>
            <p className="stat-label">{s.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
