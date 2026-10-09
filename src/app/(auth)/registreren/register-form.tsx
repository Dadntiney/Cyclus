"use client"

import { useActionState, useState, type FormEvent } from "react"
import Link from "next/link"
import { register, type ActionState } from "@/lib/actions/auth"
import { Checkbox } from "@/components/ui/checkbox"
import { Input, Label, FieldError } from "@/components/ui/input"
import { SubmitButton } from "@/components/ui/submit-button"
import { PasswordInput } from "@/app/(auth)/password-input"
import { PRIVACY_POLICY_VERSION } from "@/lib/legal/versions"

const initialState: ActionState = {}

const CONSENT_MISSING = "Vink dit aan om verder te gaan."
const inlineLinkClass = "font-medium text-sage-dark underline underline-offset-2"

type Consent = "acceptTerms" | "healthDataConsent"

export function RegisterForm() {
  const [state, formAction, pending] = useActionState(register, initialState)
  const [healthConsent, setHealthConsent] = useState(false)
  const [acceptTerms, setAcceptTerms] = useState(false)
  // Which consent box she tried to submit without (AUTH-3). The boxes stay
  // `required`, so the browser still blocks the submit exactly as before;
  // we only replace its bubble with a message under the box itself.
  const [missing, setMissing] = useState<Record<Consent, boolean>>({
    acceptTerms: false,
    healthDataConsent: false,
  })
  const error = pending ? undefined : state.error

  function onConsentInvalid(name: Consent) {
    return (e: FormEvent<HTMLInputElement>) => {
      e.preventDefault()
      setMissing((m) => ({ ...m, [name]: true }))
      // Point her to the first thing that is missing — unless an earlier
      // field (e-mail, wachtwoord) is invalid: the browser reports that one.
      const box = e.currentTarget
      if (box.form?.querySelector("input:invalid") === box) box.focus()
    }
  }

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="privacyPolicyVersion" value={PRIVACY_POLICY_VERSION} />
      <div>
        <Label htmlFor="email">E-mailadres</Label>
        <Input id="email" name="email" type="email" autoComplete="email" required />
      </div>
      <div>
        <Label htmlFor="password">Wachtwoord</Label>
        <PasswordInput
          id="password"
          name="password"
          autoComplete="new-password"
          minLength={8}
          required
          aria-describedby="password-hint"
        />
        <p id="password-hint" className="mt-1.5 text-sm text-ink-soft">
          Minimaal 8 tekens.
        </p>
      </div>

      <div className="flex flex-col">
        <div>
          <Checkbox
            name="acceptTerms"
            value="true"
            required
            checked={acceptTerms}
            onCheckedChange={(checked) => {
              setAcceptTerms(checked)
              if (checked) setMissing((m) => ({ ...m, acceptTerms: false }))
            }}
            onInvalid={onConsentInvalid("acceptTerms")}
            aria-invalid={missing.acceptTerms || undefined}
            aria-describedby={missing.acceptTerms ? "accept-terms-fout" : undefined}
          >
            Ik ga akkoord met de{" "}
            <Link href="/voorwaarden" className={inlineLinkClass}>
              gebruiksvoorwaarden
            </Link>
            .
          </Checkbox>
          <FieldError id="accept-terms-fout" className="mt-0 mb-2 pl-9">
            {missing.acceptTerms ? CONSENT_MISSING : undefined}
          </FieldError>
        </div>

        <div>
          <Checkbox
            name="healthDataConsent"
            value="true"
            required
            checked={healthConsent}
            onCheckedChange={(checked) => {
              setHealthConsent(checked)
              if (checked) setMissing((m) => ({ ...m, healthDataConsent: false }))
            }}
            onInvalid={onConsentInvalid("healthDataConsent")}
            aria-invalid={missing.healthDataConsent || undefined}
            aria-describedby={missing.healthDataConsent ? "health-consent-fout" : undefined}
          >
            Ik geef toestemming om mijn gezondheids- en cyclusgegevens te verwerken voor
            personalisatie in de app. Lees de{" "}
            <Link href="/privacy" className={inlineLinkClass}>
              privacyverklaring
            </Link>
            .
          </Checkbox>
          <FieldError id="health-consent-fout" className="mt-0 mb-2 pl-9">
            {missing.healthDataConsent ? CONSENT_MISSING : undefined}
          </FieldError>
        </div>
      </div>

      <FieldError id="registreren-fout" className="mt-0">
        {error}
      </FieldError>
      <SubmitButton className="mt-2 w-full" pendingText="Bezig met registreren...">
        Account aanmaken
      </SubmitButton>
    </form>
  )
}
