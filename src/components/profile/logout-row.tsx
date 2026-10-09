"use client"

import { useFormStatus } from "react-dom"
import { LogOut } from "lucide-react"
import { logout } from "@/lib/actions/auth"
import { clearLocalUserData } from "@/lib/client/account-sync"
import { ICON } from "@/lib/ui/icon"

function LogoutButton() {
  const { pending } = useFormStatus()
  return (
    // Same anatomy as a ListRow (icon tile · title, 56px, outline inside
    // the row), but a real submit button so logging out keeps working as
    // a plain form post.
    <button
      type="submit"
      disabled={pending}
      className="flex w-full min-h-14 items-center gap-3.5 px-4 py-3 text-left touch-manipulation transition-colors duration-fast ease-standard -outline-offset-2 hover:bg-cream-soft/60 active:bg-cream-soft disabled:opacity-60"
    >
      <span
        aria-hidden
        className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-inset bg-sage-soft text-sage-dark"
      >
        <LogOut {...ICON.sm} />
      </span>
      <span className="flex-1 text-base font-medium text-ink">{pending ? "Bezig met uitloggen…" : "Uitloggen"}</span>
    </button>
  )
}

/**
 * Uitloggen as the last row of the Account group (the only place it lives).
 * Removes her personal data from this device first, then logs out.
 */
export function LogoutRow() {
  return (
    <li>
      <form action={logout} onSubmit={clearLocalUserData}>
        <LogoutButton />
      </form>
    </li>
  )
}
