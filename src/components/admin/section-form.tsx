"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { ExternalLink, Trash2 } from "lucide-react";

import {
  createSectionAction,
  deleteSectionAction,
  updateSectionAction,
  updateSectionStatusAction,
} from "@/app/actions/admin/sections";
import { AdminAlert } from "@/components/admin/admin-shell";
import { SectionCoverField } from "@/components/admin/section-cover-field";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  SECTION_SITE_VISIBILITY_LABELS,
  type SectionSiteVisibilityState,
} from "@/lib/catalog/section-visibility";
import type { AdminSectionFormInput, AdminSectionListItem } from "@/lib/admin/types";
import { cn } from "@/lib/utils";

const STATUS_LABELS: Record<AdminSectionFormInput["status"], string> = {
  draft: "Черновик",
  published: "Опубликован",
  hidden: "Скрыт",
};

const STATUS_OPTIONS = (
  Object.entries(STATUS_LABELS) as Array<[AdminSectionFormInput["status"], string]>
).map(([value, label]) => ({ value, label }));

function siteVisibilityBadgeClass(state: SectionSiteVisibilityState): string {
  switch (state) {
    case "on_site":
      return "bg-emerald-50 text-emerald-700";
    case "no_materials":
      return "bg-amber-50 text-amber-700";
    case "draft":
      return "bg-neutral-100 text-neutral-600";
    case "hidden":
      return "bg-neutral-100 text-neutral-600";
  }
}

type SectionFormProps = {
  mode: "create" | "edit";
  sectionId?: string;
  initial: AdminSectionFormInput;
  onSuccess?: () => void;
  onDeleted?: () => void;
};

export function SectionForm({
  mode,
  sectionId,
  initial,
  onSuccess,
  onDeleted,
}: SectionFormProps) {
  const router = useRouter();
  const [form, setForm] = useState(initial);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [isDeleting, startDelete] = useTransition();

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setFieldErrors({});
    setSuccess(false);

    startTransition(async () => {
      const result =
        mode === "create"
          ? await createSectionAction(form)
          : await updateSectionAction(sectionId!, form);

      if (result.fieldErrors) {
        setFieldErrors(result.fieldErrors);
        return;
      }

      if (!result.ok) {
        setError(result.error ?? "Не удалось сохранить");
        return;
      }

      setSuccess(true);
      onSuccess?.();
      router.refresh();
    });
  }

  function handleDelete() {
    if (!sectionId) {
      return;
    }

    const confirmed = window.confirm(
      `Удалить раздел «${form.title}»? Это действие нельзя отменить.`,
    );

    if (!confirmed) {
      return;
    }

    setError(null);
    setSuccess(false);

    startDelete(async () => {
      const result = await deleteSectionAction(sectionId);

      if (!result.ok) {
        setError(result.error ?? "Не удалось удалить раздел");
        return;
      }

      onDeleted?.();
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {success ? (
        <AdminAlert variant="success">Раздел сохранён.</AdminAlert>
      ) : null}
      {error ? <AdminAlert variant="error">{error}</AdminAlert> : null}

      <SectionCoverField
        coverPath={form.coverPath}
        disabled={isPending || isDeleting}
        onChange={(coverPath) => setForm((current) => ({ ...current, coverPath }))}
      />

      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium">Название</span>
        <Input
          value={form.title}
          onChange={(event) =>
            setForm((current) => ({ ...current, title: event.target.value }))
          }
          disabled={isPending || isDeleting}
        />
        {fieldErrors.title ? (
          <span className="text-destructive-foreground">{fieldErrors.title}</span>
        ) : null}
      </label>

      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium">Slug</span>
        <Input
          value={form.slug}
          onChange={(event) =>
            setForm((current) => ({ ...current, slug: event.target.value }))
          }
          disabled={isPending || isDeleting || mode === "edit"}
        />
        {fieldErrors.slug ? (
          <span className="text-destructive-foreground">{fieldErrors.slug}</span>
        ) : null}
      </label>

      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium">Описание</span>
        <textarea
          value={form.description}
          onChange={(event) =>
            setForm((current) => ({
              ...current,
              description: event.target.value,
            }))
          }
          disabled={isPending || isDeleting}
          rows={3}
          className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
        />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium">Статус</span>
          <select
            value={form.status}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                status: event.target.value as AdminSectionFormInput["status"],
              }))
            }
            disabled={isPending || isDeleting}
            className="h-10 rounded-lg border border-neutral-300 px-3 text-sm"
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium">Позиция</span>
          <Input
            type="number"
            min={0}
            value={form.position}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                position: Number(event.target.value),
              }))
            }
            disabled={isPending || isDeleting}
          />
        </label>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button type="submit" disabled={isPending || isDeleting} className="w-fit">
          {isPending ? "Сохраняем…" : mode === "create" ? "Создать раздел" : "Сохранить"}
        </Button>
        {mode === "edit" && sectionId ? (
          <Button
            type="button"
            variant="ghost"
            disabled={isPending || isDeleting}
            onClick={handleDelete}
            className="text-destructive-foreground hover:text-destructive-foreground"
          >
            <Trash2 className="size-4" aria-hidden />
            {isDeleting ? "Удаляем…" : "Удалить раздел"}
          </Button>
        ) : null}
      </div>
    </form>
  );
}

