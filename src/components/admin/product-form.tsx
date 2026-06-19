"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import {
  createProductAction,
  updateProductAction,
} from "@/app/actions/admin/products";
import { AdminAlert } from "@/components/admin/admin-shell";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type {
  AdminChapterInput,
  AdminProductFormInput,
} from "@/lib/admin/types";
import { cn } from "@/lib/utils";

type SelectOption = { value: string; label: string };

type ProductFormProps = {
  mode: "create" | "edit";
  productId?: string;
  initial: AdminProductFormInput;
  sections: SelectOption[];
  tags: SelectOption[];
  saved?: boolean;
};

const KIND_OPTIONS: SelectOption[] = [
  { value: "material", label: "Материал" },
  { value: "task", label: "Задание" },
];

const STATUS_OPTIONS: SelectOption[] = [
  { value: "draft", label: "Черновик" },
  { value: "published", label: "Опубликован" },
  { value: "hidden", label: "Скрыт" },
];

const LEVEL_OPTIONS: SelectOption[] = [
  { value: "junior", label: "Junior" },
  { value: "middle", label: "Middle" },
  { value: "senior", label: "Senior" },
  { value: "all", label: "Все уровни" },
];

const FORMAT_OPTIONS: SelectOption[] = [
  { value: "mini_guide", label: "Мини-гайд" },
  { value: "full_guide", label: "Полный гайд" },
  { value: "notes", label: "Заметки" },
  { value: "checklist", label: "Чеклист" },
  { value: "template", label: "Шаблон" },
  { value: "cheat_sheet", label: "Шпаргалка" },
  { value: "lesson", label: "Урок" },
  { value: "practice", label: "Практика" },
];

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5 text-sm">
      <span className="font-medium text-foreground">{label}</span>
      {children}
      {error ? <span className="text-destructive-foreground">{error}</span> : null}
    </label>
  );
}

