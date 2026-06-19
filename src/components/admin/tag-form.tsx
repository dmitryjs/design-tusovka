"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { createTagAction, updateTagAction } from "@/app/actions/admin/tags";
import { AdminAlert } from "@/components/admin/admin-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { AdminTagFormInput, AdminTagListItem } from "@/lib/admin/types";
import { cn } from "@/lib/utils";

type TagFormProps = {
  mode: "create" | "edit";
  tagId?: string;
  initial: AdminTagFormInput;
  onSuccess?: () => void;
};

function TagForm({ mode, tagId, initial, onSuccess }: TagFormProps) {
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
          ? await createTagAction(form)
          : await updateTagAction(tagId!, form);

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
      {success ? <AdminAlert variant="success">Тег сохранён.</AdminAlert> : null}
      {error ? <AdminAlert variant="error">{error}</AdminAlert> : null}

      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium">Название</span>
        <Input
          value={form.name}
          onChange={(event) =>
            setForm((current) => ({ ...current, name: event.target.value }))
          }
          disabled={isPending}
        />
        {fieldErrors.name ? (
          <span className="text-destructive-foreground">{fieldErrors.name}</span>
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

      <Button type="submit" disabled={isPending} className="w-fit">
        {isPending ? "Сохраняем…" : mode === "create" ? "Создать тег" : "Сохранить"}
      </Button>
    </form>
  );
}

export function TagsManager({ tags }: { tags: AdminTagListItem[] }) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  const editing = tags.find((tag) => tag.id === editingId);

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <section className="space-y-4">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-base font-semibold">Список тегов</h2>
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
        {tags.length === 0 ? (
          <p className="text-sm text-neutral-500">Тегов пока нет.</p>
        ) : (
          <ul className="space-y-2">
            {tags.map((tag) => (
              <li key={tag.id}>
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(tag.id);
                    setShowCreate(false);
                  }}
                  className={cn(
                    "w-full rounded-lg border px-4 py-3 text-left text-sm transition-colors",
                    editingId === tag.id
                      ? "border-primary bg-blue-50"
                      : "border-neutral-300 hover:bg-neutral-50",
                  )}
                >
                  <p className="font-medium text-foreground">{tag.name}</p>
                  <p className="text-neutral-500">{tag.slug}</p>
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-xl border border-neutral-300 p-4">
        {showCreate ? (
          <>
            <h2 className="mb-4 text-base font-semibold">Новый тег</h2>
            <TagForm
              mode="create"
              initial={{ name: "", slug: "" }}
              onSuccess={() => setShowCreate(false)}
            />
          </>
        ) : editing ? (
          <>
            <h2 className="mb-4 text-base font-semibold">Редактирование</h2>
            <TagForm mode="edit" tagId={editing.id} initial={editing} />
          </>
        ) : (
          <p className="text-sm text-neutral-500">
            Выберите тег из списка или создайте новый.
          </p>
        )}
      </section>
    </div>
  );
}
