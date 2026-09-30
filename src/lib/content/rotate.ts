/**
 * Deterministic content rotation so the same small pool doesn't feel stuck
 * on "day-hash luck". Shuffle order is stable per user seed; day ISO walks
 * the order so she cycles through the pack before heavy repeats.
 */

function hashString(seed: string): number {
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash)
}

/** Stable shuffle of 0..length-1 for a user/content seed. */
export function rotationOrder(length: number, userSeed: string): number[] {
  const order = Array.from({ length }, (_, i) => i)
  let state = hashString(userSeed) || 1
  for (let i = length - 1; i > 0; i--) {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0
    const j = state % (i + 1)
    ;[order[i], order[j]] = [order[j], order[i]]
  }
  return order
}

/** Day number from an ISO date (or any seed containing YYYY-MM-DD). */
export function dayNumberFromSeed(seed: string): number {
  const match = seed.match(/(\d{4}-\d{2}-\d{2})/)
  if (match) {
    const ms = Date.parse(`${match[1]}T12:00:00Z`)
    if (!Number.isNaN(ms)) return Math.floor(ms / 86_400_000)
  }
  return hashString(seed)
}

/**
 * Pick from a pool with full-cycle rotation for this user before repeats.
 * Falls back to classic hash index when length is 0/1.
 */
export function pickRotating<T>(pool: readonly T[], seed: string, userKey = "rotate"): T {
  if (pool.length === 0) {
    throw new Error("pickRotating: empty pool")
  }
  if (pool.length === 1) return pool[0]
  const order = rotationOrder(pool.length, `${userKey}:${seed.replace(/\d{4}-\d{2}-\d{2}/g, "")}`)
  const day = dayNumberFromSeed(seed)
  return pool[order[day % pool.length]]
}
