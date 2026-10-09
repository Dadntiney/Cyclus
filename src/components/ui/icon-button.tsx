import Link from "next/link"
import { isValidElement } from "react"
import type { ButtonHTMLAttributes, ComponentType, ReactElement, Ref } from "react"
import type { LucideProps } from "lucide-react"
import { ICON } from "@/lib/ui/icon"
import { cn } from "@/lib/utils"

type IconButtonSize = "md" | "sm"
type IconButtonTone = "plain" | "soft"

interface IconButtonBaseProps {
  /** Accessible name (required): what the button does, e.g. "Sluiten". */
  label: string
  /**
   * A lucide icon component (`icon={X}`), sized by `size`; or a ready
   * element (`icon={<Heart {...ICON.md} fill="currentColor" />}`) when it
   * needs extra props.
   */
  icon: ComponentType<LucideProps> | ReactElement
  /** md: 44px circle, 20px icon · sm: 36px circle, 16px icon (hit area stays 44px). */
  size?: IconButtonSize
  /** plain: ink-soft, tinted on press · soft: sage-soft disc, sage-dark icon. */
  tone?: IconButtonTone
  className?: string
}

interface IconButtonAsButton
  extends IconButtonBaseProps,
    Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children" | "aria-label" | "aria-pressed"> {
  href?: undefined
  /** Toggle state (e.g. favourite saved) → aria-pressed. */
  pressed?: boolean
  ref?: Ref<HTMLButtonElement>
}

interface IconButtonAsLink extends IconButtonBaseProps {
  href: string
  pressed?: undefined
  onClick?: undefined
  /** Replace instead of push (e.g. switching a filter). */
  replace?: boolean
  scroll?: boolean
}

export type IconButtonProps = IconButtonAsButton | IconButtonAsLink

const toneClasses: Record<IconButtonTone, string> = {
  plain: "text-ink-soft hover:bg-cream-soft active:bg-cream-soft",
  soft: "bg-sage-soft text-sage-dark hover:bg-sage-soft/80 active:bg-sage-soft/80",
}

function renderIcon(icon: IconButtonBaseProps["icon"], size: IconButtonSize) {
  if (isValidElement(icon)) return icon
  const Icon = icon as ComponentType<LucideProps>
  const spec = size === "md" ? ICON.md : ICON.sm
  return <Icon className={spec.className} strokeWidth={spec.strokeWidth} aria-hidden />
}

function classes(size: IconButtonSize, tone: IconButtonTone, className?: string) {
  return {
    // The 44px target; focus uses the global outline.
    target: cn(
      "group inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full touch-manipulation select-none",
      "disabled:opacity-50 disabled:pointer-events-none",
      className,
    ),
    // The visible disc; for sm it sits centred inside the 44px target.
    disc: cn(
      "inline-flex items-center justify-center rounded-full transition-[background-color,color,transform] duration-fast ease-standard motion-safe:group-active:scale-[0.97]",
      size === "md" ? "h-11 w-11" : "h-9 w-9",
      toneClasses[tone],
    ),
  }
}

/**
 * Round icon-only control with a guaranteed 44×44px hit area. Always has
 * an accessible `label`; use `pressed` for toggles (favourite heart).
 * Renders a next/link when `href` is given, otherwise a button.
 */
export function IconButton(props: IconButtonProps) {
  if (props.href !== undefined) {
    const { href, replace, scroll, label, icon, size = "md", tone = "plain", className } = props
    const c = classes(size, tone, className)
    return (
      <Link href={href} replace={replace} scroll={scroll} aria-label={label} className={c.target}>
        <span className={c.disc}>{renderIcon(icon, size)}</span>
      </Link>
    )
  }

  const { label, icon, size = "md", tone = "plain", className, pressed, type = "button", ref, ...rest } = props
  const c = classes(size, tone, className)
  return (
    <button ref={ref} type={type} aria-label={label} aria-pressed={pressed} className={c.target} {...rest}>
      <span className={c.disc}>{renderIcon(icon, size)}</span>
    </button>
  )
}
