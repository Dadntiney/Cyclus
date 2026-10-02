import type { Metadata, Viewport } from "next"
import { Fraunces, Plus_Jakarta_Sans } from "next/font/google"
import { ClientBootstrap } from "@/components/bootstrap/client-bootstrap"
import {
  APP_DESCRIPTION,
  APP_DISPLAY_NAME,
  APP_TAGLINE,
  BRAND_HEX,
} from "@/lib/theme/brand"
import { THEME_COOKIE } from "@/lib/theme/theme-cookie"
import "./globals.css"

const bodyFont = Plus_Jakarta_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
})

const displayFont = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
  // Variable weight + the soft axis (see .font-display in globals.css);
  // opsz lets large numbers and headings pick their display cut.
  axes: ["SOFT", "opsz"],
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

// Applies the Dag/Nacht choice from its cookie before first paint. Reading
// the cookie here instead of on the server keeps the root layout free of
// request data, so public pages (login, privacy, terms) can be served
// statically from the CDN.
const themeScript = `try{var m=document.cookie.match(/(?:^|; )${THEME_COOKIE}=(light|dark)/);if(m)document.documentElement.dataset.theme=m[1]}catch(e){}`

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="nl"
      suppressHydrationWarning
      className={`${bodyFont.variable} ${displayFont.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-full flex flex-col bg-cream text-ink font-sans">
        {children}
        <ClientBootstrap />
      </body>
    </html>
  )
}
