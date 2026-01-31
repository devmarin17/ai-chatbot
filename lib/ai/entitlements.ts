// No authentication - entitlements not used
// Kept for compatibility with existing code

type Entitlements = {
  maxMessagesPerDay: number;
};

export const defaultEntitlements: Entitlements = {
  maxMessagesPerDay: 100,
};
