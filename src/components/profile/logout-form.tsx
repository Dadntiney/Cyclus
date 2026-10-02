"use client"

import { logout } from "@/lib/actions/auth"
import { clearLocalUserData } from "@/lib/client/account-sync"
import { Button } from "@/components/ui/button"

/** Logs out and removes her personal data from this device first. */
export function LogoutForm() {
  return (
    <form action={logout} onSubmit={clearLocalUserData}>
      <Button type="submit" variant="secondary" className="w-full">
        Uitloggen
      </Button>
    </form>
  )
}
