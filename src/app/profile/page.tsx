import { redirect } from "next/navigation";

import { ProfileDashboard } from "@/components/profile/profile-dashboard";
import { getProfileDashboardData } from "@/lib/profile/queries";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const data = await getProfileDashboardData();

  if (!data) {
    redirect("/auth/sign-in?next=/profile");
  }

  return <ProfileDashboard data={data} />;
}
