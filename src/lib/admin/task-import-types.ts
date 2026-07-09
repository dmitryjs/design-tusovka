import type { Database } from "@/types/database.types";

type ProductStatus = Database["public"]["Enums"]["product_status"];
type DesignerLevel = Database["public"]["Enums"]["designer_level"];

export type TaskImportRecord = {
  title: string;
  slug: string;
  description: string;
  level: DesignerLevel;
  priceKopecks: number;
  status: ProductStatus;
  brief: string;
  tags: string[];
  criteria: string[];
};

export type TaskImportValidationError = {
  index: number;
  field?: string;
  message: string;
};

export type TaskImportPreviewItem = {
  index: number;
  slug: string;
  title: string;
  action: "create" | "update" | "error";
  error?: string;
};

export type TaskImportPreview = {
  total: number;
  toCreate: number;
  toUpdate: number;
  errorCount: number;
  errors: TaskImportValidationError[];
  slugs: string[];
  items: TaskImportPreviewItem[];
  canImport: boolean;
};

export type TaskImportResultItem = {
  slug: string;
  id: string;
  href: string;
  adminHref: string;
};

export type TaskImportResult = {
  created: TaskImportResultItem[];
  updated: TaskImportResultItem[];
  skipped: Array<{ slug: string; reason: string }>;
  errors: TaskImportValidationError[];
};

export const TASK_IMPORT_EXAMPLE_JSON = `[
  {
    "title": "Разобрать экран оплаты",
    "slug": "razobrat-ekran-oplaty",
    "description": "Найди UX-проблемы в экране оплаты и предложи улучшения.",
    "level": "junior",
    "price_kopecks": 0,
    "status": "published",
    "tags": ["UX", "Оплата", "Аудит"],
    "brief": "Представь, что пользователи часто не завершают оплату. Разбери экран, найди проблемы и предложи улучшения.",
    "criteria": [
      "Нашёл ключевые UX-проблемы",
      "Объяснил влияние проблем на пользователя и бизнес",
      "Предложил конкретные улучшения",
      "Аргументировал решения"
    ]
  }
]`;
