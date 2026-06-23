import type { NextConfig } from "next";

function getSupabaseStoragePatterns(): NonNullable<
  NextConfig["images"]
>["remotePatterns"] {
  const patterns: NonNullable<NextConfig["images"]>["remotePatterns"] = [
    {
      protocol: "https",
      hostname: "*.supabase.co",
      pathname: "/storage/v1/object/public/**",
    },
  ];

  const raw = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  if (!raw) {
    return patterns;
  }

  try {
    const hostname = new URL(raw).hostname;
    if (hostname.endsWith(".supabase.co")) {
      patterns.unshift({
        protocol: "https",
        hostname,
        pathname: "/storage/v1/object/public/**",
      });
    }
  } catch {
    // ignore invalid NEXT_PUBLIC_SUPABASE_URL
  }

  return patterns;
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns: getSupabaseStoragePatterns(),
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "15mb",
    },
  },
};

export default nextConfig;
