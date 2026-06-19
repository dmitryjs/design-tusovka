import { redirect } from "next/navigation";

import { ProfileView } from "@/components/auth/profile-view";
import { getUserLibrary } from "@/lib/entitlements/library";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/sign-in?next=/profile");
  }

  const [{ data: profile, error: profileError }, libraryResult] =
    await Promise.all([
      supabase
        .from("profiles")
        .select("id, display_name, designer_level, created_at, updated_at")
        .eq("id", user.id)
        .maybeSingle(),
      getUserLibrary(supabase),
    ]);

  if (profileError) {
    throw new Error(profileError.message);
  }

  return (
    <ProfileView
      user={user}
      profile={profile}
      library={libraryResult.items}
      libraryError={libraryResult.error}
    />
  );
}
