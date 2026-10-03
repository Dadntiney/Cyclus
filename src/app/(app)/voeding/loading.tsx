import { SkeletonPage } from "@/components/ui/skeleton"

/** Mirrors /voeding: wide page, back link on md+, title + subtitle, recipe grid. */
export default function Loading() {
  return <SkeletonPage back width="wide" variant="grid" count={6} />
}
