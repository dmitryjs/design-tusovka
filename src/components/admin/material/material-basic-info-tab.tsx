"use client";

import { Input } from "@/components/ui/input";
import type { AdminProductFormInput } from "@/lib/admin/types";
import { cn } from "@/lib/utils";

import { MaterialTagPicker } from "./material-tag-picker";

type SelectOption = { value: string; label: string };

type MaterialBasicInfoTabProps = {
  form: AdminProductFormInput;
  fieldErrors: Record<string, string>;
  sections: SelectOption[];
  tags: SelectOption[];
  isPending: boolean;
  mode: "create" | "edit";
  onChange: <K extends keyof AdminProductFormInput>(
    key: K,
    value: AdminProductFormInput[K],
  ) => void;
};

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
      onChange={(event) => onChange(event.target.value)}
      disabled={disabled}
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

export function MaterialBasicInfoTab({
  form,
  fieldErrors,
  sections,
  tags,
  isPending,
  mode,
  onChange,
}: MaterialBasicInfoTabProps) {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Название" error={fieldErrors.title}>
          <Input
            value={form.title}
            onChange={(event) => onChange("title", event.target.value)}
            disabled={isPending}
            required
          />
        </Field>
        <Field label="Slug" error={fieldErrors.slug}>
          <Input
            value={form.slug}
            onChange={(event) => onChange("slug", event.target.value)}
            disabled={isPending || mode === "edit"}
            required
          />
        </Field>
      </div>

      <Field label="Описание">
        <textarea
          value={form.description}
          onChange={(event) => onChange("description", event.target.value)}
          disabled={isPending}
          rows={4}
          className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Field label="Уровень" error={fieldErrors.level}>
          <SelectControl
            value={form.level}
            onChange={(value) =>
              onChange("level", value as AdminProductFormInput["level"])
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
            onChange={(event) => onChange("priceRubles", Number(event.target.value))}
            disabled={isPending}
          />
        </Field>
        <Field label="Статус" error={fieldErrors.status}>
          <SelectControl
            value={form.status}
            onChange={(value) =>
              onChange("status", value as AdminProductFormInput["status"])
            }
            options={STATUS_OPTIONS}
            disabled={isPending}
          />
        </Field>
        <Field label="Формат" error={fieldErrors.format}>
          <SelectControl
            value={form.format ?? "mini_guide"}
            onChange={(value) =>
              onChange(
                "format",
                value as NonNullable<AdminProductFormInput["format"]>,
              )
            }
            options={FORMAT_OPTIONS}
            disabled={isPending}
          />
        </Field>
      </div>

      <Field label="Раздел" error={fieldErrors.sectionProductId}>
        <SelectControl
          value={form.sectionProductId ?? ""}
          onChange={(value) => onChange("sectionProductId", value)}
          options={[{ value: "", label: "Выберите раздел" }, ...sections]}
          disabled={isPending}
        />
      </Field>

      <MaterialTagPicker
        tags={tags}
        selectedTagIds={form.tagIds}
        onChange={(tagIds) => onChange("tagIds", tagIds)}
        disabled={isPending}
      />
    </div>
  );
}
