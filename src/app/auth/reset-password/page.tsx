import { Suspense } from "react";

import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { AuthPageLoading } from "@/components/auth/auth-page-loading";

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<AuthPageLoading />}>
      <ResetPasswordForm />
    </Suspense>
  );
}
