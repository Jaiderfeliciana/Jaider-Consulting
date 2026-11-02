// Admin panel settings you can change.
export const adminConfig = {
  // Earnings goal per month in US dollars, shown as the ring on the overview.
  monthlyGoal: 3000,
  // Client statuses, in the order a client usually moves through them.
  clientStatuses: ["Lead", "Active", "Done"] as const,
};

export type ClientStatus = (typeof adminConfig.clientStatuses)[number];
