import type { ErrorEvent } from "@sentry/nextjs"

/**
 * Shared Sentry settings. GoFiev handles health data, so errors are sent
 * without personal data: no IP, cookies, headers, request bodies or user
 * details, no session replay and no performance tracing. Only the error,
 * its stack trace and the page path.
 *
 * Without a DSN Sentry stays off entirely (local development, previews).
 */
export const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN

export function scrubEvent(event: ErrorEvent): ErrorEvent {
  delete event.user
  if (event.request) {
    delete event.request.cookies
    delete event.request.headers
    delete event.request.data
    delete event.request.query_string
    if (event.request.url) event.request.url = event.request.url.split("?")[0]
  }
  if (event.breadcrumbs) {
    // Breadcrumbs can carry console output and fetched URLs with ids.
    event.breadcrumbs = event.breadcrumbs.filter((b) => b.category === "navigation")
  }
  return event
}

export const sentryBaseOptions = {
  dsn: SENTRY_DSN,
  enabled: Boolean(SENTRY_DSN),
  environment: process.env.VERCEL_ENV ?? process.env.NODE_ENV,
  sendDefaultPii: false,
  tracesSampleRate: 0,
  beforeSend: scrubEvent,
}
