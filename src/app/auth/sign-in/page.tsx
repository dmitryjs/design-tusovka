import { Suspense } from "react";

import { SignInForm } from "@/components/auth/sign-in-form";
import { AuthPageLoading } from "@/components/auth/auth-page-loading";

export default function SignInPage() {
  return (
    <Suspense fallback={<AuthPageLoading />}>
      <SignInForm />
    </Suspense>
  );
}
