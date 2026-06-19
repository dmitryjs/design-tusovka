import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import {
  getKindLabel,
  getLevelLabel,
  getMaterialFormatLabel,
} from "@/lib/catalog/format";
import type { MaterialDetail } from "@/lib/catalog/detail-queries";
import { getCatalogItemHref } from "@/lib/catalog/paths";
import type { FreeProductClaimState } from "@/lib/entitlements/types";

import { FreeProductClaimCta } from "@/components/entitlements/free-product-claim-cta";

import {
  CatalogDetailFooterCta,
  CatalogDetailMeta,
  CatalogDetailSection,
  CatalogDetailShell,
  CatalogEmptyPanel,
  CatalogPreviewNotice,
  CatalogTagList,
} from "./catalog-detail-shell";

type MaterialDetailViewProps = {
  material: MaterialDetail;
  claimState: FreeProductClaimState;
};

export function MaterialDetailView({
  material,
  claimState,
}: MaterialDetailViewProps) {
  return (
    <CatalogDetailShell
      breadcrumbs={[
        { label: "Главная", href: "/" },
        { label: "Каталог", href: "/catalog" },
        { label: material.title },
      ]}
    >
      <CatalogDetailMeta
        kind="material"
        badges={
          <>
            <Badge variant="secondary">{getKindLabel("material")}</Badge>
            <Badge variant="outline">
              {getMaterialFormatLabel(material.format)}
            </Badge>
            {material.level !== "all" ? (
              <Badge variant="outline">{getLevelLabel(material.level)}</Badge>
            ) : null}
          </>
        }
        title={material.title}
        description={material.description}
        priceKopecks={material.priceKopecks}
      />

      <CatalogTagList tags={material.tags} />

      {material.section ? (
        <div className="rounded-xl border border-neutral-300 bg-neutral-50 px-4 py-3 text-sm text-neutral-700 sm:px-5">
          <span className="text-neutral-500">Раздел: </span>
          <Link
            href={getCatalogItemHref("section", material.section.slug)}
            className="font-medium text-primary hover:underline"
          >
            {material.section.title}
          </Link>
        </div>
      ) : null}

      {material.isPreview ? <CatalogPreviewNotice kind="material" /> : null}

      {material.chapters.length > 0 ? (
        <CatalogDetailSection
          title={material.isPreview ? "Оглавление" : "Содержание"}
          description={
            material.isPreview
              ? "Заголовки глав доступны в превью. Текст — после покупки."
              : `${material.chapters.length} ${chapterCountLabel(material.chapters.length)}`
          }
        >
          <ol className="flex flex-col gap-3 sm:gap-4">
            {material.chapters.map((chapter) => (
              <li key={chapter.id}>
                <article className="rounded-xl border border-neutral-300 bg-card px-4 py-4 sm:px-5">
                  <h3 className="text-base font-semibold text-foreground">
                    <span className="mr-2 text-neutral-400">
                      {chapter.position + 1}.
                    </span>
                    {chapter.title}
                  </h3>
                  {chapter.contentText ? (
                    <div className="mt-3 whitespace-pre-wrap text-sm leading-6 text-neutral-700">
                      {chapter.contentText}
                    </div>
                  ) : material.isPreview ? (
                    <p className="mt-2 text-sm text-neutral-500">
                      Текст главы откроется после покупки.
                    </p>
                  ) : null}
                </article>
              </li>
            ))}
          </ol>
        </CatalogDetailSection>
      ) : !material.isPreview ? (
        <CatalogEmptyPanel
          title="Содержание пока не добавлено"
          description="Когда появятся главы, они отобразятся здесь."
        />
      ) : null}

      {claimState !== "hidden" ? (
        <section className="space-y-3 border-t border-neutral-200 pt-8">
          <h2 className="text-lg font-semibold text-foreground">Сохранить в библиотеку</h2>
          <p className="text-sm leading-6 text-neutral-600">
            Бесплатный материал можно добавить в профиль, чтобы быстро вернуться к нему позже.
          </p>
          <FreeProductClaimCta
            slug={material.slug}
            kind="material"
            initialState={claimState}
            signInReturnPath={getCatalogItemHref("material", material.slug)}
          />
        </section>
      ) : null}

      <CatalogDetailFooterCta />
    </CatalogDetailShell>
  );
}

function chapterCountLabel(count: number): string {
  const mod10 = count % 10;
  const mod100 = count % 100;

  if (mod10 === 1 && mod100 !== 11) {
    return "глава";
  }

  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) {
    return "главы";
  }

  return "глав";
}
