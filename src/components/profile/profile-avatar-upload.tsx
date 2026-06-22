"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";

import {
  removeProfileAvatarAction,
  uploadProfileAvatarAction,
} from "@/app/profile/settings/avatar-actions";
import { ProfileAvatar } from "@/components/profile/profile-avatar";
import { Button } from "@/components/ui/button";

type ProfileAvatarUploadProps = {
  displayName: string | null;
  email: string;
  avatarPath: string | null;
  storageEnabled: boolean;
};

export function ProfileAvatarUpload({
  displayName,
  email,
  avatarPath,
  storageEnabled,
}: ProfileAvatarUploadProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [localAvatarPath, setLocalAvatarPath] = useState(avatarPath);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, startUpload] = useTransition();
  const [isRemoving, startRemove] = useTransition();
  const busy = isUploading || isRemoving;

  function handlePickFile() {
    setError(null);
    inputRef.current?.click();
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    setError(null);
    const formData = new FormData();
    formData.set("file", file);

    startUpload(async () => {
      const result = await uploadProfileAvatarAction(formData);

      if (!result.ok) {
        setError(result.error);
        return;
      }

      router.refresh();
    });
  }

  function handleRemove() {
    setError(null);
    startRemove(async () => {
      const result = await removeProfileAvatarAction();

      if (!result.ok) {
        setError(result.error);
        return;
      }

      setLocalAvatarPath(null);
      router.refresh();
    });
  }

  if (!storageEnabled) {
    return (
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <ProfileAvatar
          displayName={displayName}
          email={email}
          avatarPath={localAvatarPath}
          size="lg"
        />
        <div className="space-y-3">
          <p className="text-sm text-neutral-600">JPG, PNG или WEBP. Максимум 10 МБ.</p>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" size="sm" disabled>
              <Pencil className="size-4" aria-hidden />
              Изменить
            </Button>
            <Button type="button" variant="outline" size="sm" disabled>
              <Trash2 className="size-4" aria-hidden />
              Удалить
            </Button>
          </div>
          <p className="text-xs text-neutral-500">
            Подключите Storage: выполните{" "}
            <code className="rounded bg-neutral-100 px-1">cloud_patch_storage.sql</code> в Supabase
            и задайте <code className="rounded bg-neutral-100 px-1">SUPABASE_SERVICE_ROLE_KEY</code>{" "}
            в <code className="rounded bg-neutral-100 px-1">.env.local</code>.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
      <ProfileAvatar
        displayName={displayName}
        email={email}
        avatarPath={localAvatarPath}
        size="lg"
      />
      <div className="space-y-3">
        <p className="text-sm text-neutral-600">JPG, PNG или WEBP. Максимум 10 МБ.</p>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="sr-only"
          onChange={handleFileChange}
        />
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={busy}
            onClick={handlePickFile}
          >
            <Pencil className="size-4" aria-hidden />
            {isUploading ? "Загрузка…" : "Изменить"}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={busy || !localAvatarPath}
            onClick={handleRemove}
          >
            <Trash2 className="size-4" aria-hidden />
            {isRemoving ? "Удаление…" : "Удалить"}
          </Button>
        </div>
        {error ? (
          <p className="text-sm text-destructive-foreground" role="alert">
            {error}
          </p>
        ) : null}
      </div>
    </div>
  );
}