export function SectionsManager({
  sections,
}: {
  sections: AdminSectionListItem[];
}) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const sortedSections = [...sections].sort(
    (left, right) =>
      left.position - right.position || left.title.localeCompare(right.title, "ru"),
  );
  const editing = sortedSections.find((section) => section.id === editingId);

  function setSectionStatus(sectionId: string, status: AdminSectionFormInput["status"]) {
    setError(null);
    startTransition(async () => {
      const result = await updateSectionStatusAction(sectionId, status);

      if (!result.ok) {
        setError(result.error ?? "Не удалось обновить статус");
        return;
      }

      router.refresh();
    });
  }

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <section className="space-y-4">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-base font-semibold">Список разделов</h2>
          <Button
            type="button"
            size="sm"
            variant="secondary"
            onClick={() => {
              setShowCreate(true);
              setEditingId(null);
            }}
          >
            Создать
          </Button>
        </div>

        <p className="text-sm text-neutral-500">
          Раздел появляется на главной и в каталоге, если он опубликован и в нём есть
          хотя бы один опубликованный материал. Скрытый или черновой раздел не виден
          посетителям.
        </p>

        {error ? <AdminAlert variant="error">{error}</AdminAlert> : null}

        {sortedSections.length === 0 ? (
          <p className="text-sm text-neutral-500">Разделов пока нет.</p>
        ) : (
          <ul className="space-y-2">
            {sortedSections.map((section) => (
              <li key={section.id}>
                <div
                  className={cn(
                    "rounded-lg border px-4 py-3 text-sm transition-colors",
                    editingId === section.id
                      ? "border-primary bg-blue-50"
                      : "border-neutral-300",
                  )}
                >
                  <button
                    type="button"
                    onClick={() => {
                      setEditingId(section.id);
                      setShowCreate(false);
                    }}
                    className="w-full text-left"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <p className="font-medium text-foreground">{section.title}</p>
                      <div className="flex flex-wrap items-center gap-1.5">
                        <Badge
                          variant="secondary"
                          className={cn(
                            "border-0",
                            siteVisibilityBadgeClass(section.siteVisibility),
                          )}
                        >
                          {SECTION_SITE_VISIBILITY_LABELS[section.siteVisibility]}
                        </Badge>
                        <Badge variant="secondary" className="border-0 bg-neutral-100">
                          {STATUS_LABELS[section.status]}
                        </Badge>
                      </div>
                    </div>
                    <p className="mt-1 text-neutral-500">
                      {section.slug} · позиция {section.position} ·{" "}
                      {section.publishedMaterialCount}{" "}
                      {section.publishedMaterialCount === 1
                        ? "материал"
                        : section.publishedMaterialCount >= 2 &&
                            section.publishedMaterialCount <= 4
                          ? "материала"
                          : "материалов"}
                    </p>
                  </button>

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    {section.isVisibleOnSite ? (
                      <Link
                        href={`/sections/${section.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                      >
                        Открыть на сайте
                        <ExternalLink className="size-3" aria-hidden />
                      </Link>
                    ) : null}
                    {section.status === "published" ? (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        disabled={isPending}
                        onClick={() => setSectionStatus(section.id, "hidden")}
                      >
                        Скрыть
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        disabled={isPending}
                        onClick={() => setSectionStatus(section.id, "published")}
                      >
                        {section.status === "draft" ? "Опубликовать" : "Показать"}
                      </Button>
                    )}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      disabled={isPending}
                      onClick={() => {
                        setEditingId(section.id);
                        setShowCreate(false);
                      }}
                    >
                      Редактировать
                    </Button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-xl border border-neutral-300 p-4">
        {showCreate ? (
          <>
            <h2 className="mb-4 text-base font-semibold">Новый раздел</h2>
            <SectionForm
              mode="create"
              initial={{
                title: "",
                slug: "",
                description: "",
                status: "draft",
                position: sortedSections.length,
                coverPath: null,
              }}
              onSuccess={() => setShowCreate(false)}
            />
          </>
        ) : editing ? (
          <>
            <h2 className="mb-4 text-base font-semibold">Редактирование</h2>
            <SectionForm
              key={editing.id}
              mode="edit"
              sectionId={editing.id}
              initial={editing}
              onDeleted={() => setEditingId(null)}
            />
          </>
        ) : (
          <p className="text-sm text-neutral-500">
            Выберите раздел из списка или создайте новый.
          </p>
        )}
      </section>
    </div>
  );
}
