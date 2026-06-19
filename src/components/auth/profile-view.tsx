import { Badge } from "@/components/ui/badge";
import type { User } from "@supabase/supabase-js";

import {
  CatalogDetailShell,
  CatalogEmptyPanel,
} from "@/components/catalog/catalog-detail-shell";
import { LibraryList } from "@/components/entitlements/library-list";
import type { LibraryItem } from "@/lib/entitlements/types";

export type ProfileSummary = {
  id: string;
  display_name: string | null;
  designer_level: string;
  created_at: string;
  updated_at: string;
};

type ProfileViewProps = {
  user: User;
  profile: ProfileSummary | null;
  library: LibraryItem[];
  libraryError: string | null;
};

export function ProfileView({
  user,
  profile,
  library,
  libraryError,
}: ProfileViewProps) {
  const emailConfirmed = Boolean(user.email_confirmed_at);

  return (
    <CatalogDetailShell
      breadcrumbs={[
        { label: "Главная", href: "/" },
        { label: "Моя библиотека" },
      ]}
    >
      <header className="space-y-4">
        <Badge variant="secondary">Профиль</Badge>
        <div className="space-y-2">
          <h1 className="text-[28px] leading-[36px] font-semibold tracking-tight text-foreground sm:text-[32px] sm:leading-[40px]">
            {profile?.display_name?.trim() || "Мой аккаунт"}
          </h1>
          <p className="text-sm text-neutral-600">
            Аккаунт и сохранённые бесплатные материалы и задания.
          </p>
        </div>
      </header>

      <section className="space-y-4 rounded-xl border border-neutral-300 bg-card px-4 py-4 sm:px-5">
        <h2 className="text-base font-semibold text-foreground">Аккаунт</h2>
        <dl className="space-y-3 text-sm">
          <div className="flex flex-col gap-1 sm:flex-row sm:justify-between">
            <dt className="text-neutral-500">Email</dt>
            <dd className="font-medium text-foreground">{user.email}</dd>
          </div>
          <div className="flex flex-col gap-1 sm:flex-row sm:justify-between sm:items-center">
            <dt className="text-neutral-500">Подтверждение email</dt>
            <dd>
              <Badge variant={emailConfirmed ? "default" : "outline"}>
                {emailConfirmed ? "Подтверждён" : "Ожидает подтверждения"}
              </Badge>
            </dd>
          </div>
          {profile?.display_name ? (
            <div className="flex flex-col gap-1 sm:flex-row sm:justify-between">
              <dt className="text-neutral-500">Имя в профиле</dt>
              <dd className="text-foreground">{profile.display_name}</dd>
            </div>
          ) : null}
        </dl>
      </section>

      {!profile ? (
        <div
          className="rounded-xl border border-destructive-border bg-destructive-bg px-4 py-4 text-sm text-destructive-foreground sm:px-5"
          role="alert"
        >
          Запись в таблице <code>profiles</code> не найдена. Проверьте, что в
          Supabase Cloud выполнен bootstrap с триггером{" "}
          <code>on_auth_user_created</code> (функция{" "}
          <code>handle_new_user</code>).
        </div>
      ) : null}

      <section className="space-y-4 border-t border-neutral-200 pt-8">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold text-foreground">Моя библиотека</h2>
          <p className="text-sm text-neutral-600">
            Продукты, которые вы получили бесплатно через «Получить бесплатно».
          </p>
        </div>
        {libraryError ? (
          <CatalogEmptyPanel
            title="Не удалось загрузить библиотеку"
            description={libraryError}
          />
        ) : (
          <LibraryList items={library} />
        )}
      </section>
    </CatalogDetailShell>
  );
}
