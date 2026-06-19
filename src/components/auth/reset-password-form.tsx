"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { mapAuthErrorMessage } from "@/lib/auth/errors";
import {
  createSupabaseBrowserClient,
  getAuthRedirectOrigin,
} from "@/lib/supabase/client";

import {
  AuthFormField,
  AuthFormFooterLink,
  AuthFormMessage,
  AuthPageShell,
} from "./auth-page-shell";

export function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const isRecovery = searchParams.get("recovery") === "1";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleRequestReset(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    const supabase = createSupabaseBrowserClient();
    const origin = getAuthRedirectOrigin();
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      email.trim(),
      {
        redirectTo: `${origin}/auth/callback?next=${encodeURIComponent("/auth/reset-password?recovery=1")}`,
      },
    );

    setIsLoading(false);

    if (resetError) {
      setError(mapAuthErrorMessage(resetError.message));
      return;
    }

    setSuccess(
      "Если аккаунт с таким email существует, мы отправили ссылку для сброса пароля.",
    );
  }

  async function handleUpdatePassword(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (password !== passwordConfirm) {
      setError("Пароли не совпадают.");
      return;
    }

    if (password.length < 6) {
      setError("Пароль слишком короткий — минимум 6 символов.");
      return;
    }

    setIsLoading(true);

    const supabase = createSupabaseBrowserClient();
    const { error: updateError } = await supabase.auth.updateUser({
      password,
    });

    setIsLoading(false);

    if (updateError) {
      setError(mapAuthErrorMessage(updateError.message));
      return;
    }

    setSuccess("Пароль обновлён. Теперь можно войти с новым паролем.");
    window.location.href = "/profile";
  }

  if (isRecovery) {
    return (
      <AuthPageShell
        title="Новый пароль"
        description="Задайте новый пароль для аккаунта."
        breadcrumbLabel="Новый пароль"
        footer={
          <p>
            <AuthFormFooterLink href="/auth/sign-in">Вернуться ко входу</AuthFormFooterLink>
          </p>
        }
      >
        <form className="flex flex-col gap-5" onSubmit={handleUpdatePassword}>
          {error ? <AuthFormMessage message={error} /> : null}
          {success ? (
            <AuthFormMessage message={success} variant="success" />
          ) : null}

          <AuthFormField id="new-password" label="Новый пароль">
            <Input
              id="new-password"
              type="password"
              autoComplete="new-password"
              required
              minLength={6}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              disabled={isLoading}
            />
          </AuthFormField>

          <AuthFormField id="new-password-confirm" label="Повторите пароль">
            <Input
              id="new-password-confirm"
              type="password"
              autoComplete="new-password"
              required
              minLength={6}
              value={passwordConfirm}
              onChange={(event) => setPasswordConfirm(event.target.value)}
              disabled={isLoading}
            />
          </AuthFormField>

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? "Сохраняем…" : "Сохранить пароль"}
          </Button>
        </form>
      </AuthPageShell>
    );
  }

  return (
    <AuthPageShell
      title="Сброс пароля"
      description="Укажите email — отправим ссылку для задания нового пароля."
      breadcrumbLabel="Сброс пароля"
      footer={
        <p>
          <AuthFormFooterLink href="/auth/sign-in">Вернуться ко входу</AuthFormFooterLink>
        </p>
      }
    >
      <form className="flex flex-col gap-5" onSubmit={handleRequestReset}>
        {error ? <AuthFormMessage message={error} /> : null}
        {success ? (
          <AuthFormMessage message={success} variant="success" />
        ) : null}

        <AuthFormField id="reset-email" label="Email">
          <Input
            id="reset-email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            disabled={isLoading}
            placeholder="you@example.com"
          />
        </AuthFormField>

        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? "Отправляем…" : "Отправить ссылку"}
        </Button>
      </form>
    </AuthPageShell>
  );
}
