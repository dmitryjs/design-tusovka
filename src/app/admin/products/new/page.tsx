import {
  AdminForbidden,
  AdminShell,
} from "@/components/admin/admin-shell";
import { ProductForm } from "@/components/admin/product-form";
import { requireAdmin } from "@/lib/auth/admin";
import { createMaterialBlock } from "@/lib/content/material-blocks";
import {
  listAdminSectionOptions,
  listAdminTagOptions,
} from "@/lib/admin/products";

export const dynamic = "force-dynamic";

export default async function AdminNewProductPage({
  searchParams,
}: {
  searchParams: Promise<{ kind?: string }>;
}) {
  const { kind: kindParam } = await searchParams;
  const kind = kindParam === "task" ? "task" : "material";
  const ctx = await requireAdmin(`/admin/products/new?kind=${kind}`);

  if (ctx.role !== "admin") {
    return <AdminForbidden />;
  }

  const [sections, tags] = await Promise.all([
    listAdminSectionOptions(),
    listAdminTagOptions(),
  ]);

  return (
    <AdminShell
      title={kind === "task" ? "Новое задание" : "Новый материал"}
      description={kind === "task" ? "Задание каталога." : "Материал каталога."}
    >
      <ProductForm
        mode="create"
        sections={sections.map((section) => ({
          value: section.id,
          label: section.title,
        }))}
        tags={tags.map((tag) => ({
          value: tag.id,
          label: tag.name,
        }))}
        initial={{
          title: "",
          slug: "",
          description: "",
          kind,
          level: "all",
          format: kind === "material" ? "mini_guide" : undefined,
          priceRubles: 0,
          status: "draft",
          sectionProductId: kind === "material" ? sections[0]?.id ?? "" : "",
          coverPath: null,
          tagIds: [],
          chapters: [],
          contentBlocks: kind === "material" ? [createMaterialBlock("paragraph")] : [],
          taskBriefText: "",
          taskSubmissionText: "",
        }}
      />
    </AdminShell>
  );
}
