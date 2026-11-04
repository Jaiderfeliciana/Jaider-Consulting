// The admin menu: groups of pages, in sidebar order. Add new pages to the right group as they're built.
export const adminNav = [
  {
    group: "Overview",
    pages: [
      { href: "/admin", label: "Dashboard", icon: "dashboard" },
      { href: "/admin/visitors", label: "Analytics", icon: "chart" },
    ],
  },
  {
    group: "Business management",
    pages: [
      { href: "/admin/clients", label: "Clients / CRM", icon: "users" },
      { href: "/admin/leads", label: "Leads & Inquiries", icon: "star" },
      { href: "/admin/bookings", label: "Bookings", icon: "calendar" },
      { href: "/admin/agreements", label: "Contracts", icon: "folder" },
      { href: "/admin/tasks", label: "Tasks", icon: "check" },
    ],
  },
  {
    group: "Financial management",
    pages: [{ href: "/admin/earnings", label: "Finance & Payments", icon: "dollar" }],
  },
  {
    group: "Agency operations",
    pages: [{ href: "/admin/assistant", label: "AI Assistant", icon: "bolt" }],
  },
  {
    group: "System",
    pages: [{ href: "/admin/setup", label: "Integrations", icon: "settings" }],
  },
];

export const isActive = (href: string, path: string) => (href === "/admin" ? path === "/admin" : path.startsWith(href));
