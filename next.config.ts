import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
    // Recipe/avatar photos are immutable once uploaded (same file forever,
    // cache-busted by a new filename/query when they do change), so the
    // optimizer can keep them far longer than the 60s default.
    minimumCacheTTL: 31536000,
  },
};

export default nextConfig;
