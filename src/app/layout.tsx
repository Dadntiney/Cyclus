import type { Metadata, Viewport } from "next"
import { cookies } from "next/headers"
import { Fraunces, Plus_Jakarta_Sans } from "next/font/google"
import { ClientBootstrap } from "@/components/bootstrap/client-bootstrap"
import {
  APP_DESCRIPTION,
  APP_DISPLAY_NAME,
  APP_TAGLINE,
  BRAND_HEX,
} from "@/lib/theme/brand"
import { THEME_COOKIE, readThemeAttr } from "@/lib/theme/theme-cookie"
import "./globals.css"

const bodyFont = Plus_Jakarta_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
})

const displayFont = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
  // One weight keeps first paint light; 500 covers headings well enough.
  weight: ["500"],
  display: "swap",
})

export const metadata: Metadata = {
  title: `${APP_DISPLAY_NAME} — ${APP_TAGLINE}`,
  description: APP_DESCRIPTION,
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: APP_DISPLAY_NAME,
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: BRAND_HEX.cream },
    { media: "(prefers-color-scheme: dark)", color: BRAND_HEX.creamDark },
  ],
  interactiveWidget: "resizes-content",
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Theme from a light cookie — no Supabase round-trip on every HTML shell.
  const jar = await cookies()
  const themeAttr = readThemeAttr(jar.get(THEME_COOKIE)?.value)

  return (
    <html
      lang="nl"
      data-theme={themeAttr}
      className={`${bodyFont.variable} ${displayFont.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-cream text-ink font-sans">
        {children}
        <ClientBootstrap />
      </body>
    </html>
  )
}
