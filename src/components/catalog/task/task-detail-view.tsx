import { Container } from "@/components/layout/container";
import {
  Breadcrumbs,
  type BreadcrumbItem,
} from "@/components/layout/breadcrumbs";
import { ProductReviewsSection } from "@/components/reviews/product-reviews-section";
import type { TaskDetail } from "@/lib/catalog/detail-queries";
import { getCatalogItemHref } from "@/lib/catalog/paths";
import type { PaidProductCartState } from "@/lib/cart/types";
import type { FreeProductClaimState } from "@/lib/entitlements/types";
import type { ProductReviewsData } from "@/lib/reviews/types";

import { TaskAccessCard } from "./task-access-card";
import { buildTaskBriefSections } from "./task-brief-content";
import { TaskBriefSections } from "./task-brief-sections";
import { TaskHero } from "./task-hero";
import { TaskPreviewNotice } from "./task-preview-notice";
import { TaskSidebar } from "./task-sidebar";

type TaskDetailViewProps = {
  task: TaskDetail;
  claimState: FreeProductClaimState;
  cartState: PaidProductCartState;
  reviewsData: ProductReviewsData;
};

function buildBreadcrumbs(task: TaskDetail): BreadcrumbItem[] {
  return [
    { label: "Главная", href: "/" },
    { label: "Задания", href: "/tasks" },
    { label: task.title },
  ];
}

export function TaskDetailView({
  task,
  claimState,
  cartState,
  reviewsData,
}: TaskDetailViewProps) {
  const signInReturnPath = getCatalogItemHref("task", task.slug);
  const accessCardProps = {
    slug: task.slug,
    priceKopecks: task.priceKopecks,
    hasFullAccess: task.hasFullAccess,
    claimState,
    cartState,
    signInReturnPath,
  };
  const briefSections = task.hasFullAccess ? buildTaskBriefSections(task) : [];

  return (
    <Container className="py-6 md:py-8 lg:py-10">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 md:gap-8">
        <Breadcrumbs items={buildBreadcrumbs(task)} />

        <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_320px] xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="flex min-w-0 flex-col gap-6 md:gap-8">
            <TaskHero
              task={task}
              claimState={claimState}
              cartState={cartState}
              reviewStats={reviewsData.stats}
            />

            <div className="h-px w-full bg-neutral-200" />

            {!task.hasFullAccess ? (
              <div className="flex flex-col gap-6 lg:hidden">
                <TaskAccessCard {...accessCardProps} />
              </div>
            ) : null}

            {task.isPreview ? <TaskPreviewNotice /> : null}

            {task.hasFullAccess ? (
              <TaskBriefSections sections={briefSections} />
            ) : null}

            <ProductReviewsSection
              productId={task.id}
              productKind="task"
              productSlug={task.slug}
              signInReturnPath={signInReturnPath}
              reviewsData={reviewsData}
            />
          </div>

          <aside className="hidden flex-col gap-6 lg:sticky lg:top-20 lg:flex lg:self-start">
            {!task.hasFullAccess ? <TaskAccessCard {...accessCardProps} /> : null}
            <TaskSidebar task={task} claimState={claimState} cartState={cartState} />
          </aside>
        </div>

        <div className="flex flex-col gap-6 lg:hidden">
          <TaskSidebar task={task} claimState={claimState} cartState={cartState} />
        </div>
      </div>
    </Container>
  );
}
