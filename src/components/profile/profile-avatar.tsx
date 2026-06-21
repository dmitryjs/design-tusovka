import Image from "next/image";

import { getProfileInitials, resolveAvatarUrl } from "@/lib/profile/format";
import { cn } from "@/lib/utils";

type ProfileAvatarProps = {
  displayName: string | null;
  email: string;
  avatarPath: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
};

const SIZE_CLASSES = {
  sm: "size-12 text-sm",
  md: "size-20 text-xl",
  lg: "size-24 text-2xl",
} as const;

export function ProfileAvatar({
  displayName,
  email,
  avatarPath,
  size = "md",
  className,
}: ProfileAvatarProps) {
  const avatarUrl = resolveAvatarUrl(avatarPath);
  const initials = getProfileInitials(displayName, email);

  if (avatarUrl) {
    return (
      <div
        className={cn(
          "relative shrink-0 overflow-hidden rounded-full bg-neutral-100",
          SIZE_CLASSES[size],
          className,
        )}
      >
        <Image
          src={avatarUrl}
          alt=""
          fill
          className="object-cover"
          sizes={size === "lg" ? "96px" : size === "md" ? "80px" : "48px"}
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full bg-blue-50 font-semibold text-primary",
        SIZE_CLASSES[size],
        className,
      )}
      aria-hidden
    >
      {initials}
    </div>
  );
}
