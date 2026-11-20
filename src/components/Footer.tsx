import Logo from "./Logo";
import { whatsappHref } from "@/content/site";
import { servicePages } from "@/content/servicePages";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div className="brand">
          <Logo id="jf-logo-foot" />
          <span className="brand-name">Jaider Feliciana</span>
        </div>
        <div className="footer-links">
          <a href="/#services">services</a>
          <a href="/#pricing">pricing</a>
          <a href="/#course">course</a>
          <a href={whatsappHref()} target="_blank" rel="noopener" className="accent">whatsapp</a>
        </div>
      </div>
      <nav aria-label="Services" className="container footer-services">
        {servicePages.map((p) => <a key={p.slug} href={`/${p.slug}`}>{p.navLabel} Aruba</a>)}
      </nav>
    </footer>
  );
}
