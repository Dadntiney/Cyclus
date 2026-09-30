import type { CapacitorConfig } from "@capacitor/cli"
import { BRAND_HEX } from "./src/lib/theme/brand"

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
  appName: "GoFiev",
  webDir: ".capacitor-empty",
  server: {
    url: "https://cyclus-eight.vercel.app",
    // Real https origin already — never allow a plaintext fallback.
    cleartext: false,
  },
  backgroundColor: BRAND_HEX.cream,
  ios: {
    contentInset: "always",
    backgroundColor: BRAND_HEX.cream,
    // Real per-user timing for reminders (see src/app/api/cron/send-
    // reminders) needs native push wired up separately — see docs/CAPACITOR.md.
    allowsLinkPreview: false,
  },
  android: {
    backgroundColor: BRAND_HEX.cream,
    allowMixedContent: false,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 400,
      backgroundColor: BRAND_HEX.cream,
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
