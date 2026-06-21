import type { Database } from "@/types/database.types";

const PROFILE_LEVEL_LABELS: Record<
  Database["public"]["Enums"]["designer_level"],
  string
> = {
  junior: "Junior",
  middle: "Middle",
  senior: "Senior",
  all: "Не указан",
};

export function getProfileLevelLabel(
  level: Database["public"]["Enums"]["designer_level"],
): string {
  return PROFILE_LEVEL_LABELS[level];
}

export function getDaysOnPlatform(createdAt: string): number {
  const created = new Date(createdAt);
  const now = new Date();
  const diffMs = now.getTime() - created.getTime();

  return Math.max(1, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
}

export function formatProfileDate(value: string): string {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export function getProfileDisplayName(
  displayName: string | null,
  email: string,
): string {
  if (displayName?.trim()) {
    return displayName.trim();
  }

  const localPart = email.split("@")[0]?.trim();
  return localPart || "Пользователь";
}

export function getProfileInitials(
  displayName: string | null,
  email: string,
): string {
  const name = getProfileDisplayName(displayName, email);
  const parts = name.split(/\s+/).filter(Boolean);

  if (parts.length >= 2) {
    return `${parts[0]![0] ?? ""}${parts[1]![0] ?? ""}`.toUpperCase();
  }

  return (name[0] ?? "П").toUpperCase();
}

export function resolveAvatarUrl(
  avatarPath: string | null | undefined,
): string | null {
  if (!avatarPath) {
    return null;
  }

  if (
    avatarPath.startsWith("http://") ||
    avatarPath.startsWith("https://") ||
    avatarPath.startsWith("/")
  ) {
    return avatarPath;
  }

  return `/storage/v1/object/public/${avatarPath}`;
}
