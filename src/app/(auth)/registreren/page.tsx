import type { Metadata } from "next"
import Link from "next/link"
import { PageHeader } from "@/components/layout/page-header"
import { textActionClass } from "@/components/ui/button"
import { APP_TAGLINE } from "@/lib/theme/brand"
import { RegisterForm } from "./register-form"

export const metadata: Metadata = { title: "Account aanmaken" }

export default function RegisterPage() {
  return (
    <>
      <PageHeader title="Account aanmaken" subtitle={APP_TAGLINE} back={false} />
      <RegisterForm />
      <p className="mt-6 flex flex-wrap items-center gap-x-1 text-sm text-ink-soft">
        Al een account?
        <Link href="/login" className={textActionClass()}>
          Inloggen
        </Link>
      </p>
    </>
  )
}
