import { Badge } from "@/components/ui/badge";
import { getKindLabel, getLevelLabel } from "@/lib/catalog/format";
import type { TaskDetail } from "@/lib/catalog/detail-queries";
import { getCatalogItemHref } from "@/lib/catalog/paths";
import type { FreeProductClaimState } from "@/lib/entitlements/types";
import type { PaidProductCartState } from "@/lib/cart/types";

import { FreeProductClaimCta } from "@/components/entitlements/free-product-claim-cta";
import { PaidProductCartCta } from "@/components/cart/paid-product-cart-cta";

import {
  CatalogComingSoonBlock,
  CatalogDetailFooterCta,
  CatalogDetailMeta,
  CatalogDetailSection,
  CatalogDetailShell,
  CatalogPreviewNotice,
  CatalogTagList,
} from "./catalog-detail-shell";

type TaskDetailViewProps = {
  task: TaskDetail;
  claimState: FreeProductClaimState;
  cartState: PaidProductCartState;
};

export function TaskDetailView({
  task,
  claimState,
  cartState,
}: TaskDetailViewProps) {
  return (
    <CatalogDetailShell
      breadcrumbs={[
        { label: "Главная", href: "/" },
        { label: "Задания", href: "/tasks" },
        { label: task.title },
      ]}
    >
      <CatalogDetailMeta
        kind="task"
        badges={
          <>
            <Badge variant="secondary">{getKindLabel("task")}</Badge>
            {task.level !== "all" ? (
              <Badge variant="outline">{getLevelLabel(task.level)}</Badge>
            ) : null}
          </>
        }
        title={task.title}
        description={task.description}
        priceKopecks={task.priceKopecks}
      />

      <CatalogTagList tags={task.tags} />

      {task.isPreview ? <CatalogPreviewNotice kind="task" /> : null}

      {!task.isPreview && task.brief.length > 0 ? (
        <CatalogDetailSection
          title="Бриф задания"
          description="Выполните пункты ниже — это основа для сдачи работы."
        >
          <ul className="space-y-2 rounded-xl border border-neutral-300 bg-card px-4 py-4 sm:px-5">
            {task.brief.map((item, index) => (
              <li
                key={index}
                className="flex gap-3 text-sm leading-6 text-neutral-700"
              >
                <span className="font-medium text-neutral-400">
                  {index + 1}.
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </CatalogDetailSection>
      ) : null}

      {!task.isPreview && task.submissionRequirements.length > 0 ? (
        <CatalogDetailSection
          title="Требования к сдаче"
          description="Формат и объём работы для проверки."
        >
          <ul className="space-y-2 rounded-xl border border-neutral-300 bg-card px-4 py-4 sm:px-5">
            {task.submissionRequirements.map((item, index) => (
              <li
                key={index}
                className="flex gap-3 text-sm leading-6 text-neutral-700"
              >
                <span className="font-medium text-neutral-400">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </CatalogDetailSection>
      ) : null}

      <CatalogDetailSection
        title="Проверка работы"
        description="На следующем этапе появятся способы получить обратную связь."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <CatalogComingSoonBlock
            title="AI-проверка"
            description="Автоматический разбор решения по критериям задания."
          />
          <CatalogComingSoonBlock
            title="Ручная проверка"
            description="Разбор от наставника с комментариями и рекомендациями."
          />
        </div>
      </CatalogDetailSection>

      {claimState !== "hidden" ? (
        <section className="space-y-3 border-t border-neutral-200 pt-8">
          <h2 className="text-lg font-semibold text-foreground">Сохранить в библиотеку</h2>
          <p className="text-sm leading-6 text-neutral-600">
            Бесплатное задание можно добавить в профиль для быстрого доступа.
          </p>
          <FreeProductClaimCta
            slug={task.slug}
            kind="task"
            initialState={claimState}
            signInReturnPath={getCatalogItemHref("task", task.slug)}
          />
        </section>
      ) : null}

      {cartState !== "hidden" ? (
        <section className="space-y-3 border-t border-neutral-200 pt-8">
          <h2 className="text-lg font-semibold text-foreground">Покупка</h2>
          <p className="text-sm leading-6 text-neutral-600">
            Платное задание можно добавить в корзину и оформить заказ.
          </p>
          <PaidProductCartCta
            slug={task.slug}
            kind="task"
            initialState={cartState}
            signInReturnPath={getCatalogItemHref("task", task.slug)}
          />
        </section>
      ) : null}

      <CatalogDetailFooterCta />
    </CatalogDetailShell>
  );
}
