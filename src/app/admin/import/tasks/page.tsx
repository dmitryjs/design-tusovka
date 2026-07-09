import { redirect } from "next/navigation";

export default function AdminTaskImportRedirectPage() {
  redirect("/admin/products?kind=task");
}
