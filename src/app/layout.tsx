import type { Metadata, Viewport } from "next";
import { Fraunces, Plus_Jakarta_Sans } from "next/font/google";
import { ClientBootstrap } from "@/components/bootstrap/client-bootstrap";
import { getAuthedUser } from "@/lib/supabase/server";
import { getProfile } from "@/lib/data/profile";
import "./globals.css";

const bodyFont = Plus_Jakarta_Sans({
  variable: "--font-body",
  subsets: ["latin"],
});

const displayFont = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Cyclus — Jouw lichaam. Jouw ritme. Jouw dag.",
  description:
    "Cyclus helpt je bewegen, eten en rusten in het ritme van jouw lichaam.",
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
    // "default" reserves an opaque, always-light iOS status bar strip above
    // the page — it never showed our own background, light or dark.
    // "black-translucent" makes iOS overlay the status bar on top of the
    // page instead, so whatever's actually behind it (light or dark
    // --color-cream) shows through. MobileHeader already pads for
    // env(safe-area-inset-top), so content still clears the icons.
    statusBarStyle: "black-translucent",
    title: "Cyclus",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#faf6f0" },
    { media: "(prefers-color-scheme: dark)", color: "#1d1b18" },
  ],
  // Resizes the visual viewport when the on-screen keyboard opens instead
  // of the keyboard simply overlaying fixed-position content (the bottom
  // nav, a sheet's footer) — the browsers that support this (Chrome/
  // Android; Safari is catching up) stop inputs disappearing behind it.
  interactiveWidget: "resizes-content",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // "auto" (or logged out) intentionally sets no attribute: the dark CSS
  // block in globals.css then applies purely via @media
  // (prefers-color-scheme: dark), which the browser re-evaluates live if
  // the device theme changes — no client script needed for that case, and
  // nothing to get wrong on the very first paint (no flash either way).
  // "licht"/"donker" force data-theme explicitly, read here server-side so
  // the very first response already has it — also no flash.
  const user = await getAuthedUser();
  const profile = user ? await getProfile(user.id) : null;
  const theme = profile?.theme_preference;
  const themeAttr = theme === "light" || theme === "dark" ? theme : undefined;

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
  );
}
