# Cyclus als native app (Capacitor)

Dit document is de handoff voor het daadwerkelijk bouwen en publiceren van de
iOS/Android-app. De scaffolding hieronder is opgezet vanuit een cloud-sandbox
zonder Xcode/Android Studio — die stappen moeten op een Mac (iOS) of met
Android Studio (Android) gebeuren.

## Architectuur: wrapper om de live site, geen aparte build

`capacitor.config.ts` zet `server.url` op `https://cyclus-eight.vercel.app`.
De app laadt dus altijd de actuele, live website — niet een lokaal gebundelde
kopie. Dat betekent:

- Een gewone `git push` (die naar Vercel deployt) bereikt de app **direct**,
  zonder nieuwe App Store/Play Store-indiening — precies zoals bij een
  normale website-update.
- Een nieuwe App Store/Play Store-indiening is alleen nodig bij wijzigingen
  aan de native laag zelf: een nieuwe Capacitor-plugin, het app-icoon, de
  `capacitor.config.ts`, of iets in `ios/`/`android/` rechtstreeks.

Dit past bij de bestaande architectuur (Server Components/Actions,
cookie-based Supabase-auth) — een static export zou dat allemaal breken.

## Wat al klaarstaat

- `capacitor.config.ts` — app-id (placeholder, zie hieronder), server-url,
  splash/status bar-config.
- `ios/` en `android/` — de gegenereerde native projectmappen (Xcode-project
  resp. Gradle-project), inclusief app-icoon en splash screen (licht +
  donker) gegenereerd uit `assets/icon.png` / `assets/splash.png`.
- `src/lib/platform.ts` — `isNativeShell()`, `triggerHaptic()` en
  `initNativeShell()` praten al met de echte `@capacitor/haptics`,
  `@capacitor/status-bar` en `@capacitor/splash-screen`-plugins. Op het web
  blijven dit no-ops (de plugin-code wordt zelfs niet geladen). Favoriet-
  toggle en "oefening afronden" triggeren nu al een haptic zodra dit op een
  toestel draait.
- `src/components/bootstrap/client-bootstrap.tsx` — registreert de service
  worker (web) en roept `initNativeShell()` aan (native: verbergt splash
  screen, zet status bar-kleur).

## Wat jij (op een Mac/met Android Studio) nog moet doen

1. **App-id beslissen.** `capacitor.config.ts` gebruikt nu de placeholder
   `app.cyclus.mobile`. Dit **kan niet meer veranderd worden na de eerste
   App Store Connect/Play Console-indiening** — kies 'm bewust voordat je
   verder gaat, en werk 'm bij in `capacitor.config.ts` én in
   `ios/App/App.xcodeproj` (Xcode: General → Bundle Identifier) en
   `android/app/build.gradle` (`applicationId`).
2. **iOS**: `npx cap sync ios`, dan `ios/App/App.xcworkspace` openen in
   Xcode (niet het `.xcodeproj` — CocoaPods-integratie verwacht de
   workspace). Team/signing instellen, op een simulator/toestel draaien.
3. **Android**: `npx cap sync android`, dan de map `android/` openen in
   Android Studio. Gradle laat het project automatisch syncen.
4. **App Store Connect / Play Console**: nieuwe app aanmaken met het
   gekozen app-id, metadata + screenshots aanleveren (de bestaande
   `assets/icon.png`/`assets/splash.png` zijn de bron — regenereer platform-
   assets met `npx capacitor-assets generate` als het ontwerp wijzigt; dat
   pakket is bewust niet als permanente dependency gehouden, alleen
   eenmalig gebruikt).
5. **Privacy-verklaring / App Privacy-vragenlijst**: verplicht gezien de
   gevoelige aard van cyclus-/medicatiegegevens. Zie ook Apple's striktere
   regels rond reproductieve-gezondheidsdata (sinds 2022).

## Belangrijk: twee gescheiden pushkanalen

Er bestaat nu **Web Push** (VAPID, zie `src/lib/push/*` en
`src/app/api/cron/send-reminders`) — die werkt in een echte browser/PWA,
maar **werkt niet vanzelf in de native WKWebView/Android WebView** die
Capacitor gebruikt: Service Worker Push-events worden daar niet op dezelfde
manier ondersteund.

Voor de native app is een **tweede, apart kanaal** nodig:
`@capacitor/push-notifications`, die rechtstreeks met APNs (iOS) en FCM
(Android) praat. Dit vereist:

- Een Apple Push-certificaat/key (via Apple Developer account).
- Een Firebase-project + `google-services.json` (Android) voor FCM.
- Een uitbreiding van `push_subscriptions` (of een aparte tabel) om
  native device-tokens op te slaan naast/in plaats van web-endpoints, en
  een aanpassing van de cron-verzendlogica om native tokens via
  APNs/FCM te versturen in plaats van (of naast) web-push.

Dit is bewust **niet** in deze sessie gebouwd: het vereist echte Apple/
Google Developer-accounts en certificaten die ik hier niet heb, en zou
zonder die credentials alleen dode code zijn. De architectuur
(`src/lib/platform.ts`, `push_subscriptions`) is wel zo opgezet dat dit
er later relatief eenvoudig naast te zetten is.

## Bekende beperkingen van deze scaffolding

- Niet gebouwd/getest op een simulator of fysiek toestel (geen Xcode/
  Android Studio beschikbaar in de omgeving waarin dit is opgezet).
- `CocoaPods` is niet gedraaid — dat gebeurt automatisch bij de eerste
  `npx cap sync ios` op een Mac met CocoaPods geïnstalleerd.
- Geen Android `keystore` voor release-signing aangemaakt — dat doe je
  zelf in Android Studio (Build → Generate Signed Bundle/APK) en bewaar
    'm veilig; verlies hiervan betekent dat je de app nooit meer kunt
  updaten onder hetzelfde Play Store-vermelding.
