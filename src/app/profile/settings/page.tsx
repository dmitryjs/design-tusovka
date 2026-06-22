import { redirect } from "next/navigation";

import { ProfileSettingsForm } from "@/components/profile/profile-settings-form";
import { getProfileSettingsData } from "@/lib/profile/queries";
import { isStorageUploadConfigured } from "@/lib/storage/config";

export const dynamic = "force-dynamic";

export default async function ProfileSettingsPage() {
  const data = await getProfileSettingsData();

  if (!data) {
    redirect("/auth/sign-in?next=/profile/settings");
  }

  return (
    <ProfileSettingsForm
      data={data}
      storageEnabled={isStorageUploadConfigured()}
    />
  );
}
