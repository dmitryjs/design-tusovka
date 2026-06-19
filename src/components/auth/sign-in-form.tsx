"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { mapAuthErrorMessage } from "@/lib/auth/errors";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

import {
  AuthFormField,
  AuthFormFooterLink,
  AuthFormMessage,
  AuthPageShell,
} from "./auth-page-shell";

export function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialError = searchParams.get("error");
  const nextPath = searchParams.get("next");
  const redirectPath =
    nextPath && nextPath.startsWith("/") && !nextPath.startsWith("//")
      ? nextPath
      : "/profile";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(
    initialError ? mapAuthErrorMessage(initialError) : null,
  );
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsLoading(true);

    const supabase = createSupabaseBrowserClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    setIsLoading(false);

    if (signInError) {
      setError(mapAuthErrorMessage(signInError.message));
      return;
    }

    router.push(redirectPath);
    router.refresh();
  }

  return (
    <AuthPageShell
      title="Вход"
      description="Войдите по email и паролю, чтобы открыть профиль."
      breadcrumbLabel="Вход"
      footer={
        <p>
          Нет аккаунта?{" "}
          <AuthFormFooterLink href="/auth/sign-up">Зарегистрироваться</AuthFormFooterLink>
        </p>
      }
    >
      <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
        {error ? <AuthFormMessage message={error} /> : null}

        <AuthFormField id="sign-in-email" label="Email">
          <Input
            id="sign-in-email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            disabled={isLoading}
            placeholder="you@example.com"
          />
        </AuthFormField>

        <AuthFormField id="sign-in-password" label="Пароль">
          <Input
            id="sign-in-password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            disabled={isLoading}
          />
        </AuthFormField>

        <div className="flex flex-col gap-3">
          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? "Входим…" : "Войти"}
          </Button>
          <Link
            href="/auth/reset-password"
            className="text-center text-sm text-neutral-600 hover:text-primary"
          >
            Забыли пароль?
          </Link>
        </div>

        <Button
          type="button"
          variant="secondary"
          disabled
          className="w-full"
          aria-label="Войти через Google — скоро"
        >
          Google — скоро
        </Button>
      </form>
    </AuthPageShell>
  );
}
