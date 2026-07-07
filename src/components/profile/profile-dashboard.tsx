"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  BookOpen,
  CheckCircle2,
  ClipboardList,
  LogOut,
  Settings,
  ShoppingBag,
} from "lucide-react";

import { ProfileAvatar } from "@/components/profile/profile-avatar";
import { ProfileSectionCard } from "@/components/profile/profile-section-card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { getMaterialFormatLabel } from "@/lib/catalog/format";
import { getMaterialCoverPlaceholderClass } from "@/lib/catalog/material-cover";
import {
  formatProfileDate,
  getProfileDisplayName,
  getProfileLevelLabel,
} from "@/lib/profile/format";
import type { ProfileDashboardData } from "@/lib/profile/types";
import { cn } from "@/lib/utils";

type ProfileDashboardProps = {
  data: ProfileDashboardData;
};

const STAT_ITEMS = [
  { key: "materialsCount", label: "Материалов в библиотеке" },
  { key: "tasksCount", label: "Заданий в библиотеке" },
  { key: "ordersCount", label: "Заказов" },
  { key: "daysOnPlatform", label: "Дней на платформе" },
] as const;

function formatStatValue(
  key: (typeof STAT_ITEMS)[number]["key"],
  stats: ProfileDashboardData["stats"],
): string {
  if (key === "daysOnPlatform") {
    return String(stats.daysOnPlatform);
  }

  return String(stats[key]);
}

