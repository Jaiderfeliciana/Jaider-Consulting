import type { Metadata } from "next";
import "./admin.css";

export const metadata: Metadata = {
  title: "Admin — Jaider Feliciana",
  description: "Private admin panel.",
  robots: { index: false, follow: false },
  openGraph: { title: "Admin — Jaider Feliciana", description: "Private admin panel." },
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return <div className="admin">{children}</div>;
}
