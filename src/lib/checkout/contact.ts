import "server-only";

import { getProfileSettingsData } from "@/lib/profile/queries";

export type CheckoutContact = {
  email: string;
  displayName: string | null;
  emailConfirmed: boolean;
};

export async function getCheckoutContact(): Promise<CheckoutContact | null> {
  const settings = await getProfileSettingsData();

  if (!settings?.profile.user.email) {
    return null;
  }

  return {
    email: settings.profile.user.email,
    displayName: settings.profile.profile.display_name,
    emailConfirmed: settings.emailConfirmed,
  };
}
