"use client";

import { useEffect, useRef } from "react";

import { updateProductAction } from "@/app/actions/admin/products";
import type { AdminProductFormInput } from "@/lib/admin/types";

const AUTOSAVE_DEBOUNCE_MS = 4_000;

function draftStorageKey(productId?: string): string {
  return `admin:material-draft:${productId ?? "new"}`;
}

function buildAutosavePayload(form: AdminProductFormInput): AdminProductFormInput {
  return {
    ...form,
    kind: "material",
    chapters: form.chapters[0]?.id
      ? [{ id: form.chapters[0].id, title: "Контент", contentText: "", position: 0 }]
      : [],
    contentBlocks: form.contentBlocks,
  };
}

function serializePayload(form: AdminProductFormInput): string {
  return JSON.stringify(buildAutosavePayload(form));
}

type UseMaterialDraftAutosaveOptions = {
  form: AdminProductFormInput;
  initial: AdminProductFormInput;
  mode: "create" | "edit";
  productId?: string;
  onAutosaved?: () => void;
};

export function useMaterialDraftAutosave({
  form,
  initial,
  mode,
  productId,
  onAutosaved,
}: UseMaterialDraftAutosaveOptions) {
  const formRef = useRef(form);
  formRef.current = form;
  const lastSavedRef = useRef(serializePayload(initial));

  useEffect(() => {
    const storageKey = draftStorageKey(productId);
    const timeoutId = window.setTimeout(() => {
      sessionStorage.setItem(storageKey, JSON.stringify(formRef.current));
    }, 500);

    return () => window.clearTimeout(timeoutId);
  }, [form, productId]);

  useEffect(() => {
    if (mode !== "edit" || !productId) {
      return;
    }

    const serialized = serializePayload(form);
    if (serialized === lastSavedRef.current) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      void updateProductAction(productId, buildAutosavePayload(formRef.current)).then(
        (result) => {
          if (result.ok) {
            lastSavedRef.current = serializePayload(formRef.current);
            onAutosaved?.();
          }
        },
      );
    }, AUTOSAVE_DEBOUNCE_MS);

    return () => window.clearTimeout(timeoutId);
  }, [form, mode, onAutosaved, productId]);

  async function flushDraftToServer(): Promise<boolean> {
    sessionStorage.setItem(draftStorageKey(productId), JSON.stringify(formRef.current));

    if (mode !== "edit" || !productId) {
      return true;
    }

    const result = await updateProductAction(productId, buildAutosavePayload(formRef.current));
    if (result.ok) {
      lastSavedRef.current = serializePayload(formRef.current);
      onAutosaved?.();
    }

    return result.ok;
  }

  function markSaved(formState: AdminProductFormInput) {
    lastSavedRef.current = serializePayload(formState);
  }

  function clearDraftStorage() {
    sessionStorage.removeItem(draftStorageKey(productId));
  }

  return {
    flushDraftToServer,
    clearDraftStorage,
    markSaved,
  };
}
