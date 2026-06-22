import {
  AdminEmptyState,
  AdminForbidden,
  AdminShell,
} from "@/components/admin/admin-shell";
import { ReviewsTable } from "@/components/admin/reviews-table";
import { requireAdmin } from "@/lib/auth/admin";
import { listAdminReviews } from "@/lib/admin/reviews";

export const dynamic = "force-dynamic";

export default async function AdminReviewsPage() {
  const ctx = await requireAdmin("/admin/reviews");

  if (ctx.role !== "admin") {
    return <AdminForbidden />;
  }

  let reviews: Awaited<ReturnType<typeof listAdminReviews>> = [];
  let error: string | null = null;

  try {
    reviews = await listAdminReviews();
  } catch (loadError) {
    error = loadError instanceof Error ? loadError.message : "Не удалось загрузить отзывы";
  }

  return (
    <AdminShell
      title="Отзывы"
      description="Отзывы публикуются сразу. Здесь можно скрыть отзыв от посетителей сайта."
    >
      {error ? (
        <AdminEmptyState title="Ошибка загрузки" description={error} />
      ) : reviews.length === 0 ? (
        <AdminEmptyState
          title="Отзывов пока нет"
          description="Когда пользователи начнут оставлять отзывы, они появятся в этом списке."
        />
      ) : (
        <ReviewsTable reviews={reviews} />
      )}
    </AdminShell>
  );
}
