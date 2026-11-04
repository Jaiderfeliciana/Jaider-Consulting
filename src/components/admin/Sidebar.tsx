"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Logo from "@/components/Logo";
import Icon from "./Icon";
import { adminNav, isActive } from "./nav";
import { logout } from "@/app/admin/actions";

// Grouped admin sidebar. On phones it folds into a menu button.
export default function Sidebar() {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [path]);
  const current = adminNav.flatMap((g) => g.pages).find((p) => isActive(p.href, path));

  return (
    <aside className={open ? "side is-open" : "side"}>
      <div className="side-head">
        <Link href="/admin" className="side-brand" aria-label="Admin dashboard">
          <span className="side-logo"><Logo id="jf-logo-side" /></span>
          <span>
            <span className="side-name">Jaider Feliciana</span>
            <span className="side-role">Admin</span>
          </span>
        </Link>
        <button type="button" className="side-toggle" aria-expanded={open} aria-controls="admin-menu" onClick={() => setOpen(!open)}>
          {open ? "Close" : current?.label ?? "Menu"} <Icon name="chevron" size={16} />
        </button>
      </div>

      <nav id="admin-menu" className="side-nav" aria-label="Admin">
        {adminNav.map((g) => (
          <div key={g.group} className="side-group">
            <p className="side-group-label">{g.group}</p>
            {g.pages.map((p) => {
              const active = isActive(p.href, path);
              return (
                <Link key={p.href} href={p.href} className={active ? "is-active" : undefined} aria-current={active ? "page" : undefined}>
                  <Icon name={p.icon} size={19} />
                  {p.label}
                </Link>
              );
            })}
          </div>
        ))}
        <div className="side-links">
          <a href="/" target="_blank" rel="noopener"><Icon name="globe" size={17} /> View website ↗</a>
          <a href="/book" target="_blank" rel="noopener"><Icon name="calendar" size={17} /> Booking page ↗</a>
        </div>
        <div className="side-user">
          <span className="side-avatar">JF</span>
          <span className="side-user-text">
            <span className="side-user-name">Jaider Feliciana</span>
            <span className="side-user-role">Administrator</span>
          </span>
          <form action={logout}>
            <button type="submit" className="side-logout" aria-label="Log out" title="Log out"><Icon name="logout" size={18} /></button>
          </form>
        </div>
      </nav>
    </aside>
  );
}
