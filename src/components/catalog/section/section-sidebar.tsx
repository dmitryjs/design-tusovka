import {
  BookOpen,
  FileText,
  Infinity,
  Layers,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";

import { SectionPurchaseCta } from "@/components/catalog/section/section-purchase-cta";
import { formatPrice } from "@/lib/catalog/format";
import {
  sectionMaterialsCountLabel,
  sectionPracticeCountLabel,
} from "@/lib/catalog/section-detail-utils";
import type { SectionDetail } from "@/lib/catalog/detail-queries";
import type { PaidProductCartState } from "@/lib/cart/types";
import { cn } from "@/lib/utils";

type SectionSidebarProps = {
  section: SectionDetail;
  cartState: PaidProductCartState;
  signInReturnPath: string;
  className?: string;
};

function SidebarCard({
  title,
  children,
  className,
  id,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section
      id={id}
      className={cn(
        "rounded-xl border border-neutral-200 bg-white p-4 shadow-sm sm:p-5",
        className,
      )}
    >
      <h2 className="mb-4 text-base font-semibold text-foreground">{title}</h2>
      {children}
    </section>
  );
}

function IncludeRow({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <li className="flex items-start gap-3 text-sm leading-5 text-neutral-700">
      <span className="mt-0.5 shrink-0 text-neutral-400" aria-hidden>
        {icon}
      </span>
      <span>{children}</span>
    </li>
  );
}

export function SectionSidebar({
  section,
  cartState,
  signInReturnPath,
  className,
}: SectionSidebarProps) {
  return (
    <div className={cn("flex flex-col gap-6", className)}>
      <SidebarCard id="section-purchase" title="Купить раздел">
        <div className="space-y-4">
          <div>
            <span className="text-3xl font-semibold text-foreground">
              {formatPrice(section.priceKopecks)}
            </span>
            <p className="mt-1 text-sm text-neutral-500">
              Полный доступ ко всем материалам раздела, включая платные
            </p>
          </div>

          <SectionPurchaseCta
            catalogSlug={section.catalogSlug}
            priceKopecks={section.priceKopecks}
            cartState={cartState}
            signInReturnPath={signInReturnPath}
            fullWidth
            label={`Купить за ${formatPrice(section.priceKopecks)}`}
          />

          <p className="flex items-center justify-center gap-1.5 text-xs text-neutral-500">
            <ShieldCheck className="size-3.5 shrink-0" aria-hidden />
            Безопасная оплата
          </p>
        </div>
      </SidebarCard>

      <SidebarCard title="Что входит в раздел">
        <ul className="flex flex-col gap-3">
          <IncludeRow icon={<FileText className="size-4" />}>
            {section.stats.materialCount}{" "}
            {sectionMaterialsCountLabel(section.stats.materialCount)}
          </IncludeRow>
          {section.stats.practiceCount > 0 ? (
            <IncludeRow icon={<Layers className="size-4" />}>
              {section.stats.practiceCount}{" "}
              {sectionPracticeCountLabel(section.stats.practiceCount)}
            </IncludeRow>
          ) : null}
          {section.stats.templateCount > 0 ? (
            <IncludeRow icon={<BookOpen className="size-4" />}>
              {section.stats.templateCount} шаблонов
            </IncludeRow>
          ) : null}
          <IncludeRow icon={<Infinity className="size-4" />}>
            Пожизненный доступ после покупки
          </IncludeRow>
          <IncludeRow icon={<RefreshCw className="size-4" />}>
            Обновления уже купленного контента бесплатно
          </IncludeRow>
        </ul>
      </SidebarCard>

      {section.whatYouGet.length > 0 ? (
        <SidebarCard title="Что получите">
          <ul className="flex flex-col gap-2.5">
            {section.whatYouGet.map((item, index) => (
              <li key={index} className="flex gap-2.5 text-sm leading-5 text-neutral-700">
                <span
                  className="mt-1 size-1.5 shrink-0 rounded-full bg-primary"
                  aria-hidden
                />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </SidebarCard>
      ) : null}

      {section.forWhom.length > 0 ? (
        <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-4 sm:px-5">
          <p className="text-xs font-medium tracking-wide text-primary uppercase">
            Для кого
          </p>
          <ul className="mt-2 space-y-1.5 text-sm leading-5 text-neutral-700">
            {section.forWhom.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
