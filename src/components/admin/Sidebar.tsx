"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "@/components/Logo";
import Icon from "./Icon";
import { logout } from "@/app/admin/actions";

const links = [
  { href: "/admin", label: "Dashboard", icon: "dashboard" },
  { href: "/admin/bookings", label: "Bookings", icon: "calendar" },
  { href: "/admin/clients", label: "Clients", icon: "users" },
  { href: "/admin/earnings", label: "Earnings", icon: "dollar" },
  { href: "/admin/visitors", label: "Visitors", icon: "eye" },
  { href: "/admin/setup", label: "Setup", icon: "settings" },
];

export default function Sidebar() {
  const path = usePathname();
  return (
    <aside className="side">
      <div className="side-brand">
        <span className="side-avatar"><Logo id="jf-logo-admin" /></span>
        <div>
          <p className="side-name">Jaider Feliciana</p>
          <p className="side-role">Admin</p>
        </div>
      </div>
      <nav className="side-nav">
        {links.map((l) => {
          const active = l.href === "/admin" ? path === "/admin" : path.startsWith(l.href);
          return (
            <Link key={l.href} href={l.href} className={active ? "is-active" : undefined} aria-current={active ? "page" : undefined}>
              <Icon name={l.icon} size={21} />
              {l.label}
            </Link>
          );
        })}
      </nav>
      <div className="side-card">
        <Icon name="rocket" size={30} />
        <p className="side-card-title">Your booking page</p>
        <p>Share it so clients can book a session themselves.</p>
        <a href="/book" target="_blank" rel="noopener" className="side-card-btn">Open booking page</a>
      </div>
      <div className="side-user">
        <span className="side-user-avatar">JF</span>
        <div>
          <p className="side-user-name">Jaider Feliciana</p>
          <p className="side-user-role">Administrator</p>
        </div>
        <form action={logout}>
          <button type="submit" aria-label="Log out" title="Log out"><Icon name="logout" size={18} /></button>
        </form>
      </div>
    </aside>
  );
}
