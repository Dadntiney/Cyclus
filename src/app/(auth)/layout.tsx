import { BuddyMark } from "@/components/buddy/buddy-mark"
import { APP_DISPLAY_NAME } from "@/lib/theme/brand"

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12 bg-cream">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8 flex flex-col items-center gap-2.5">
          <BuddyMark size="lg" />
          <span className="font-display text-2xl text-sage-dark">{APP_DISPLAY_NAME}</span>
        </div>
        {children}
      </div>
    </div>
  )
}
