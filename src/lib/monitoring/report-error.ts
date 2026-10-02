import { SENTRY_DSN } from "@/lib/monitoring/sentry-options"

/** Report an error caught by an error boundary; a no-op without a DSN. */
export function reportError(error: unknown) {
  console.error(error)
  if (!SENTRY_DSN) return
  void import("@sentry/nextjs").then((Sentry) => Sentry.captureException(error))
}
