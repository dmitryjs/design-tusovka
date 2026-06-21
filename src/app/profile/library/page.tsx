import { redirect } from "next/navigation";

import { LibraryWorkspace } from "@/components/entitlements/library-workspace";
import { getUserLibrary } from "@/lib/entitlements/library";
import { getCurrentUser } from "@/lib/auth/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function ProfileLibraryPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/sign-in?next=/profile/library");
  }

  const supabase = await createSupabaseServerClient();
  const libraryResult = await getUserLibrary(supabase);

  return (
    <LibraryWorkspace
      items={libraryResult.items}
      error={libraryResult.error}
    />
  );
}
