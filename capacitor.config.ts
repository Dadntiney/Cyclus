import type { CapacitorConfig } from "@capacitor/cli"

// Wraps the LIVE deployed web app rather than a locally bundled copy: the
// native shell always shows whatever is currently on cyclus-eight.vercel.app,
// so a normal web deploy (git push -> Vercel) reaches the app immediately —
// no App Store/Play Store resubmission needed for ordinary content or
// bug-fix changes. This matches the architecture Cyclus already has
// (Next.js Server Components/Actions, cookie-based Supabase auth) far
// better than bundling a static export would.
//
// appId is a placeholder ("app.cyclus.mobile") — decide the real one
// BEFORE the first App Store Connect / Play Console submission, since it
// cannot be changed afterwards without publishing as a new app.
const config: CapacitorConfig = {
  appId: "app.cyclus.mobile",
  appName: "Cyclus",
  webDir: ".capacitor-empty",
  server: {
    url: "https://cyclus-eight.vercel.app",
    // Real https origin already — never allow a plaintext fallback.
    cleartext: false,
  },
  backgroundColor: "#faf6f0",
  ios: {
    contentInset: "always",
    backgroundColor: "#faf6f0",
    // Real per-user timing for reminders (see src/app/api/cron/send-
    // reminders) needs native push wired up separately — see docs/CAPACITOR.md.
    allowsLinkPreview: false,
  },
  android: {
    backgroundColor: "#faf6f0",
    allowMixedContent: false,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 400,
      backgroundColor: "#faf6f0",
      showSpinner: false,
      androidScaleType: "CENTER_CROP",
    },
    StatusBar: {
      // Cream background is light -> dark (ink-colored) status bar text/icons.
      style: "light",
      backgroundColor: "#faf6f0",
    },
    Keyboard: {
      resize: "body",
    },
  },
}

export default config
