import { TasksPage } from "@/components/tasks/tasks-page";
import { getCatalogItems } from "@/lib/catalog/queries";

export const dynamic = "force-dynamic";

type TasksRouteProps = {
  searchParams: Promise<{ q?: string }>;
};

export default async function TasksRoute({ searchParams }: TasksRouteProps) {
  const { q } = await searchParams;
  const { items, error } = await getCatalogItems();

  return (
    <TasksPage
      initialItems={items}
      initialQuery={q ?? ""}
      error={error}
    />
  );
}
