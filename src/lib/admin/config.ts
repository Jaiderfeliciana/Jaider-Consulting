// Admin panel settings you can change.
export const adminConfig = {
  // Client statuses, in the order a client usually moves through them.
  clientStatuses: ["Lead", "Active", "Done"] as const,
};

// Services grouped into families for the "Top services" ring. Each family keeps the same
// color everywhere; a service that isn't listed counts as "Other".
export const serviceGroups = [
  { name: "Websites & AI", color: "#6a3ff2", services: ["Website design", "Grok AI chatbot"] },
  { name: "Social & ads", color: "#e0479e", services: ["Social media marketing", "Ads (Meta / Google)"] },
  { name: "Branding & SEO", color: "#1d8fd8", services: ["Branding or logo", "SEO / Google"] },
  { name: "Consulting & course", color: "#d98a1c", services: ["1-on-1 consultation", "Online course"] },
];
export const otherGroup = { name: "Other", color: "#8b88a3" };

// How far along a client is, shown as the progress bar on the dashboard.
export const statusProgress: Record<string, number> = { Lead: 20, Active: 60, Done: 100 };

export type ClientStatus = (typeof adminConfig.clientStatuses)[number];
