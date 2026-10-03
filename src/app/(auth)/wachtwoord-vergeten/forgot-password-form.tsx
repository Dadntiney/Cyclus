"use client"

import { useActionState, useEffect, useRef } from "react"
import { MailCheck } from "lucide-react"
import { forgotPassword, type ActionState } from "@/lib/actions/auth"
import { Input, Label, FieldError } from "@/components/ui/input"
import { SubmitButton } from "@/components/ui/submit-button"
import { ICON } from "@/lib/ui/icon"

const initialState: ActionState = {}

export function ForgotPasswordForm() {
  const [state, formAction, pending] = useActionState(forgotPassword, initialState)
  const error = pending ? undefined : state.error

  if (state.success) return <SentNotice />

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div>
        <Label htmlFor="email">E-mailadres</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          aria-describedby={error ? "wachtwoord-vergeten-fout" : undefined}
        />
      </div>
      <FieldError id="wachtwoord-vergeten-fout" className="mt-0">
        {error}
      </FieldError>
      <SubmitButton className="mt-2 w-full" pendingText="Bezig...">
        Stuur resetlink
      </SubmitButton>
    </form>
  )
}

/**
 * Replaces the form once the link is on its way. It takes focus (the
 * submit button it replaces is gone), so a screen reader reads it out.
 */
function SentNotice() {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    ref.current?.focus()
  }, [])

  return (
    <div ref={ref} role="status" tabIndex={-1} data-focus-target="" className="flex items-start gap-3">
      <span
        aria-hidden
        className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-sage-soft text-sage-dark"
      >
        <MailCheck {...ICON.md} />
      </span>
      <p className="pt-2 text-base text-ink">
        Check je inbox. Als dit e-mailadres bij ons bekend is, ontvang je een link om je wachtwoord
        te resetten.
      </p>
    </div>
  )
}
