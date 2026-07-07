"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Eye, EyeOff } from "lucide-react";

import { updateProfileAction } from "@/app/profile/settings/actions";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { ProfileAvatarUpload } from "@/components/profile/profile-avatar-upload";
import {
  ProfileSettingsShell,
  SettingsField,
  SettingsPanel,
} from "@/components/profile/profile-settings-shell";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { mapAuthErrorMessage } from "@/lib/auth/errors";
import { getProfileDisplayName } from "@/lib/profile/format";
import type { ProfileSettingsData } from "@/lib/profile/types";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { Database } from "@/types/database.types";

const DESIGNER_LEVEL_OPTIONS: Array<{
  value: Database["public"]["Enums"]["designer_level"];
  label: string;
}> = [
  { value: "junior", label: "Junior" },
  { value: "middle", label: "Middle" },
  { value: "senior", label: "Senior" },
  { value: "all", label: "Не указан" },
];

type SavedProfileValues = {
  displayName: string;
  telegramUsername: string;
  designerLevel: Database["public"]["Enums"]["designer_level"];
};

function normalizeTelegramUsername(value: string): string {
  return value.trim().replace(/^@/, "");
}

function buildSavedValues(
  profileRow: ProfileSettingsData["profile"]["profile"],
  fallbackDisplayName: string,
): SavedProfileValues {
  return {
    displayName: profileRow.display_name?.trim() || fallbackDisplayName,
    telegramUsername: profileRow.telegram_username ?? "",
    designerLevel: profileRow.designer_level,
  };
}

type ProfileSettingsFormProps = {
  data: ProfileSettingsData;
  storageEnabled: boolean;
};

