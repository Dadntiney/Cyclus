import { APP_TIMEZONE } from "@/lib/dates/amsterdam"

/** Hour of the day in Europe/Amsterdam — the server itself runs in UTC. */
function amsterdamHour(now: Date): number {
  const hour = new Intl.DateTimeFormat("en-GB", {
    timeZone: APP_TIMEZONE,
    hour: "2-digit",
    hourCycle: "h23",
  }).format(now)
  return Number(hour)
}

export function greeting(now: Date = new Date()): string {
  const hour = amsterdamHour(now)
  if (hour < 12) return "Goedemorgen"
  if (hour < 18) return "Goedemiddag"
  return "Goedenavond"
}
