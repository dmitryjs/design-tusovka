import "server-only";

const PUBLIC_MEDIA_BUCKET = "public-media";

export function getPublicMediaBucket(): string {
  return PUBLIC_MEDIA_BUCKET;
}

/** Server: env для загрузки через service role (админка, аватары). */
export function isStorageUploadConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() &&
      process.env.SUPABASE_SERVICE_ROLE_KEY?.trim(),
  );
}