export function ProfileSettingsForm({ data, storageEnabled }: ProfileSettingsFormProps) {
  const { profile, emailConfirmed } = data;
  const { user, profile: profileRow } = profile;

  const fallbackDisplayName = getProfileDisplayName(
    profileRow.display_name,
    user.email ?? "",
  );

  const [savedValues, setSavedValues] = useState<SavedProfileValues>(() =>
    buildSavedValues(profileRow, fallbackDisplayName),
  );

  const [displayName, setDisplayName] = useState(savedValues.displayName);
  const [telegramUsername, setTelegramUsername] = useState(
    savedValues.telegramUsername,
  );
  const [designerLevel, setDesignerLevel] = useState(savedValues.designerLevel);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [profileMessage, setProfileMessage] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  const isProfileDirty = useMemo(() => {
    return (
      displayName.trim() !== savedValues.displayName ||
      normalizeTelegramUsername(telegramUsername) !==
        normalizeTelegramUsername(savedValues.telegramUsername) ||
      designerLevel !== savedValues.designerLevel
    );
  }, [
    designerLevel,
    displayName,
    savedValues.designerLevel,
    savedValues.displayName,
    savedValues.telegramUsername,
    telegramUsername,
  ]);

  const passwordFormValid = useMemo(
    () =>
      currentPassword.length >= 6 &&
      newPassword.length >= 8 &&
      confirmPassword.length >= 8 &&
      newPassword === confirmPassword,
    [confirmPassword, currentPassword, newPassword],
  );

  async function handleProfileSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!isProfileDirty) {
      return;
    }

    setProfileMessage(null);
    setProfileError(null);
    setIsSavingProfile(true);

    const trimmedDisplayName = displayName.trim();
    const normalizedTelegram = normalizeTelegramUsername(telegramUsername);

    const result = await updateProfileAction({
      displayName: trimmedDisplayName,
      avatarPath: profileRow.avatar_path,
      telegramUsername: normalizedTelegram || null,
      designerLevel,
    });

    setIsSavingProfile(false);

    if (result.ok) {
      const nextSavedValues: SavedProfileValues = {
        displayName: trimmedDisplayName,
        telegramUsername: normalizedTelegram,
        designerLevel,
      };

      setSavedValues(nextSavedValues);
      setDisplayName(nextSavedValues.displayName);
      setTelegramUsername(nextSavedValues.telegramUsername);
      setDesignerLevel(nextSavedValues.designerLevel);
      setProfileMessage(result.message);
      return;
    }

    setProfileError(result.message);
  }

  async function handlePasswordSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPasswordMessage(null);
    setPasswordError(null);

    if (newPassword !== confirmPassword) {
      setPasswordError("Пароли не совпадают.");
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError("Новый пароль должен быть не короче 8 символов.");
      return;
    }

    setIsUpdatingPassword(true);

    const supabase = createSupabaseBrowserClient();
    const email = user.email?.trim();

    if (!email) {
      setIsUpdatingPassword(false);
      setPasswordError("Email аккаунта не найден.");
      return;
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password: currentPassword,
    });

    if (signInError) {
      setIsUpdatingPassword(false);
      setPasswordError("Текущий пароль указан неверно.");
      return;
    }

    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    });

    setIsUpdatingPassword(false);

    if (updateError) {
      setPasswordError(mapAuthErrorMessage(updateError.message));
      return;
    }

    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setPasswordMessage("Пароль обновлён.");
  }

  function handleProfileReset() {
    setDisplayName(savedValues.displayName);
    setTelegramUsername(savedValues.telegramUsername);
    setDesignerLevel(savedValues.designerLevel);
    setProfileMessage(null);
    setProfileError(null);
  }

  return (
    <ProfileSettingsShell>
      <div className="space-y-6">
        <header className="space-y-1">
          <h1 className="text-[28px] leading-[36px] font-semibold tracking-tight text-foreground">
            Настройки профиля
          </h1>
          <p className="text-sm text-neutral-600">
            Управляйте своими данными, настройками и предпочтениями
          </p>
        </header>

        <form className="space-y-6" onSubmit={handleProfileSubmit}>
          <SettingsPanel
            title="Личная информация"
            description="Основные данные, которые отображаются в профиле."
          >
            <div className="space-y-4">
              <SettingsField
                id="display-name"
                label="Имя"
                hint="Имя будет отображаться в профиле."
              >
                <Input
                  id="display-name"
                  value={displayName}
                  onChange={(event) => setDisplayName(event.target.value)}
                  required
                  maxLength={120}
                />
              </SettingsField>

              <SettingsField
                id="designer-level"
                label="Уровень"
                hint="Помогает подбирать релевантный контент."
              >
                <select
                  id="designer-level"
                  value={designerLevel}
                  onChange={(event) =>
                    setDesignerLevel(
                      event.target.value as Database["public"]["Enums"]["designer_level"],
                    )
                  }
                  className="h-10 w-full rounded-lg border border-neutral-300 bg-white px-3 text-sm text-foreground outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-blue-100"
                >
                  {DESIGNER_LEVEL_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </SettingsField>
            </div>
          </SettingsPanel>

          <SettingsPanel title="Аватар">
            <ProfileAvatarUpload
              displayName={profileRow.display_name}
              email={user.email ?? ""}
              avatarPath={profileRow.avatar_path}
              storageEnabled={storageEnabled}
            />
          </SettingsPanel>

          <SettingsPanel title="Email">
            <div className="space-y-4">
              <SettingsField
                id="email"
                label="Email для входа"
                hint="На этот email приходят важные уведомления."
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <div className="relative min-w-0 flex-1">
                    <Input
                      id="email"
                      type="email"
                      value={user.email ?? ""}
                      readOnly
                      className="pr-28"
                    />
                    {emailConfirmed ? (
                      <Badge
                        variant="secondary"
                        className="absolute top-1/2 right-3 -translate-y-1/2 bg-success-bg text-success"
                      >
                        Подтверждён
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="absolute top-1/2 right-3 -translate-y-1/2"
                      >
                        Не подтверждён
                      </Badge>
                    )}
                  </div>
                  <Link
                    href="/auth/reset-password"
                    className={buttonVariants({ variant: "outline" })}
                  >
                    Изменить email
                  </Link>
                </div>
              </SettingsField>
            </div>
          </SettingsPanel>

          <SettingsPanel id="integrations" title="Telegram">
            <div className="space-y-4">
              <p className="text-sm text-neutral-600">
                Подключите Telegram, чтобы получать уведомления и напоминания.
              </p>
              <SettingsField id="telegram-username" label="Username в Telegram">
                <Input
                  id="telegram-username"
                  value={telegramUsername}
                  onChange={(event) => setTelegramUsername(event.target.value)}
                  placeholder="username"
                />
              </SettingsField>
            </div>
          </SettingsPanel>

          {profileError ? (
            <p className="text-sm text-destructive" role="alert">
              {profileError}
            </p>
          ) : null}
          {profileMessage ? (
            <p className="text-sm text-success" role="status">
              {profileMessage}
            </p>
          ) : null}

          <div className="flex flex-wrap gap-3">
            <Button
              type="submit"
              disabled={!isProfileDirty || isSavingProfile}
            >
              {isSavingProfile ? "Сохраняем…" : "Сохранить изменения"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleProfileReset}
              disabled={!isProfileDirty || isSavingProfile}
            >
              Отменить
            </Button>
          </div>
        </form>

        <form className="space-y-4" onSubmit={handlePasswordSubmit} id="security">
          <SettingsPanel
            title="Смена пароля"
            description="Используйте буквы, цифры и специальные символы."
          >
            <div className="space-y-4">
              <PasswordField
                id="current-password"
                label="Текущий пароль"
                value={currentPassword}
                onChange={setCurrentPassword}
                visible={showCurrentPassword}
                onToggle={() => setShowCurrentPassword((value) => !value)}
              />
              <PasswordField
                id="new-password"
                label="Новый пароль"
                value={newPassword}
                onChange={setNewPassword}
                visible={showNewPassword}
                onToggle={() => setShowNewPassword((value) => !value)}
                placeholder="Мин. 8 символов"
              />
              <PasswordField
                id="confirm-password"
                label="Повторите новый пароль"
                value={confirmPassword}
                onChange={setConfirmPassword}
                visible={showConfirmPassword}
                onToggle={() => setShowConfirmPassword((value) => !value)}
              />
            </div>
          </SettingsPanel>

          {passwordError ? (
            <p className="text-sm text-destructive" role="alert">
              {passwordError}
            </p>
          ) : null}
          {passwordMessage ? (
            <p className="text-sm text-success" role="status">
              {passwordMessage}
            </p>
          ) : null}

          <Button
            type="submit"
            variant="secondary"
            disabled={!passwordFormValid || isUpdatingPassword}
          >
            {isUpdatingPassword ? "Обновляем…" : "Обновить пароль"}
          </Button>
        </form>

        <SettingsPanel title="Действия с аккаунтом">
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-foreground">
                  Выйти из аккаунта
                </p>
                <p className="text-xs text-neutral-500">
                  Завершить текущую сессию на этом устройстве.
                </p>
              </div>
              <SignOutButton variant="outline" size="sm" />
            </div>

            <div className="flex items-center justify-between gap-3 border-t border-neutral-200 pt-4">
              <div>
                <p className="text-sm font-medium text-foreground">
                  Удалить аккаунт
                </p>
                <p className="text-xs text-neutral-500">
                  Запрос через поддержку. Заказы и чеки сохраняются.
                </p>
              </div>
              <Link
                href="/support"
                className={buttonVariants({ variant: "outline", size: "sm" })}
              >
                Написать
              </Link>
            </div>
          </div>
        </SettingsPanel>
      </div>
    </ProfileSettingsShell>
  );
}

function PasswordField({
  id,
  label,
  value,
  onChange,
  visible,
  onToggle,
  placeholder,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  visible: boolean;
  onToggle: () => void;
  placeholder?: string;
}) {
  return (
    <SettingsField id={id} label={label}>
      <div className="relative">
        <Input
          id={id}
          type={visible ? "text" : "password"}
          autoComplete={id.includes("current") ? "current-password" : "new-password"}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className="pr-10"
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute top-1/2 right-3 -translate-y-1/2 text-neutral-500 hover:text-neutral-700"
          aria-label={visible ? "Скрыть пароль" : "Показать пароль"}
        >
          {visible ? (
            <EyeOff className="size-4" aria-hidden />
          ) : (
            <Eye className="size-4" aria-hidden />
          )}
        </button>
      </div>
    </SettingsField>
  );
}
