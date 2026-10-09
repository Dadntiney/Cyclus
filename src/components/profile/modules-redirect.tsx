"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { SkeletonPage } from "@/components/ui/skeleton"

/**
 * Old /profiel/modules links land on Wat ik gebruik, keeping their
 * #beweging / #voeding / #slaap / #medicatie / #mentale-rust anchor
 * (a server redirect would drop the hash).
 */
export function ModulesRedirect() {
  const router = useRouter()

  useEffect(() => {
    const hash = window.location.hash
    router.replace(`/profiel/gebruik${hash}`)
  }, [router])

  return <SkeletonPage back variant="list" count={5} />
}
