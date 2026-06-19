function missingEnv(name: string): never {
  throw new Error(
    `Задайте ${name} в .env.local (local) или в Environment Variables на Vercel.`,
  );
}

export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim(),
  );
}

export function getSupabasePublicEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  if (!url) {
    missingEnv("NEXT_PUBLIC_SUPABASE_URL");
  }

  if (!anonKey) {
    missingEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  }

  return { url, anonKey };
}
