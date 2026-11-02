import Icon from "./Icon";
import { logout } from "@/app/admin/actions";

export default function Topbar() {
  return (
    <header className="topbar">
      <a href="/" target="_blank" rel="noopener" className="topbar-site">
        <Icon name="globe" size={18} />
        <span>jaiderfeliciana.com</span>
        <span className="topbar-site-hint">View website ↗</span>
      </a>
      <details className="topbar-user">
        <summary>
          <span className="topbar-avatar">JF</span>
          <span className="topbar-name">Jaider Feliciana</span>
          <Icon name="chevron" size={16} />
        </summary>
        <div className="topbar-menu">
          <a href="/admin/setup">Setup</a>
          <form action={logout}><button type="submit">Log out</button></form>
        </div>
      </details>
    </header>
  );
}
