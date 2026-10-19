import { processSteps } from "@/content/site";

export default function Process() {
  return (
    <section className="section">
      <div className="container">
        <p className="eyebrow" style={{ marginBottom: "clamp(26px,4vw,48px)" }}>04 / Process</p>
        <div className="process-grid">
          {processSteps.map((s, i) => (
            <div key={s.title} className="step">
              <p className="step-num">{String(i + 1).padStart(2, "0")}</p>
              <h3>{s.title}</h3>
              <p>{s.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
