import { packages } from "@/content/site";

export default function Pricing() {
  return (
    <section id="pricing" className="section">
      <div className="container">
        <div className="section-head">
          <h2 className="h2">Clear packages, no surprises.</h2>
          <p className="eyebrow">03 / Pricing</p>
        </div>
        <div className="packages">
          {packages.map((p) => (
            <div key={p.tier} className={p.popular ? "package package-popular" : "package"}>
              {p.popular && <span className="badge">Most popular</span>}
              <p className="package-tier">{p.tier}</p>
              <h3>{p.name}</h3>
              <p className="package-price">{p.price}</p>
              <p className="package-once">one-time · setup</p>
              <p className="package-monthly">Then: <span>{p.monthly}</span> {p.monthlyNote}</p>
              <div className="features">
                {p.features.map(([label, value]) => (
                  <div key={label} className="feature">
                    <span>{label}</span>
                    <span className={value ? undefined : "none"}>{value ?? "—"}</span>
                  </div>
                ))}
              </div>
              <a href="#contact" className={p.popular ? "btn btn-soft" : "btn btn-outline"}>Get a quote</a>
            </div>
          ))}
        </div>
        <p className="pricing-note">
          Need just one thing? See individual prices under <a href="#services">services</a>. 1-on-1 consultation:{" "}
          <span>$95 per hour</span> — free if you book a package afterwards. All prices in US dollars (USD), excl. BBO.
        </p>
      </div>
    </section>
  );
}
