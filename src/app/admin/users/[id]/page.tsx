import Link from "next/link";
import { notFound } from "next/navigation";

import {
  AdminForbidden,
  AdminShell,
} from "@/components/admin/admin-shell";
import { UserDetailPanel } from "@/components/admin/user-detail-panel";
import { requireAdmin } from "@/lib/auth/admin";
import {
  getAdminUserDetail,
  listPublishedProductsForGrant,
} from "@/lib/admin/users";
import { buttonVariants } from "@/components/ui/button";

export const dynamic = "force-dynamic";

type AdminUserDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminUserDetailPage({ params }: AdminUserDetailPageProps) {
  const { id } = await params;
  const ctx = await requireAdmin(`/admin/users/${id}`);

  if (ctx.role !== "admin") {
    return <AdminForbidden />;
  }

  const [user, products] = await Promise.all([
    getAdminUserDetail(id),
    listPublishedProductsForGrant(),
  ]);

  if (!user) {
    notFound();
  }

  return (
    <AdminShell
      title="Пользователь"
      description="Карточка профиля и управление доступами."
      actions={
        <Link href="/admin/users" className={buttonVariants({ variant: "secondary" })}>
          К списку
        </Link>
      }
    >
      <UserDetailPanel user={user} products={products} />
    </AdminShell>
  );
}
