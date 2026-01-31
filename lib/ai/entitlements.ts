import type { UserType } from "@/app/(auth)/auth";

type Entitlements = {
  maxMessagesPerDay: number;
};

export const entitlementsByUserType: Record<UserType, Entitlements> = {
  /*
   * All users are guests with basic rate limits
   */
  guest: {
    maxMessagesPerDay: 100,
  },
};
