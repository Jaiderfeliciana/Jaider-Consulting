
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
          <a href="/book" className="btn btn-soft">Book a free consultation</a>
          <a href="#contact" className="btn btn-on-dark">Send a project inquiry</a>
        </div>
      </div>
    </section>
  );
}
