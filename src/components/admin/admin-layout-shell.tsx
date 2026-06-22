import { Suspense } from "react";

import { AdminSidebar, AdminSidebarMobile } from "@/components/admin/admin-sidebar";

type AdminLayoutShellProps = {
  children: React.ReactNode;
};

function AdminSidebarFallback() {
  return (
    <aside className="hidden w-[248px] shrink-0 border-r border-neutral-200 bg-white lg:block" />
  );
}

export function AdminLayoutShell({ children }: AdminLayoutShellProps) {
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-neutral-50">
      <Suspense fallback={null}>
        <AdminSidebarMobile />
      </Suspense>

      <div className="flex min-h-0 flex-1">
        <Suspense fallback={<AdminSidebarFallback />}>
          <div className="hidden h-full shrink-0 lg:block">
            <AdminSidebar />
          </div>
        </Suspense>

        <main className="min-h-0 min-w-0 flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
