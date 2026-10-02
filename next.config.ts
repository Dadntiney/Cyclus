import type { NextConfig } from "next";

// Baseline hardening headers for every response. A full Content-Security-
// Policy is deliberately not enforced yet: Next.js inline bootstrap scripts
// need nonces first, and a wrong CSP would blank the app.
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Nobody may embed GoFiev in a frame (clickjacking); the native shell
  // loads it as a top-level page, so this does not affect Capacitor.
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Content-Security-Policy", value: "frame-ancestors 'none'" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()",
  },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
]

const nextConfig: NextConfig = {
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }]
  },
  // lucide-react ships as one large barrel file rather than per-icon
  // modules; without this, Turbopack was bundling ~50 icons' worth of code
  // into a single 280KB+ chunk even though only ~34 distinct icons are
  // used anywhere in the app. This tells Next.js to rewrite each icon
  // import to its own module at build time, so the bundle only ever
  // contains the icons actually used.
  experimental: {
    // lucide + date-fns are large barrels; rewrite to per-export modules.
    optimizePackageImports: ["lucide-react", "date-fns"],
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
