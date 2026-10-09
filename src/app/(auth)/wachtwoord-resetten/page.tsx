import type { Metadata } from "next"
import { PageHeader } from "@/components/layout/page-header"
import { AuthLockup } from "../auth-lockup"
import { ResetPasswordForm } from "./reset-password-form"

export const metadata: Metadata = { title: "Nieuw wachtwoord" }

export default function ResetPasswordPage() {
  return (
    <>
      <PageHeader
        title="Nieuw wachtwoord"
        subtitle="Kies een nieuw wachtwoord voor je account."
        back={false}
        media={<AuthLockup />}
      />
      <ResetPasswordForm />
    </>
  )
}
