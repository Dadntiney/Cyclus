"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

/** Preserve #beweging / #voeding / #slaap / #medicatie / #mentale-rust anchors. */
export default function ProfielModulesRedirect() {
  const router = useRouter()

  useEffect(() => {
    const hash = window.location.hash
    router.replace(`/profiel/gebruik${hash}`)
  }, [router])

  return (
    <div className="w-full max-w-2xl mx-auto px-5 py-10">
      <div className="rounded-3xl bg-sage-soft/50 p-5 min-h-32 skeleton" aria-hidden />
    </div>
  )
}
