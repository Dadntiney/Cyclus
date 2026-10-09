import type { Metadata } from "next"
import { PageHeader } from "@/components/layout/page-header"
import { AuthLockup } from "../auth-lockup"
import { ForgotPasswordForm } from "./forgot-password-form"

export const metadata: Metadata = { title: "Wachtwoord vergeten" }

export default function ForgotPasswordPage() {
  return (
    <>
      {/* "‹ Inloggen" follows the real history (router.back()); without
          history it replaces this screen with the login form. */}
      <PageHeader
        title="Wachtwoord vergeten"
        subtitle="Vul je e-mailadres in en we sturen je een link om je wachtwoord te resetten."
        back={{ href: "/login", label: "Inloggen" }}
        media={<AuthLockup />}
      />
      <ForgotPasswordForm />
    </>
  )
}
