import { whatsappHref } from "@/content/site";

export default function CtaBanner() {
  return (
    <section className="cta-wrap">
      <div className="container cta">
        <div aria-hidden="true" className="cta-glow-1" />
        <div aria-hidden="true" className="cta-glow-2" />
        <div className="cta-copy">
          <p>Ready when you are</p>
          <h2>More customers start with one message.</h2>
        </div>
        <div className="cta-actions">
          <a href={whatsappHref()} target="_blank" rel="noopener" className="btn btn-soft">Chat on WhatsApp</a>
          <a href="#pricing" className="btn btn-on-dark">See packages</a>
        </div>
      </div>
    </section>
  );
}
