import type { Metadata } from "next"
import { FEATURES } from "@/lib/navigation/features"
import { ModulesRedirect } from "@/components/profile/modules-redirect"

export const metadata: Metadata = { title: FEATURES.gebruik.label }

/** Preserve #beweging / #voeding / #slaap / #medicatie / #mentale-rust anchors. */
export default function ProfielModulesRedirect() {
  return <ModulesRedirect />
}
