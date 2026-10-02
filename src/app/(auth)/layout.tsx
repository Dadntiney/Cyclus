import { DropletMark } from "@/components/brand/droplet-mark"
import { APP_DISPLAY_NAME } from "@/lib/theme/brand"

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-6 py-14 bg-cream">
      <div className="w-full max-w-[22.5rem]">
        <div className="text-center mb-10 flex flex-col items-center gap-3">
          <DropletMark className="h-10 w-8" />
          <span className="font-display text-3xl text-ink">
            {APP_DISPLAY_NAME}
          </span>
        </div>
        {children}
      </div>
    </div>
  )
}
