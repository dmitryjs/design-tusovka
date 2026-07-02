import type { CatalogItemKind } from "@/lib/catalog/types";
import { getCatalogItemHref } from "@/lib/catalog/paths";

export type CtaTargetKind = CatalogItemKind | "custom";

export type CtaBlockData = {
  targetKind: CtaTargetKind;
  targetProductId: string;
  targetSlug: string;
  title: string;
  description: string;
  coverPath: string | null;
  url: string;
  buttonLabel: string;
};

export function defaultCtaBlockData(): CtaBlockData {
  return {
    targetKind: "material",
    targetProductId: "",
    targetSlug: "",
    title: "",
    description: "",
    coverPath: null,
    url: "",
    buttonLabel: "Перейти",
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function readString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

export function normalizeCtaBlockData(raw: unknown): CtaBlockData {
  const defaults = defaultCtaBlockData();

  if (!isRecord(raw)) {
    return defaults;
  }

  const legacyPrimaryUrl = readString(raw.primaryUrl);
  const legacyPrimaryLabel = readString(raw.primaryLabel);

  const targetKindRaw = readString(raw.targetKind);
  const targetKind: CtaTargetKind =
    targetKindRaw === "material" ||
    targetKindRaw === "task" ||
    targetKindRaw === "section" ||
    targetKindRaw === "custom"
      ? targetKindRaw
      : legacyPrimaryUrl && !readString(raw.targetProductId)
        ? "custom"
        : "material";

  const url = readString(raw.url) || legacyPrimaryUrl;
  const buttonLabel = readString(raw.buttonLabel) || legacyPrimaryLabel || defaults.buttonLabel;

  return {
    targetKind,
    targetProductId: readString(raw.targetProductId),
    targetSlug: readString(raw.targetSlug),
    title: readString(raw.title),
    description: readString(raw.description),
    coverPath: readString(raw.coverPath) || null,
    url,
    buttonLabel,
  };
}

export function resolveCtaHref(data: CtaBlockData): string | null {
  const trimmed = data.url.trim();
  if (trimmed) {
    return trimmed;
  }

  if (data.targetKind === "custom" || !data.targetSlug.trim()) {
    return null;
  }

  return getCatalogItemHref(data.targetKind, data.targetSlug.trim());
}

export function isCtaBlockConfigured(data: CtaBlockData): boolean {
  return Boolean(resolveCtaHref(data)?.trim() && data.title.trim());
}
