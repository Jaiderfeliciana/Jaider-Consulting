import { monthlyTerms, packages } from "@/content/site";

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
              <p className="package-once">one-time setup</p>
              <div className="features">
                {p.setup.map(([label, value]) => (
                  <div key={label} className="feature">
                    <span>{label}</span>
                    <span className={value ? undefined : "none"}>{value ?? "—"}</span>
                  </div>
                ))}
              </div>
              <div className="package-plan">
                <p className="package-monthly">Then <span>{p.monthly}</span>/month · <strong>{p.monthlyName}</strong></p>
                <p className="plan-label">Every month you get:</p>
                <ul>{p.monthlyIncludes.map((item) => <li key={item}>{item}</li>)}</ul>
              </div>
              <a href="#contact" data-inquiry={p.name} className={p.popular ? "btn btn-soft" : "btn btn-outline"}>Get a quote</a>
            </div>
          ))}
        </div>
        <p className="pricing-note">
          {monthlyTerms} Need just one thing? See individual prices under <a href="#services">services</a>. 1-on-1
          consultation: <span>$100 per hour</span>, free if you book a package afterwards. Every quote includes a fixed
          price and timeline. All prices in US dollars (USD), excl. BBO.
        </p>
      </div>
    </section>
  );
}
