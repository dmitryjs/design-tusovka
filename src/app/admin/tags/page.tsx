import {
  AdminForbidden,
  AdminShell,
} from "@/components/admin/admin-shell";
import { TagsManager } from "@/components/admin/tag-form";
import { requireAdmin } from "@/lib/auth/admin";
import { listAdminTags } from "@/lib/admin/tags";

export const dynamic = "force-dynamic";

export default async function AdminTagsPage() {
  const ctx = await requireAdmin("/admin/tags");

  if (ctx.role !== "admin") {
    return <AdminForbidden />;
  }

  const tags = await listAdminTags();

  return (
    <AdminShell title="Теги" description="Справочник тегов для продуктов.">
      <TagsManager tags={tags} />
    </AdminShell>
  );
}
