"use client";

import Link from "next/link";
import { useRef, useState, useTransition } from "react";

import {
  importTasksAction,
  previewTaskImportAction,
} from "@/app/actions/admin/task-import";
import { AdminAlert } from "@/components/admin/admin-shell";
import { Button } from "@/components/ui/button";
import {
  TASK_IMPORT_EXAMPLE_JSON,
  type TaskImportPreview,
  type TaskImportResult,
} from "@/lib/admin/task-import-types";

function PreviewPanel({ preview }: { preview: TaskImportPreview }) {
  return (
    <section className="space-y-4 rounded-xl border border-neutral-200 bg-white p-4">
      <h2 className="text-base font-semibold text-foreground">Предпросмотр</h2>

      <dl className="grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <dt className="text-neutral-500">Всего задач</dt>
          <dd className="font-medium text-foreground">{preview.total}</dd>
        </div>
        <div>
          <dt className="text-neutral-500">Будет создано</dt>
          <dd className="font-medium text-foreground">{preview.toCreate}</dd>
        </div>
        <div>
          <dt className="text-neutral-500">Будет обновлено</dt>
          <dd className="font-medium text-foreground">{preview.toUpdate}</dd>
        </div>
        <div>
          <dt className="text-neutral-500">Ошибок</dt>
          <dd className="font-medium text-foreground">{preview.errorCount}</dd>
        </div>
      </dl>

      {preview.slugs.length > 0 ? (
        <div>
          <p className="mb-2 text-sm font-medium text-foreground">Slug</p>
          <ul className="flex flex-wrap gap-2">
            {preview.slugs.map((slug) => (
              <li
                key={slug}
                className="rounded-full bg-neutral-100 px-2.5 py-1 text-xs text-neutral-700"
              >
                {slug}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {preview.errors.length > 0 ? (
        <div>
          <p className="mb-2 text-sm font-medium text-foreground">Ошибки</p>
          <ul className="space-y-2 text-sm text-destructive-foreground">
            {preview.errors.map((error, index) => (
              <li key={`${error.index}-${error.field ?? "general"}-${index}`}>
                Элемент {error.index}
                {error.field ? ` (${error.field})` : ""}: {error.message}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}

function ResultPanel({ result }: { result: TaskImportResult }) {
  return (
    <section className="space-y-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
      <h2 className="text-base font-semibold text-emerald-950">Результат импорта</h2>

      <dl className="grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <dt className="text-emerald-800">Создано</dt>
          <dd className="font-medium text-emerald-950">{result.created.length}</dd>
        </div>
        <div>
          <dt className="text-emerald-800">Обновлено</dt>
          <dd className="font-medium text-emerald-950">{result.updated.length}</dd>
        </div>
        <div>
          <dt className="text-emerald-800">Пропущено</dt>
          <dd className="font-medium text-emerald-950">{result.skipped.length}</dd>
        </div>
        <div>
          <dt className="text-emerald-800">Ошибок</dt>
          <dd className="font-medium text-emerald-950">{result.errors.length}</dd>
        </div>
      </dl>

      {[...result.created, ...result.updated].length > 0 ? (
        <div>
          <p className="mb-2 text-sm font-medium text-emerald-950">Задачи</p>
          <ul className="space-y-2 text-sm">
            {[...result.created, ...result.updated].map((item) => (
              <li key={item.id} className="flex flex-wrap items-center gap-2">
                <span className="font-medium text-emerald-950">{item.slug}</span>
                <Link href={item.href} className="text-primary underline">
                  На сайте
                </Link>
                <Link href={item.adminHref} className="text-primary underline">
                  В админке
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {result.skipped.length > 0 ? (
        <div>
          <p className="mb-2 text-sm font-medium text-emerald-950">Пропущено</p>
          <ul className="space-y-1 text-sm text-emerald-900">
            {result.skipped.map((item) => (
              <li key={item.slug}>
                {item.slug}: {item.reason}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {result.errors.length > 0 ? (
        <div>
          <p className="mb-2 text-sm font-medium text-emerald-950">Ошибки</p>
          <ul className="space-y-1 text-sm text-destructive-foreground">
            {result.errors.map((error, index) => (
              <li key={`${error.index}-${index}`}>
                Элемент {error.index}: {error.message}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}

export function TaskImportForm() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [jsonText, setJsonText] = useState(TASK_IMPORT_EXAMPLE_JSON);
  const [preview, setPreview] = useState<TaskImportPreview | null>(null);
  const [result, setResult] = useState<TaskImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPreviewPending, startPreviewTransition] = useTransition();
  const [isImportPending, startImportTransition] = useTransition();

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setJsonText(reader.result);
        setPreview(null);
        setResult(null);
        setError(null);
      }
    };
    reader.readAsText(file);
    event.target.value = "";
  }

  function handlePreview() {
    setError(null);
    setResult(null);

    startPreviewTransition(async () => {
      const response = await previewTaskImportAction(jsonText);
      if (!response.ok) {
        setPreview(null);
        setError(response.error);
        return;
      }

      setPreview(response.preview);
    });
  }

  function handleImport() {
    setError(null);

    startImportTransition(async () => {
      const response = await importTasksAction(jsonText);
      if (!response.ok) {
        setError(response.error);
        return;
      }

      setResult(response.result);
      setPreview(null);
    });
  }

  return (
    <div className="space-y-6">
      <section className="space-y-3 rounded-xl border border-neutral-200 bg-white p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-foreground">JSON</h2>
            <p className="text-sm text-neutral-600">
              Вставьте массив задач или загрузите файл `.json`.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,application/json"
              className="hidden"
              onChange={handleFileChange}
            />
            <Button
              type="button"
              variant="secondary"
              onClick={() => fileInputRef.current?.click()}
            >
              Загрузить .json
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setJsonText(TASK_IMPORT_EXAMPLE_JSON)}
            >
              Подставить пример
            </Button>
          </div>
        </div>

        <textarea
          value={jsonText}
          onChange={(event) => {
            setJsonText(event.target.value);
            setPreview(null);
            setResult(null);
            setError(null);
          }}
          rows={18}
          spellCheck={false}
          className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 font-mono text-sm leading-6 text-foreground outline-none focus:border-primary"
          aria-label="JSON задач"
        />
      </section>

      <section className="rounded-xl border border-dashed border-neutral-300 bg-neutral-50 p-4">
        <h2 className="text-sm font-semibold text-foreground">Пример формата</h2>
        <pre className="mt-2 overflow-x-auto text-xs leading-5 text-neutral-700">
          {TASK_IMPORT_EXAMPLE_JSON}
        </pre>
      </section>

      <div className="flex flex-wrap gap-2">
        <Button type="button" onClick={handlePreview} disabled={isPreviewPending}>
          {isPreviewPending ? "Проверяем…" : "Проверить"}
        </Button>
        <Button
          type="button"
          onClick={handleImport}
          disabled={!preview?.canImport || isImportPending}
        >
          {isImportPending ? "Импортируем…" : "Импортировать"}
        </Button>
      </div>

      {error ? <AdminAlert variant="error">{error}</AdminAlert> : null}
      {preview ? <PreviewPanel preview={preview} /> : null}
      {result ? <ResultPanel result={result} /> : null}
    </div>
  );
}
