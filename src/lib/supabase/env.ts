function missingEnv(name: string): never {
  throw new Error(`Задайте ${name} в .env.local`);
}

export function getSupabasePublicEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url) {
    missingEnv("NEXT_PUBLIC_SUPABASE_URL");
  }

  if (!anonKey) {
    missingEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  }

  return { url, anonKey };
}
