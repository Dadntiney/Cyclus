import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // lucide-react ships as one large barrel file rather than per-icon
  // modules; without this, Turbopack was bundling ~50 icons' worth of code
  // into a single 280KB+ chunk even though only ~34 distinct icons are
  // used anywhere in the app. This tells Next.js to rewrite each icon
  // import to its own module at build time, so the bundle only ever
  // contains the icons actually used.
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
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
