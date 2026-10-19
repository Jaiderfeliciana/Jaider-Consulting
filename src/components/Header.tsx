import Logo from "./Logo";

export default function Header() {
  return (
    <header className="header">
      <a href="#top" aria-label="Jaider Feliciana — home" className="brand">
        <Logo id="jf-logo-head" />
        <span className="brand-name">Jaider Feliciana</span>
      </a>
      <nav className="nav">
        <a href="#services" className="nav-link">services</a>
        <a href="#course" className="nav-link">course</a>
        <a href="#pricing" className="nav-link">pricing</a>
        <a href="#contact" className="btn btn-primary nav-cta">free consultation</a>
      </nav>
    </header>
  );
}
