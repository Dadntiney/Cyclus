"use client"

import { useActionState } from "react"
import { forgotPassword, type ActionState } from "@/lib/actions/auth"
import { Input, Label, FieldError } from "@/components/ui/input"
import { SubmitButton } from "@/components/ui/submit-button"

const initialState: ActionState = {}

export function ForgotPasswordForm() {
  const [state, formAction] = useActionState(forgotPassword, initialState)

  if (state.success) {
    return (
      <div className="rounded-2xl bg-sage-soft text-sage-dark text-sm p-4">
        {state.testMode ? (
          <>
            Testmodus actief: er wordt geen echte e-mail verstuurd. In
            productie ontvang je hier een resetlink, als dit e-mailadres bij
            ons bekend is.
          </>
        ) : (
          <>
            Check je inbox. Als dit e-mailadres bij ons bekend is, ontvang je
            een link om je wachtwoord te resetten.
          </>
        )}
      </div>
    )
  }

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div>
        <Label htmlFor="email">E-mailadres</Label>
        <Input id="email" name="email" type="email" autoComplete="email" required />
      </div>
      <FieldError>{state.error}</FieldError>
      <SubmitButton className="w-full mt-2" pendingText="Bezig...">
        Stuur resetlink
      </SubmitButton>
    </form>
  )
}
