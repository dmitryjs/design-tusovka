"use client";

import Link from "next/link";
import { Eye } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import {
  createProductAction,
  updateProductAction,
} from "@/app/actions/admin/products";
import { AdminAlert } from "@/components/admin/admin-shell";
import { AdminUnderlineTabs } from "@/components/admin/admin-underline-tabs";
import { Button, buttonVariants } from "@/components/ui/button";
import { createMaterialBlock } from "@/lib/content/material-blocks";
import type { AdminProductFormInput } from "@/lib/admin/types";
import { cn } from "@/lib/utils";

import { MaterialAdminPreview } from "./material-admin-preview";
import { MaterialBasicInfoTab } from "./material-basic-info-tab";
import { MaterialBlockEditor } from "./material-block-editor/material-block-editor";
import { useMaterialDraftAutosave } from "./use-material-draft-autosave";

type SelectOption = { value: string; label: string };

type MaterialProductFormProps = {
  mode: "create" | "edit";
  productId?: string;
  initial: AdminProductFormInput;
  sections: SelectOption[];
  tags: SelectOption[];
  saved?: boolean;
};

type MaterialEditorTab = "info" | "content";

const TABS: Array<{ id: MaterialEditorTab; label: string }> = [
  { id: "info", label: "Основная информация" },
  { id: "content", label: "Контент" },
];

function buildSubmitPayload(form: AdminProductFormInput): AdminProductFormInput {
  const contentBlocks = form.contentBlocks.filter((block) => {
    const data = block.data as Record<string, unknown>;
    return Object.values(data).some((value) => {
      if (typeof value === "string") {
        return value.trim().length > 0;
      }

      if (Array.isArray(value)) {
        return value.length > 0;
      }

      return false;
    });
  });

  return {
    ...form,
    kind: "material",
    chapters: form.chapters[0]?.id
      ? [{ id: form.chapters[0].id, title: "Контент", contentText: "", position: 0 }]
      : [],
    contentBlocks: contentBlocks.length > 0 ? contentBlocks : [createMaterialBlock("paragraph")],
  };
}

export function MaterialProductForm({
  mode,
  productId,
  initial,
  sections,
  tags,
  saved,
}: MaterialProductFormProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<MaterialEditorTab>("info");
  const [previewOpen, setPreviewOpen] = useState(false);
  const [form, setForm] = useState<AdminProductFormInput>({
    ...initial,
    kind: "material",
    contentBlocks:
      initial.contentBlocks.length > 0
        ? initial.contentBlocks
        : [createMaterialBlock("paragraph")],
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(saved ?? false);
  const [autosaveHint, setAutosaveHint] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [isPreviewOpening, startPreviewTransition] = useTransition();

  const { flushDraftToServer, clearDraftStorage, markSaved } = useMaterialDraftAutosave({
    form,
    initial,
    mode,
    productId,
    onAutosaved: () => setAutosaveHint(true),
  });

  function updateForm<K extends keyof AdminProductFormInput>(
    key: K,
    value: AdminProductFormInput[K],
  ) {
    setForm((current) => ({ ...current, [key]: value }));
    setSuccess(false);
    setAutosaveHint(false);
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setFieldErrors({});
    setSuccess(false);

    const payload = buildSubmitPayload(form);

    startTransition(async () => {
      const result =
        mode === "create"
          ? await createProductAction(payload)
          : await updateProductAction(productId!, payload);

      if (result.fieldErrors) {
        setFieldErrors(result.fieldErrors);
        setActiveTab("info");
        return;
      }

      if (!result.ok) {
        setError(result.error ?? "Не удалось сохранить");
        return;
      }

      clearDraftStorage();
      markSaved(payload);
      setForm(payload);
      setSuccess(true);
      router.refresh();
    });
  }

  function handleOpenPreview() {
    startPreviewTransition(async () => {
      const savedDraft = await flushDraftToServer();
      if (!savedDraft && mode === "edit") {
        setError("Не удалось сохранить черновик перед предпросмотром");
        return;
      }

      setPreviewOpen(true);
    });
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {success ? (
          <AdminAlert variant="success">Изменения сохранены.</AdminAlert>
        ) : null}
        {error ? <AdminAlert variant="error">{error}</AdminAlert> : null}
        {autosaveHint && mode === "edit" ? (
          <p className="text-xs text-neutral-500" role="status">
            Черновик автоматически сохранён
          </p>
        ) : null}

        <div className="flex flex-wrap items-end justify-between gap-4">
          <AdminUnderlineTabs
            tabs={TABS}
            activeTab={activeTab}
            onChange={setActiveTab}
            className="min-w-0 flex-1"
          />
          <Button
            type="button"
            variant="outline"
            onClick={handleOpenPreview}
            disabled={isPending || isPreviewOpening}
          >
            <Eye className="size-4" aria-hidden />
            {isPreviewOpening ? "Сохраняем…" : "Предпросмотр"}
          </Button>
        </div>

        {activeTab === "info" ? (
          <MaterialBasicInfoTab
            form={form}
            fieldErrors={fieldErrors}
            sections={sections}
            tags={tags}
            isPending={isPending}
            mode={mode}
            onChange={updateForm}
          />
        ) : (
          <MaterialBlockEditor
            documentTitle={form.title}
            onDocumentTitleChange={(title) => updateForm("title", title)}
            blocks={form.contentBlocks}
            onChange={(contentBlocks) => updateForm("contentBlocks", contentBlocks)}
            disabled={isPending}
          />
        )}

        <div className="flex flex-wrap gap-2 border-t border-neutral-200 pt-4">
          <Button type="submit" disabled={isPending}>
            {isPending ? "Сохраняем…" : mode === "create" ? "Создать" : "Сохранить"}
          </Button>
          <Link href="/admin/products" className={cn(buttonVariants({ variant: "secondary" }))}>
            К списку
          </Link>
        </div>
      </form>

      {previewOpen ? (
        <MaterialAdminPreview
          form={form}
          productId={productId}
          tags={tags}
          sections={sections}
          onClose={() => setPreviewOpen(false)}
        />
      ) : null}
    </>
  );
}
