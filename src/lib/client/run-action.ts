/** Shown when a Server Action never reached the server or never answered. */
export const OFFLINE_ACTION_MESSAGE =
  "Het lukte even niet om verbinding te maken. Controleer je internet en probeer het opnieuw."

/**
 * Calls a Server Action and turns a network failure (offline, timeout, a
 * deploy swapping the action id) into a normal `{ error }` result.
 *
 * Without this, a rejected action promise inside `startTransition` bubbles
 * up to the route's error boundary: the whole screen is replaced by the
 * error page and whatever she just typed is gone. With it, the component
 * simply shows a calm message and keeps her input.
 */
export async function runAction<T>(action: () => Promise<T>): Promise<T> {
  try {
    return await action()
  } catch (error) {
    // redirect() / notFound() from a Server Action surface as special errors
    // that Next.js must keep handling itself.
    if (isNextNavigationError(error)) throw error
    // Every action in this app reports failure as `{ error: string }`, so
    // callers already handle this shape.
    return { error: OFFLINE_ACTION_MESSAGE } as T
  }
}

function isNextNavigationError(error: unknown): boolean {
  const digest = (error as { digest?: unknown } | null)?.digest
  return typeof digest === "string" && (digest.startsWith("NEXT_REDIRECT") || digest.startsWith("NEXT_HTTP_ERROR_FALLBACK") || digest === "NEXT_NOT_FOUND")
}
