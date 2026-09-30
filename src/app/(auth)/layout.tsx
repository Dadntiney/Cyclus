import { BuddyMark } from "@/components/buddy/buddy-mark"
import { APP_DISPLAY_NAME } from "@/lib/theme/brand"

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-10 py-14 bg-cream">
      <div className="w-full max-w-[17.5rem]">
        <div className="text-center mb-9 flex flex-col items-center gap-2">
          <BuddyMark size="md" />
          <span className="font-display text-xl tracking-tight text-sage-dark">
            {APP_DISPLAY_NAME}
          </span>
        </div>
        {children}
      </div>
    </div>
  )
}
