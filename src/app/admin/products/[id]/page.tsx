import { notFound } from "next/navigation";

import {
  AdminForbidden,
  AdminShell,
} from "@/components/admin/admin-shell";
import { ProductForm } from "@/components/admin/product-form";
import { requireAdmin } from "@/lib/auth/admin";
import {
  getAdminProductDetail,
  listAdminSectionOptions,
  listAdminTagOptions,
} from "@/lib/admin/products";

export const dynamic = "force-dynamic";

type AdminEditProductPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string }>;
};

export default async function AdminEditProductPage({
  params,
  searchParams,
}: AdminEditProductPageProps) {
  const { id } = await params;
  const { saved } = await searchParams;
  const ctx = await requireAdmin(`/admin/products/${id}`);

  if (ctx.role !== "admin") {
    return <AdminForbidden />;
  }

  const [product, sections, tags] = await Promise.all([
    getAdminProductDetail(id),
    listAdminSectionOptions(),
    listAdminTagOptions(),
  ]);

  if (!product) {
    notFound();
  }

  return (
    <AdminShell
      title="Редактирование продукта"
      description={product.title}
    >
      <ProductForm
        mode="edit"
        productId={id}
        saved={saved === "1"}
        sections={sections.map((section) => ({
          value: section.id,
          label: section.title,
        }))}
        tags={tags.map((tag) => ({
          value: tag.id,
          label: tag.name,
        }))}
        initial={product}
      />
    </AdminShell>
  );
}
