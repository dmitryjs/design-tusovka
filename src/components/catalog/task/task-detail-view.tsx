import Link from "next/link";

import { Container } from "@/components/layout/container";
import {
  Breadcrumbs,
  type BreadcrumbItem,
} from "@/components/layout/breadcrumbs";
import { Button, buttonVariants } from "@/components/ui/button";
import { ProductReviewsSection } from "@/components/reviews/product-reviews-section";
import type { TaskDetail } from "@/lib/catalog/detail-queries";
import { getCatalogItemHref } from "@/lib/catalog/paths";
import type { PaidProductCartState } from "@/lib/cart/types";
import type { FreeProductClaimState } from "@/lib/entitlements/types";
import type { ProductReviewsData } from "@/lib/reviews/types";
import { cn } from "@/lib/utils";
import { Play } from "lucide-react";

import { TaskAccessCard } from "./task-access-card";
import { TaskActions } from "./task-actions";
import { buildTaskBriefSections } from "./task-brief-content";
import { TaskBriefSections } from "./task-brief-sections";
import { TaskHero } from "./task-hero";
import { TaskInfoBanner } from "./task-info-banner";
import { TaskPreviewNotice } from "./task-preview-notice";
import { TaskSidebar } from "./task-sidebar";
import { TaskSummaryGrid } from "./task-summary-grid";

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

            <div className="flex flex-col gap-6 lg:hidden">
              <TaskAccessCard {...accessCardProps} />
            </div>

            <TaskSummaryGrid task={task} />

            {task.isPreview ? <TaskPreviewNotice /> : null}

            {task.hasFullAccess ? (
              <>
                <TaskInfoBanner
                  aiReviewAvailable={task.aiReviewAvailable}
                  manualReviewAvailable={task.manualReviewAvailable}
                />
                <TaskActions hasFullAccess />
                <TaskBriefSections
                  sections={briefSections}
                  defaultOpenId="task-brief-steps"
                />
                <section className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-5 sm:px-6">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h2 className="text-base font-semibold text-foreground">
                        Готов начать?
                      </h2>
                      <p className="mt-1 text-sm leading-6 text-neutral-600">
                        Изучите бриф и приступайте к выполнению задания.
                      </p>
                    </div>
                    <div className="flex flex-col gap-2 sm:flex-row">
                      <Link
                        href="#task-brief"
                        className={cn(
                          buttonVariants({ variant: "outline" }),
                          "sm:min-w-[140px]",
                        )}
                      >
                        Открыть бриф
                      </Link>
                      <Button render={<Link href="#task-brief-steps" />} className="sm:min-w-[160px]">
                        <Play className="size-4 shrink-0" aria-hidden />
                        Начать задание
                      </Button>
                    </div>
                  </div>
                </section>
              </>
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
            <TaskAccessCard {...accessCardProps} />
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
