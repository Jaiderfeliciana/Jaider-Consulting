"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "@/components/Logo";
import Icon from "./Icon";
import { adminPages, isActive } from "./nav";
import { logout } from "@/app/admin/actions";

export default function Topbar() {
  const path = usePathname();
  return (
    <header className="topbar">
      <Link href="/admin" className="topbar-logo" aria-label="Admin overview"><Logo id="jf-logo-top" /></Link>
      <nav className="topnav" aria-label="Admin pages">
        {adminPages.map((p) => (
          <Link key={p.href} href={p.href} className={isActive(p.href, path) ? "is-active" : undefined} aria-current={isActive(p.href, path) ? "page" : undefined}>
            {p.label}
          </Link>
        ))}
      </nav>
      <div className="topbar-tools">
        <a href="/" target="_blank" rel="noopener" className="tool" title="View website" aria-label="View website"><Icon name="globe" size={18} /></a>
        <a href="/book" target="_blank" rel="noopener" className="tool" title="Booking page" aria-label="Booking page"><Icon name="calendar" size={18} /></a>
        <Link href="/admin/tasks" className="tool" title="Tasks" aria-label="Tasks"><Icon name="check" size={18} /></Link>
        <details className="topbar-user">
          <summary aria-label="Account menu"><span className="topbar-avatar">JF</span></summary>
          <div className="topbar-menu">
            <p className="topbar-menu-name">Jaider Feliciana<span>Administrator</span></p>
            <Link href="/admin/setup">Setup</Link>
            <form action={logout}><button type="submit">Log out</button></form>
          </div>
        </details>
      </div>
    </header>
  );
}
