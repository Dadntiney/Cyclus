"use client"

import { useActionState } from "react"
import { forgotPassword, type ActionState } from "@/lib/actions/auth"
import { Input, Label, FieldError } from "@/components/ui/input"
import { SubmitButton } from "@/components/ui/submit-button"
import { authButtonClassName, authControlClassName } from "@/app/(auth)/auth-styles"

const initialState: ActionState = {}

export function ForgotPasswordForm() {
  const [state, formAction] = useActionState(forgotPassword, initialState)

  if (state.success) {
    return (
      <div className="rounded-xl bg-sage-soft/70 text-sage-dark text-sm p-3.5 leading-relaxed">
        Check je inbox. Als dit e-mailadres bij ons bekend is, ontvang je een
        link om je wachtwoord te resetten.
      </div>
    )
  }

  return (
    <form action={formAction} className="flex flex-col gap-3.5">
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
      <FieldError>{state.error}</FieldError>
      <SubmitButton className={authButtonClassName} pendingText="Bezig...">
        Stuur resetlink
      </SubmitButton>
    </form>
  )
}
