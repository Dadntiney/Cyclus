import { expect, test, type Page } from "@playwright/test"

const email = process.env.E2E_EMAIL
const password = process.env.E2E_PASSWORD

test.describe("zonder account", () => {
  test("welkomstpagina en inloggen laden", async ({ page }) => {
    await page.goto("/")
    await expect(page.getByRole("link", { name: /probeer gofiev/i })).toBeVisible()
    await page.goto("/login")
    await expect(page.locator("input[type=email]")).toBeVisible()
  })

  test("beveiligde pagina stuurt naar inloggen", async ({ page }) => {
    await page.goto("/vandaag")
    await expect(page).toHaveURL(/\/login\?next=%2Fvandaag/)
  })

  test("offline-pagina is los bereikbaar", async ({ page }) => {
    await page.goto("/offline.html")
    await expect(page.getByRole("heading", { name: /offline/i })).toBeVisible()
  })
})

async function login(page: Page) {
  await page.goto("/login")
  await page.fill("input[type=email]", email!)
  await page.fill("input[type=password]", password!)
  await page.getByRole("button", { name: /inloggen/i }).click()
  await expect(page).toHaveURL(/\/vandaag/, { timeout: 20_000 })
}

// Every main screen must render a heading without hitting an error screen.
// Headings depend on her data (phase names, greeting), so only presence is
// checked.
const SCREENS = [
  "/vandaag",
  "/ontdek",
  "/deze-week",
  "/deze-week/boodschappen",
  "/cyclus",
  "/cyclus/vandaag",
  "/cyclus/overgang",
  "/voeding",
  "/training",
  "/mentale-rust",
  "/slaap",
  "/kennis",
  "/dagboek",
  "/favorieten",
  "/medicatie",
  "/buddy",
  "/profiel",
  "/profiel/gegevens",
]

test.describe("met testaccount", () => {
  test.skip(!email || !password, "E2E_EMAIL en E2E_PASSWORD ontbreken")

  test("alle hoofdschermen laden", async ({ page }) => {
    const errors: string[] = []
    page.on("pageerror", (e) => errors.push(e.message))
    await login(page)
    for (const path of SCREENS) {
      const response = await page.goto(path)
      expect(response?.status(), path).toBeLessThan(400)
      await expect(page.getByRole("heading", { level: 1 }).first(), path).toHaveText(/\S/)
      await expect(page.getByText(/er ging iets mis/i), path).toHaveCount(0)
    }
    expect(errors).toEqual([])
  })

  test("navigeren via het menu", async ({ page, isMobile }) => {
    await login(page)
    const nav = isMobile
      ? page.getByRole("navigation").last()
      : page.getByRole("complementary").getByRole("navigation")
    for (const name of ["Ontdek", "Cyclus", "Profiel", "Vandaag"]) {
      await nav.getByRole("link", { name }).click()
      await expect(page).toHaveURL(new RegExp(`/${name.toLowerCase()}`))
    }
  })

  test("boodschap afvinken blijft bewaard", async ({ page }, testInfo) => {
    // One project only: both would flip the same item on the same account.
    test.skip(testInfo.project.name !== "desktop", "draait alleen op desktop")
    await login(page)
    await page.goto("/deze-week/boodschappen")
    const first = page.getByRole("checkbox").first()
    await first.waitFor({ timeout: 10_000 }).catch(() => {})
    test.skip((await first.count()) === 0, "geen boodschappen deze week")
    const name = (await first.locator("span").nth(1).locator("span").first().innerText()).trim()
    const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    const item = page.getByRole("checkbox", { name: new RegExp(`^${escaped}`) })
    const before = await item.getAttribute("aria-checked")
    await item.click()
    await expect(item).not.toHaveAttribute("aria-checked", before!)
    await page.reload()
    await expect(item).not.toHaveAttribute("aria-checked", before!)
    // Zet hem terug, zodat de test het account niet blijvend verandert.
    await item.click()
    await expect(item).toHaveAttribute("aria-checked", before!)
  })
})
