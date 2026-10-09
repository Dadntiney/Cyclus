import { SkeletonPage } from "@/components/ui/skeleton"

/**
 * Cyclus: header, phase status, calendar, patterns. In the (hub) route
 * group so it covers only /cyclus itself: Jouw fase, De overgang, Voor je
 * arts and Klachtenlast show their own skeleton, also when opened from
 * another tab (a loading.tsx wraps every segment below it).
 */
export default function Loading() {
  return <SkeletonPage count={3} />
}