function SelectControl({
  value,
  onChange,
  options,
  disabled,
}: {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  disabled?: boolean;
}) {
  return (
    <select
      value={value}
      disabled={disabled}
      onChange={(event) => onChange(event.target.value)}
      className={cn(
        "h-10 w-full rounded-lg border border-neutral-300 bg-white px-3 text-sm",
        disabled && "opacity-60",
      )}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

export function ProductForm({
  mode,
  productId,
  initial,
  sections,
  tags,
  saved,
}: ProductFormProps) {
  const router = useRouter();
  const [form, setForm] = useState<AdminProductFormInput>(initial);
  const [chapters, setChapters] = useState<AdminChapterInput[]>(
    initial.chapters.length > 0
      ? initial.chapters
      : [{ title: "", contentText: "", position: 0 }],
  );
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(saved ?? false);
  const [isPending, startTransition] = useTransition();

  function updateForm<K extends keyof AdminProductFormInput>(
    key: K,
    value: AdminProductFormInput[K],
  ) {
    setForm((current) => ({ ...current, [key]: value }));
    setSuccess(false);
  }

  function toggleTag(tagId: string) {
    setForm((current) => ({
      ...current,
      tagIds: current.tagIds.includes(tagId)
        ? current.tagIds.filter((id) => id !== tagId)
        : [...current.tagIds, tagId],
    }));
    setSuccess(false);
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setFieldErrors({});
    setSuccess(false);

    const payload: AdminProductFormInput = {
      ...form,
      chapters: chapters
        .filter((chapter) => chapter.title.trim())
        .map((chapter, index) => ({
          ...chapter,
          position: index,
        })),
    };

    startTransition(async () => {
      const result =
        mode === "create"
          ? await createProductAction(payload)
          : await updateProductAction(productId!, payload);

      if (result.fieldErrors) {
        setFieldErrors(result.fieldErrors);
        return;
      }

      if (!result.ok) {
        setError(result.error ?? "Не удалось сохранить");
        return;
      }

      setSuccess(true);
      router.refresh();
    });
  }

  const isMaterial = form.kind === "material";

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {success ? (
        <AdminAlert variant="success">Изменения сохранены.</AdminAlert>
      ) : null}
      {error ? <AdminAlert variant="error">{error}</AdminAlert> : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Название" error={fieldErrors.title}>
          <Input
            value={form.title}
            onChange={(event) => updateForm("title", event.target.value)}
            disabled={isPending}
            required
          />
        </Field>
        <Field label="Slug" error={fieldErrors.slug}>
          <Input
            value={form.slug}
            onChange={(event) => updateForm("slug", event.target.value)}
            disabled={isPending || mode === "edit"}
            required
          />
        </Field>
      </div>

      <Field label="Описание">
        <textarea
          value={form.description}
          onChange={(event) => updateForm("description", event.target.value)}
          disabled={isPending}
          rows={4}
          className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Field label="Тип" error={fieldErrors.kind}>
          <SelectControl
            value={form.kind}
            onChange={(value) =>
              updateForm("kind", value as AdminProductFormInput["kind"])
            }
            options={KIND_OPTIONS}
            disabled={isPending || mode === "edit"}
          />
        </Field>
        <Field label="Уровень" error={fieldErrors.level}>
          <SelectControl
            value={form.level}
            onChange={(value) =>
              updateForm("level", value as AdminProductFormInput["level"])
            }
            options={LEVEL_OPTIONS}
            disabled={isPending}
          />
        </Field>
        <Field label="Цена, ₽" error={fieldErrors.priceRubles}>
          <Input
            type="number"
            min={0}
            step={1}
            value={form.priceRubles}
            onChange={(event) =>
              updateForm("priceRubles", Number(event.target.value))
            }
            disabled={isPending}
          />
        </Field>
        <Field label="Статус" error={fieldErrors.status}>
          <SelectControl
            value={form.status}
            onChange={(value) =>
              updateForm("status", value as AdminProductFormInput["status"])
            }
            options={STATUS_OPTIONS}
            disabled={isPending}
          />
        </Field>
      </div>

      {isMaterial ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Формат" error={fieldErrors.format}>
            <SelectControl
              value={form.format ?? "mini_guide"}
              onChange={(value) =>
                updateForm(
                  "format",
                  value as NonNullable<AdminProductFormInput["format"]>,
                )
              }
              options={FORMAT_OPTIONS}
              disabled={isPending}
            />
          </Field>
          <Field label="Раздел" error={fieldErrors.sectionProductId}>
            <SelectControl
              value={form.sectionProductId ?? ""}
              onChange={(value) => updateForm("sectionProductId", value)}
              options={[
                { value: "", label: "Выберите раздел" },
                ...sections,
              ]}
              disabled={isPending}
            />
          </Field>
        </div>
      ) : null}

      <fieldset className="space-y-2">
        <legend className="text-sm font-medium text-foreground">Теги</legend>
        <div className="flex flex-wrap gap-2">
          {tags.length === 0 ? (
            <p className="text-sm text-neutral-500">
              Тегов пока нет.{" "}
              <Link href="/admin/tags" className="text-primary hover:underline">
                Создать тег
              </Link>
            </p>
          ) : (
            tags.map((tag) => (
              <label
                key={tag.value}
                className="flex items-center gap-2 rounded-lg border border-neutral-300 px-3 py-2 text-sm"
              >
                <input
                  type="checkbox"
                  checked={form.tagIds.includes(tag.value)}
                  onChange={() => toggleTag(tag.value)}
                  disabled={isPending}
                />
                {tag.label}
              </label>
            ))
          )}
        </div>
      </fieldset>

      {isMaterial ? (
        <section className="space-y-4 rounded-xl border border-neutral-300 p-4">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-base font-semibold">Главы материала</h2>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={isPending}
              onClick={() =>
                setChapters((current) => [
                  ...current,
                  {
                    title: "",
                    contentText: "",
                    position: current.length,
                  },
                ])
              }
            >
              Добавить главу
            </Button>
          </div>
          {chapters.map((chapter, index) => (
            <div
              key={chapter.id ?? `new-${index}`}
              className="space-y-3 rounded-lg border border-neutral-200 bg-neutral-50 p-4"
            >
              <Field label={`Глава ${index + 1} — заголовок`}>
                <Input
                  value={chapter.title}
                  onChange={(event) =>
                    setChapters((current) =>
                      current.map((item, itemIndex) =>
                        itemIndex === index
                          ? { ...item, title: event.target.value }
                          : item,
                      ),
                    )
                  }
                  disabled={isPending}
                />
              </Field>
              <Field label="Текст главы">
                <textarea
                  value={chapter.contentText}
                  onChange={(event) =>
                    setChapters((current) =>
                      current.map((item, itemIndex) =>
                        itemIndex === index
                          ? { ...item, contentText: event.target.value }
                          : item,
                      ),
                    )
                  }
                  disabled={isPending}
                  rows={5}
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
                />
              </Field>
            </div>
          ))}
        </section>
      ) : (
        <section className="space-y-4 rounded-xl border border-neutral-300 p-4">
          <h2 className="text-base font-semibold">Контент задания</h2>
          <Field label="Бриф (по строке на пункт)">
            <textarea
              value={form.taskBriefText}
              onChange={(event) => updateForm("taskBriefText", event.target.value)}
              disabled={isPending}
              rows={6}
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
            />
          </Field>
          <Field label="Требования к сдаче (по строке на пункт)">
            <textarea
              value={form.taskSubmissionText}
              onChange={(event) =>
                updateForm("taskSubmissionText", event.target.value)
              }
              disabled={isPending}
              rows={5}
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
            />
          </Field>
        </section>
      )}

      <div className="flex flex-wrap gap-2">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Сохраняем…" : mode === "create" ? "Создать" : "Сохранить"}
        </Button>
        <Link href="/admin/products" className={cn(buttonVariants({ variant: "secondary" }))}>
          К списку
        </Link>
      </div>
    </form>
  );
}
