import { SENTRY_DSN } from "@/lib/monitoring/sentry-options"

// Loaded lazily so the Sentry SDK only reaches the browser when a DSN is set.
if (SENTRY_DSN) {
  void import("@sentry/nextjs").then(async (Sentry) => {
    const { sentryBaseOptions } = await import("@/lib/monitoring/sentry-options")
    Sentry.init(sentryBaseOptions)
  })
}
