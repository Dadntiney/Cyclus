import { SkeletonPage } from "@/components/ui/skeleton"

export default function Loading() {
  return <SkeletonPage variant="list" count={5} back />
}
