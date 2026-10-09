import { Lockup } from "@/components/brand/lockup"

/**
 * The lockup on the logged-out pages, as PageHeader `media`: under a back
 * link when there is one (PBA-12), 32px above the title.
 */
export function AuthLockup() {
  return <Lockup className="mb-3" />
}
