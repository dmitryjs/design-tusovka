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

export default async function AdminNewProductPage() {
  const ctx = await requireAdmin("/admin/products/new");

  if (ctx.role !== "admin") {
    return <AdminForbidden />;
  }

  const [sections, tags] = await Promise.all([
    listAdminSectionOptions(),
    listAdminTagOptions(),
  ]);

  return (
    <AdminShell title="Новый продукт" description="Материал или задание.">
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
          kind: "material",
          level: "all",
          format: "mini_guide",
          priceRubles: 0,
          status: "draft",
          sectionProductId: sections[0]?.id ?? "",
          tagIds: [],
          chapters: [],
          contentBlocks: [createMaterialBlock("paragraph")],
          taskBriefText: "",
          taskSubmissionText: "",
        }}
      />
    </AdminShell>
  );
}
