"use client"

import { useActionState } from "react"
import { login, type ActionState } from "@/lib/actions/auth"
import { Input, Label, FieldError } from "@/components/ui/input"
import { SubmitButton } from "@/components/ui/submit-button"
import { PasswordInput } from "@/app/(auth)/password-input"

const initialState: ActionState = {}

export function LoginForm({ next }: { next?: string }) {
  const [state, formAction, pending] = useActionState(login, initialState)
  // Hidden while a new attempt runs, so the same message is announced
  // again (role="alert") when it comes back.
  const error = pending ? undefined : state.error

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="next" value={next ?? ""} />
      <div>
        <Label htmlFor="email">E-mailadres</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          aria-describedby={error ? "login-fout" : undefined}
        />
      </div>
      <div>
        <Label htmlFor="password">Wachtwoord</Label>
        <PasswordInput
          id="password"
          name="password"
          autoComplete="current-password"
          required
          aria-describedby={error ? "login-fout" : undefined}
        />
      </div>
      <FieldError id="login-fout" className="mt-0">
        {error}
      </FieldError>
      <SubmitButton className="mt-2 w-full" pendingText="Bezig met inloggen...">
        Inloggen
      </SubmitButton>
    </form>
  )
}
