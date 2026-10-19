import Globe from "./Globe";
import ScanBox from "./ScanBox";

const chips = ["Live in 14 days", "Mobile-first", "Reply within 24h"];

export default function Hero() {
  return (
    <section id="top" className="hero">
      <div aria-hidden="true" className="hero-globe">
        <p>Jaider Feliciana</p>
        <Globe />
      </div>
      <div className="container hero-inner">
        <div className="hero-copy">
          <p className="hero-kicker"><span />Websites · Social media · Ads — Aruba</p>
          <h1>
            Websites that<br />bring you<br /><span className="gradient-text">more customers</span>.
          </h1>
          <p className="hero-lede">
            I build fast, professional websites and run your social media and ads, so people find you online,
            trust you, and contact you on WhatsApp.
          </p>
          <div className="hero-ctas">
            <a href="#contact" className="btn btn-primary">Book a free consultation</a>
            <a href="#services" className="btn btn-ghost">See my work ↘</a>
          </div>
          <ScanBox />
          <div className="chips">
            {chips.map((c) => (
              <span key={c} className="chip"><span className="chip-check">✓</span> {c}</span>
            ))}
            <a href="#course" className="chip">Course coming soon →</a>
          </div>
        </div>
      </div>
      <div aria-hidden="true" className="scroll-hint">
        <span>SCROLL</span>
        <span />
      </div>
    </section>
  );
}
