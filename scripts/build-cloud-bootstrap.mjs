import fs from "node:fs";
import path from "node:path";

const migrations = [
  "20260618185410_create_catalog_content_schema.sql",
  "20260618191440_create_profiles_and_access_foundation.sql",
  "20260618193254_create_catalog_read_policies.sql",
  "20260618195500_grant_api_access_for_rls.sql",
  "20260618200000_free_catalog_content_rls.sql",
  "20260618210000_profiles_update_policy.sql",
  "20260618220000_claim_free_product_rpc.sql",
  "20260618230000_profiles_admin_role.sql",
  "20260618240000_cart_and_orders.sql",
].map((file) =>
  fs.readFileSync(path.join("supabase/migrations", file), "utf8"),
);

let sql = `-- Supabase Cloud bootstrap - Design Tusovka MVP
-- Consolidates migrations 20260618185410 through 20260618200000
-- Run FIRST in Supabase Dashboard -> SQL Editor
-- Safe to re-run: IF NOT EXISTS / OR REPLACE / DROP IF EXISTS
-- Does NOT use DROP SCHEMA or destructive reset

create extension if not exists pgcrypto with schema extensions;

`;

const enums = [
  ["product_kind", "'material', 'task', 'section', 'section_update'"],
  ["product_status", "'draft', 'published', 'hidden'"],
  [
    "material_format",
    "'mini_guide', 'full_guide', 'notes', 'checklist', 'template', 'cheat_sheet', 'lesson', 'practice'",
  ],
  ["designer_level", "'junior', 'middle', 'senior', 'all'"],
  [
    "entitlement_source_type",
    "'direct_order', 'zero_order', 'section_order', 'section_update', 'manual', 'free_task_submission', 'all_materials_owned'",
  ],
];

for (const [name, values] of enums) {
  sql += `DO $$ BEGIN
  CREATE TYPE public.${name} AS ENUM (${values});
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

`;
}

let body = migrations.join("\n\n");
body = body.replace(
  /create extension if not exists pgcrypto with schema extensions;\s*/gi,
  "",
);
body = body.replace(
  /-- Enums[\s\S]*?create type public\.designer_level[\s\S]*?\);\s*/i,
  "",
);
body = body.replace(
  /-- Enum\s*\n\s*create type public\.entitlement_source_type[\s\S]*?\);\s*/i,
  "",
);
body = body.replace(/create table public\./gi, "create table if not exists public.");
body = body.replace(
  /create index (?!if not exists)(\w+)/gi,
  "create index if not exists $1",
);
body = body.replace(
  /create policy (\w+)\s+\n\s+on public\.(\w+)/gi,
  "drop policy if exists $1 on public.$2;\ncreate policy $1\n  on public.$2",
);

sql += body;

const triggers = [
  ["products_set_updated_at", "public.products"],
  ["sections_ensure_product_kind", "public.sections"],
  ["sections_set_updated_at", "public.sections"],
  ["materials_ensure_product_kind", "public.materials"],
  ["materials_set_updated_at", "public.materials"],
  ["material_chapters_set_updated_at", "public.material_chapters"],
  ["tasks_ensure_product_kind", "public.tasks"],
  ["tasks_set_updated_at", "public.tasks"],
  ["task_content_set_updated_at", "public.task_content"],
  ["task_ai_criteria_set_updated_at", "public.task_ai_criteria"],
  ["tags_set_updated_at", "public.tags"],
  ["section_updates_ensure_product_kind", "public.section_updates"],
  ["section_updates_set_updated_at", "public.section_updates"],
  ["section_update_materials_same_section", "public.section_update_materials"],
  ["profiles_set_updated_at", "public.profiles"],
  ["on_auth_user_created", "auth.users"],
];

for (const [trigger, table] of triggers) {
  const pattern = new RegExp(`create trigger ${trigger}`, "g");
  sql = sql.replace(
    pattern,
    `drop trigger if exists ${trigger} on ${table};\ncreate trigger ${trigger}`,
  );
}

fs.writeFileSync("supabase/cloud_bootstrap.sql", sql);
console.log(`Wrote supabase/cloud_bootstrap.sql (${sql.length} chars)`);
