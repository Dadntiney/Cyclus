"use client"

import { useActionState, useState } from "react"
import Link from "next/link"
import { register, type ActionState } from "@/lib/actions/auth"
import { Input, Label, FieldError } from "@/components/ui/input"
import { SubmitButton } from "@/components/ui/submit-button"
import { authButtonClassName, authControlClassName } from "@/app/(auth)/auth-styles"
import { PRIVACY_POLICY_VERSION } from "@/lib/legal/versions"

const initialState: ActionState = {}

export function RegisterForm() {
  const [state, formAction] = useActionState(register, initialState)
  const [healthConsent, setHealthConsent] = useState(false)
  const [acceptTerms, setAcceptTerms] = useState(false)

  return (
    <form action={formAction} className="flex flex-col gap-3.5">
      <input type="hidden" name="privacyPolicyVersion" value={PRIVACY_POLICY_VERSION} />
      <div>
        <Label htmlFor="email">E-mailadres</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className={authControlClassName}
        />
      </div>
      <div>
        <Label htmlFor="password">Wachtwoord</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
          className={authControlClassName}
        />
        <p className="mt-1.5 text-xs text-ink-soft">Minimaal 8 tekens.</p>
      </div>

      <label className="flex items-start gap-2.5 text-sm text-ink leading-snug cursor-pointer">
        <input
          type="checkbox"
          name="acceptTerms"
          checked={acceptTerms}
          onChange={(e) => setAcceptTerms(e.target.checked)}
          value="true"
          className="mt-1 h-4 w-4 rounded border-line accent-sage-fill shrink-0"
          required
        />
        <span>
          Ik ga akkoord met de{" "}
          <Link href="/voorwaarden" className="text-sage-dark font-medium underline-offset-2 hover:underline">
            gebruiksvoorwaarden
          </Link>
          .
        </span>
      </label>

      <label className="flex items-start gap-2.5 text-sm text-ink leading-snug cursor-pointer">
        <input
          type="checkbox"
          name="healthDataConsent"
          checked={healthConsent}
          onChange={(e) => setHealthConsent(e.target.checked)}
          value="true"
          className="mt-1 h-4 w-4 rounded border-line accent-sage-fill shrink-0"
          required
        />
        <span>
          Ik geef toestemming om mijn gezondheids- en cyclusgegevens te verwerken voor
          personalisatie in de app. Lees de{" "}
          <Link href="/privacy" className="text-sage-dark font-medium underline-offset-2 hover:underline">
            privacyverklaring
          </Link>
          .
        </span>
      </label>

      <FieldError>{state.error}</FieldError>
      <SubmitButton
        className={authButtonClassName}
        pendingText="Bezig met registreren..."
        disabled={!healthConsent || !acceptTerms}
      >
        Account aanmaken
      </SubmitButton>
    </form>
  )
}
