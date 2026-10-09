import { SkeletonPage } from "@/components/ui/skeleton"

/** Mirrors the wizard: progress bar above the question, then one list of choices. */
export default function Loading() {
  return <SkeletonPage back variant="list" count={4} />
}
