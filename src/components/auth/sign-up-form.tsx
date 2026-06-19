"use client";

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

export function SignUpForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    const supabase = createSupabaseBrowserClient();
    const origin = getAuthRedirectOrigin();
    const { data, error: signUpError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        emailRedirectTo: `${origin}/auth/callback?next=/profile`,
        data: displayName.trim()
          ? { display_name: displayName.trim() }
          : undefined,
      },
    });

    setIsLoading(false);

    if (signUpError) {
      setError(mapAuthErrorMessage(signUpError.message));
      return;
    }

    if (data.session) {
      setSuccess("Аккаунт создан. Перенаправляем в профиль…");
      window.location.href = "/profile";
      return;
    }

    setSuccess(
      "Письмо отправлено. Подтвердите email по ссылке из письма, затем войдите.",
    );
  }

  return (
    <AuthPageShell
      title="Регистрация"
      description="Создайте аккаунт по email. После регистрации откроется профиль."
      breadcrumbLabel="Регистрация"
      footer={
        <p>
          Уже есть аккаунт?{" "}
          <AuthFormFooterLink href="/auth/sign-in">Войти</AuthFormFooterLink>
        </p>
      }
    >
      <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
        {error ? <AuthFormMessage message={error} /> : null}
        {success ? (
          <AuthFormMessage message={success} variant="success" />
        ) : null}

        <AuthFormField
          id="sign-up-name"
          label="Имя"
          hint="Необязательно — попадёт в профиль."
        >
          <Input
            id="sign-up-name"
            type="text"
            autoComplete="name"
            value={displayName}
            onChange={(event) => setDisplayName(event.target.value)}
            disabled={isLoading}
            placeholder="Как к вам обращаться"
          />
        </AuthFormField>

        <AuthFormField id="sign-up-email" label="Email">
          <Input
            id="sign-up-email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            disabled={isLoading}
            placeholder="you@example.com"
          />
        </AuthFormField>

        <AuthFormField
          id="sign-up-password"
          label="Пароль"
          hint="Минимум 6 символов."
        >
          <Input
            id="sign-up-password"
            type="password"
            autoComplete="new-password"
            required
            minLength={6}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            disabled={isLoading}
          />
        </AuthFormField>

        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? "Создаём аккаунт…" : "Зарегистрироваться"}
        </Button>

        <Button
          type="button"
          variant="secondary"
          disabled
          className="w-full"
          aria-label="Регистрация через Google — скоро"
        >
          Google — скоро
        </Button>
      </form>
    </AuthPageShell>
  );
}
