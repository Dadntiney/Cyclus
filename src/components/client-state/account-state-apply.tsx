"use client"

import { useEffect } from "react"
import { applyAccountState } from "@/lib/client/account-sync"

export function AccountStateApply({
  userId,
  rows,
}: {
  userId: string
  rows: { key: string; value: string }[]
}) {
  useEffect(() => {
    applyAccountState(userId, rows)
  }, [userId, rows])

  return null
}
