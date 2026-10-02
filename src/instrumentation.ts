import type { Instrumentation } from "next"
import { SENTRY_DSN } from "@/lib/monitoring/sentry-options"

export async function register() {
  if (!SENTRY_DSN) return
  const Sentry = await import("@sentry/nextjs")
  const { sentryBaseOptions } = await import("@/lib/monitoring/sentry-options")
  Sentry.init(sentryBaseOptions)
}

export const onRequestError: Instrumentation.onRequestError = async (...args) => {
  if (!SENTRY_DSN) return
  const Sentry = await import("@sentry/nextjs")
  Sentry.captureRequestError(...args)
}
