"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import {
  createSectionAction,
  updateSectionAction,
} from "@/app/actions/admin/sections";
import { AdminAlert } from "@/components/admin/admin-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { AdminSectionFormInput } from "@/lib/admin/types";
import { cn } from "@/lib/utils";

const STATUS_OPTIONS = [
  { value: "draft", label: "Черновик" },
  { value: "published", label: "Опубликован" },
  { value: "hidden", label: "Скрыт" },
];

type SectionFormProps = {
  mode: "create" | "edit";
  sectionId?: string;
  initial: AdminSectionFormInput;
  onSuccess?: () => void;
};

export function SectionForm({
  mode,
  sectionId,
  initial,
  onSuccess,
}: SectionFormProps) {
  const router = useRouter();
  const [form, setForm] = useState(initial);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

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

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {success ? (
        <AdminAlert variant="success">Раздел сохранён.</AdminAlert>
      ) : null}
      {error ? <AdminAlert variant="error">{error}</AdminAlert> : null}

      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium">Название</span>
        <Input
          value={form.title}
          onChange={(event) =>
            setForm((current) => ({ ...current, title: event.target.value }))
          }
          disabled={isPending}
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
          disabled={isPending || mode === "edit"}
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
          disabled={isPending}
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
            disabled={isPending}
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
            disabled={isPending}
          />
        </label>
      </div>

      <Button type="submit" disabled={isPending} className="w-fit">
        {isPending ? "Сохраняем…" : mode === "create" ? "Создать раздел" : "Сохранить"}
      </Button>
    </form>
  );
}

export function SectionsManager({
  sections,
}: {
  sections: Array<AdminSectionFormInput & { id: string }>;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  const editing = sections.find((section) => section.id === editingId);

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
        {sections.length === 0 ? (
          <p className="text-sm text-neutral-500">Разделов пока нет.</p>
        ) : (
          <ul className="space-y-2">
            {sections.map((section) => (
              <li key={section.id}>
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(section.id);
                    setShowCreate(false);
                  }}
                  className={cn(
                    "w-full rounded-lg border px-4 py-3 text-left text-sm transition-colors",
                    editingId === section.id
                      ? "border-primary bg-blue-50"
                      : "border-neutral-300 hover:bg-neutral-50",
                  )}
                >
                  <p className="font-medium text-foreground">{section.title}</p>
                  <p className="text-neutral-500">
                    {section.slug} · {section.status}
                  </p>
                </button>
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
                position: sections.length,
              }}
              onSuccess={() => setShowCreate(false)}
            />
          </>
        ) : editing ? (
          <>
            <h2 className="mb-4 text-base font-semibold">Редактирование</h2>
            <SectionForm mode="edit" sectionId={editing.id} initial={editing} />
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
