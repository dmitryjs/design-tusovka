const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export function getStoragePublicObjectUrl(
  bucket: string,
  objectPath: string,
): string | null {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim().replace(/\/$/, "");
  if (!base) {
    return null;
  }

  return `${base}/storage/v1/object/public/${bucket}/${objectPath}`;
}

export function parseStoragePublicUrl(
  url: string,
): { bucket: string; path: string } | null {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim().replace(/\/$/, "");
  if (!base) {
    return null;
  }

  const prefix = `${base}/storage/v1/object/public/`;
  if (!url.startsWith(prefix)) {
    return null;
  }

  const rest = url.slice(prefix.length);
  const slash = rest.indexOf("/");
  if (slash <= 0) {
    return null;
  }

  return {
    bucket: rest.slice(0, slash),
    path: rest.slice(slash + 1),
  };
}

export function isAllowedAvatarMime(type: string): boolean {
  return ALLOWED_IMAGE_TYPES.has(type);
}
