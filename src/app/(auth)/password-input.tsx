"use client"

import { useEffect, useRef, useState, type ComponentProps } from "react"
import { Eye, EyeOff } from "lucide-react"
import { IconButton } from "@/components/ui/icon-button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

type PasswordInputProps = Omit<ComponentProps<typeof Input>, "type" | "ref"> & { id: string }

/**
 * Password field with a show/hide eye (AUTH-4). The field is the shared
 * Input; the eye only flips its type, so name, autocomplete and validation
 * stay exactly as they were. On submit it switches back to hidden, so a
 * password manager sees a normal password field and nothing stays readable.
 */
export function PasswordInput({ id, className, ...props }: PasswordInputProps) {
  const [visible, setVisible] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const form = inputRef.current?.form
    if (!form) return
    const hide = () => setVisible(false)
    form.addEventListener("submit", hide)
    return () => form.removeEventListener("submit", hide)
  }, [])

  return (
    <div className="relative">
      <Input
        ref={inputRef}
        id={id}
        type={visible ? "text" : "password"}
        className={cn("pr-12", className)}
        {...props}
      />
      <IconButton
        label={visible ? "Wachtwoord verbergen" : "Wachtwoord tonen"}
        icon={visible ? EyeOff : Eye}
        size="sm"
        aria-controls={id}
        // Keep focus (and the phone keyboard) in the field when tapped.
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => setVisible((v) => !v)}
        className="absolute right-0.5 top-0.5"
      />
    </div>
  )
}
