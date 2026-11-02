// Admin pages, in menu order. `tint` colors the page's icon tile in the left strip.
export const adminPages = [
  { href: "/admin", label: "Overview", icon: "dashboard", tint: "#8b5cf6" },
  { href: "/admin/bookings", label: "Bookings", icon: "calendar", tint: "#d94ecb" },
  { href: "/admin/clients", label: "Clients", icon: "users", tint: "#e0479e" },
  { href: "/admin/earnings", label: "Earnings", icon: "dollar", tint: "#e8a33d" },
  { href: "/admin/visitors", label: "Visitors", icon: "eye", tint: "#4ade80" },
  { href: "/admin/tasks", label: "Tasks", icon: "check", tint: "#f472b6" },
  { href: "/admin/agreements", label: "Agreements", icon: "folder", tint: "#c084fc" },
  { href: "/admin/setup", label: "Setup", icon: "settings", tint: "#60a5fa" },
];

export const isActive = (href: string, path: string) => (href === "/admin" ? path === "/admin" : path.startsWith(href));
