/**
 * Mobile screenshots of key Cyclus surfaces for a zero-based UX audit.
 */
import fs from "fs"
import path from "path"
import puppeteer from "puppeteer-core"

const creds = JSON.parse(fs.readFileSync("/tmp/cyclus-test-creds.json", "utf8"))
const delay = (ms) => new Promise((r) => setTimeout(r, ms))
const outDir = "/opt/cursor/artifacts/screenshots/full-audit"
fs.mkdirSync(outDir, { recursive: true })

const routes = [
  ["/vandaag", "01-vandaag"],
  ["/deze-week", "02-deze-week"],
  ["/cyclus", "03-cyclus"],
  ["/cyclus/vandaag", "04-cyclus-fase"],
  ["/cyclus/klachtenlast", "05-klachten"],
  ["/cyclus/samenvatting", "06-cyclus-samenvatting"],
  ["/voor-jou", "07-voor-jou"],
  ["/voeding", "08-voeding"],
  ["/training", "09-beweging"],
  ["/slaap", "10-slaap"],
  ["/mentale-rust", "11-mentale-rust"],
  ["/buddy", "12-buddy"],
  ["/profiel", "13-profiel"],
  ["/kennis", "14-kennis"],
  ["/medicatie", "15-medicatie"],
  ["/dagboek", "16-dagboek"],
]

const report = { pages: [], navLabels: null }

const browser = await puppeteer.launch({
  executablePath: "/usr/bin/google-chrome-stable",
  headless: "new",
  args: ["--no-sandbox", "--disable-gpu", "--hide-scrollbars", "--window-size=390,844"],
  defaultViewport: { width: 390, height: 844, isMobile: true, hasTouch: true },
})
const page = await browser.newPage()
page.setDefaultTimeout(45000)

await page.goto("http://127.0.0.1:3000/login", { waitUntil: "networkidle2" })
await page.type('input[type="email"]', creds.email, { delay: 4 })
await page.type('input[type="password"]', creds.password, { delay: 4 })
await Promise.all([
  page.waitForNavigation({ waitUntil: "networkidle2" }).catch(() => null),
  page.click('button[type="submit"]'),
])
await delay(800)

for (const [route, name] of routes) {
  try {
    await page.goto(`http://127.0.0.1:3000${route}`, { waitUntil: "networkidle2", timeout: 40000 })
    await delay(700)
    const text = await page.evaluate(() => document.body.innerText.slice(0, 900))
    const h1 = await page.evaluate(() => document.querySelector("h1")?.textContent?.trim() || null)
    const h2s = await page.evaluate(() =>
      [...document.querySelectorAll("h2")]
        .slice(0, 8)
        .map((el) => el.textContent?.trim())
        .filter(Boolean),
    )
    const buttons = await page.evaluate(() =>
      [...document.querySelectorAll("a,button")]
        .map((el) => el.textContent?.replace(/\s+/g, " ").trim())
        .filter((t) => t && t.length < 40)
        .slice(0, 25),
    )
    const shot = path.join(outDir, `${name}.png`)
    await page.screenshot({ path: shot, fullPage: false })
    const full = path.join(outDir, `${name}-full.png`)
    await page.screenshot({ path: full, fullPage: true })
    report.pages.push({ route, name, h1, h2s, buttons, textPreview: text, shot, full })
    console.log("OK", route, h1)
  } catch (e) {
    report.pages.push({ route, name, error: e.message })
    console.log("FAIL", route, e.message)
  }
}

report.navLabels = await page.evaluate(() =>
  [...document.querySelectorAll("nav a, nav button")]
    .map((el) => el.textContent?.replace(/\s+/g, " ").trim())
    .filter(Boolean),
)

fs.writeFileSync("/tmp/full-app-audit.json", JSON.stringify(report, null, 2))
console.log("DONE", report.pages.length, "pages")
await browser.close()
