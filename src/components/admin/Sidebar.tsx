"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Icon from "./Icon";
import { adminPages, isActive } from "./nav";
import { logout } from "@/app/admin/actions";

// Narrow strip of colorful page icons on the left (desktop only).
export default function Sidebar() {
  const path = usePathname();
  return (
    <aside className="rail" aria-label="Pages">
      <nav className="rail-nav">
        {adminPages.map((p) => (
          <Link key={p.href} href={p.href} title={p.label} aria-label={p.label}
            className={isActive(p.href, path) ? "rail-tile is-active" : "rail-tile"}
            style={{ color: p.tint, background: `${p.tint}24`, boxShadow: isActive(p.href, path) ? `0 0 0 2px ${p.tint}, 0 0 22px ${p.tint}66` : undefined }}>
            <Icon name={p.icon} size={20} />
          </Link>
        ))}
      </nav>
      <div className="rail-foot">
        <span className="rail-avatar" title="Jaider Feliciana">JF</span>
        <form action={logout}>
          <button type="submit" className="rail-tile rail-logout" title="Log out" aria-label="Log out"><Icon name="logout" size={20} /></button>
        </form>
      </div>
    </aside>
  );
}
