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
    <div className="min-h-screen bg-neutral-50">
      <Suspense fallback={null}>
        <AdminSidebarMobile />
      </Suspense>

      <div className="flex min-h-[calc(100vh-0px)]">
        <Suspense fallback={<AdminSidebarFallback />}>
          <div className="hidden lg:block">
            <div className="sticky top-0 h-screen">
              <AdminSidebar />
            </div>
          </div>
        </Suspense>

        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