export function ProfileDashboard({ data }: ProfileDashboardProps) {
  const { profile, stats, materials, tasks } = data;
  const { user, profile: profileRow } = profile;
  const displayName = getProfileDisplayName(
    profileRow.display_name,
    user.email ?? "",
  );
  const levelLabel = getProfileLevelLabel(profileRow.designer_level);
  const telegramConnected = Boolean(profileRow.telegram_username?.trim());

  return (
    <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-6 px-4 py-6 md:gap-8 md:px-8 md:py-8 lg:px-10 lg:py-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-[28px] leading-[36px] font-semibold tracking-tight text-foreground">
          Профиль
        </h1>
        <Link
          href="/profile/settings"
          className={buttonVariants({ variant: "secondary" })}
        >
          <Settings className="size-4" aria-hidden />
          Настройки
        </Link>
      </div>

      <div className="grid gap-4 lg:grid-cols-3 lg:gap-6">
        <section className="rounded-xl border border-neutral-200 bg-white p-5 lg:col-span-2 lg:p-6">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
            <div className="flex flex-col items-center gap-3 sm:items-start">
              <ProfileAvatar
                displayName={profileRow.display_name}
                email={user.email ?? ""}
                avatarPath={profileRow.avatar_path}
                size="lg"
              />
              <Link
                href="/profile/settings"
                className={buttonVariants({ variant: "outline", size: "sm" })}
              >
                Изменить фото
              </Link>
            </div>

            <div className="min-w-0 flex-1 space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl font-semibold text-foreground">
                  {displayName}
                </h2>
                {profileRow.designer_level === "senior" ? (
                  <Badge variant="secondary">Профи</Badge>
                ) : null}
              </div>

              <p className="text-sm text-neutral-600">
                Уровень: {levelLabel}
              </p>

              <div className="flex flex-wrap items-center gap-2 text-sm text-neutral-700">
                <span>{user.email}</span>
                {user.email_confirmed_at ? (
                  <CheckCircle2
                    className="size-4 text-primary"
                    aria-label="Email подтверждён"
                  />
                ) : (
                  <Badge variant="outline">Email не подтверждён</Badge>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-neutral-200 bg-white p-5 lg:p-6">
          <div className="grid grid-cols-2 gap-4">
            {STAT_ITEMS.map((item) => (
              <div key={item.key} className="space-y-1">
                <p className="text-xs leading-4 text-neutral-500">{item.label}</p>
                <p className="text-2xl font-semibold tabular-nums text-foreground">
                  {formatStatValue(item.key, stats)}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="grid gap-4 lg:grid-cols-2 lg:gap-6">
        <div className="space-y-4">
          <ProfileSectionCard title="Быстрые действия">
            <nav className="grid gap-2">
              <QuickActionLink
                href="/profile/library"
                icon={BookOpen}
                label="Моя библиотека"
                description={`${stats.materialsCount + stats.tasksCount} материалов и заданий`}
              />
              <QuickActionLink
                href="/profile/orders"
                icon={ShoppingBag}
                label="Мои заказы"
                description={`${stats.ordersCount} заказов`}
              />
              <QuickActionLink
                href="/profile/settings"
                icon={Settings}
                label="Настройки профиля"
                description="Имя, email, пароль, Telegram"
              />
              <QuickActionSignOut />
            </nav>
          </ProfileSectionCard>
        </div>

        <div className="space-y-4">
          <ProfileSectionCard
            title="Купленные материалы"
            href="/profile/library"
          >
            {materials.length === 0 ? (
              <EmptyPreview message="Пока нет материалов в библиотеке." />
            ) : (
              materials.map((item) => (
                <LibraryPreviewRow
                  key={item.productId}
                  href={`/materials/${item.slug}`}
                  title={item.title}
                  subtitle={
                    item.format
                      ? `${getMaterialFormatLabel(item.format)}`
                      : "Материал"
                  }
                  dateLabel={`Получен ${formatProfileDate(item.grantedAt)}`}
                  thumbClass={
                    item.format
                      ? getMaterialCoverPlaceholderClass(item.format)
                      : "bg-blue-50 text-blue-700"
                  }
                />
              ))
            )}
          </ProfileSectionCard>

          <ProfileSectionCard title="Активные задания" href="/profile/library">
            {tasks.length === 0 ? (
              <EmptyPreview message="Пока нет заданий в библиотеке." />
            ) : (
              tasks.map((item) => (
                <LibraryPreviewRow
                  key={item.productId}
                  href={`/tasks/${item.slug}`}
                  title={item.title}
                  subtitle="Задание"
                  dateLabel={`Получено ${formatProfileDate(item.grantedAt)}`}
                  thumbClass="bg-violet-50 text-violet-700"
                  icon={ClipboardList}
                />
              ))
            )}
          </ProfileSectionCard>

          <section className="rounded-xl border border-neutral-200 bg-white p-5">
            <div className="flex items-start gap-4">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-primary">
                <TelegramIcon />
              </div>
              <div className="min-w-0 flex-1 space-y-2">
                <h3 className="text-base font-semibold text-foreground">
                  Подключение Telegram
                </h3>
                {telegramConnected ? (
                  <p className="text-sm font-medium text-success">
                    Аккаунт подключён (@{profileRow.telegram_username})
                  </p>
                ) : (
                  <p className="text-sm text-neutral-600">
                    Подключите Telegram, чтобы получать уведомления о новых
                    материалах и активностях.
                  </p>
                )}
                <Link
                  href="/profile/settings"
                  className={buttonVariants({
                    variant: telegramConnected ? "outline" : "default",
                    size: "sm",
                  })}
                >
                  {telegramConnected ? "Управлять" : "Подключить"}
                </Link>
              </div>
            </div>
          </section>
        </div>
      </div>

      {data.libraryError ? (
        <p className="text-sm text-destructive" role="alert">
          Не удалось загрузить часть данных библиотеки.
        </p>
      ) : null}
    </div>
  );
}

function QuickActionLink({
  href,
  icon: Icon,
  label,
  description,
}: {
  href: string;
  icon: typeof BookOpen;
  label: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-lg border border-neutral-200 px-4 py-3 transition-colors hover:bg-neutral-50"
    >
      <div className="flex size-9 items-center justify-center rounded-lg bg-blue-50 text-primary">
        <Icon className="size-4" aria-hidden />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="text-xs text-neutral-500">{description}</p>
      </div>
    </Link>
  );
}

function QuickActionSignOut() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function handleSignOut() {
    setIsLoading(true);

    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();

    router.push("/");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleSignOut}
      disabled={isLoading}
      className="flex items-center gap-3 rounded-lg border border-neutral-200 px-4 py-3 text-left transition-colors hover:bg-neutral-50 disabled:opacity-60"
    >
      <div className="flex size-9 items-center justify-center rounded-lg bg-red-50 text-destructive">
        <LogOut className="size-4" aria-hidden />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-medium text-foreground">
          {isLoading ? "Выходим…" : "Выйти из аккаунта"}
        </p>
        <p className="text-xs text-neutral-500">Завершить текущую сессию</p>
      </div>
    </button>
  );
}

function LibraryPreviewRow({
  href,
  title,
  subtitle,
  dateLabel,
  thumbClass,
  icon: Icon,
}: {
  href: string;
  title: string;
  subtitle: string;
  dateLabel: string;
  thumbClass: string;
  icon?: typeof ClipboardList;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-lg px-1 py-2 transition-colors hover:bg-neutral-50"
    >
      <div
        className={cn(
          "flex size-10 shrink-0 items-center justify-center rounded-lg text-sm font-semibold",
          thumbClass,
        )}
      >
        {Icon ? <Icon className="size-4" aria-hidden /> : null}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground">{title}</p>
        <p className="text-xs text-neutral-500">{subtitle}</p>
      </div>
      <span className="hidden shrink-0 text-xs text-neutral-500 sm:inline">
        {dateLabel}
      </span>
    </Link>
  );
}

function EmptyPreview({ message }: { message: string }) {
  return <p className="text-sm text-neutral-500">{message}</p>;
}

function TelegramIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-6 fill-current" aria-hidden>
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z" />
    </svg>
  );
}
