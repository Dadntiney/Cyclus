import { chromium } from 'playwright-core';
import fs from 'fs';

const BASE = 'https://cyclus-eight.vercel.app';
const OUT = '/opt/cursor/artifacts/screenshots/audit';
fs.mkdirSync(OUT, { recursive: true });

const routes = [
  '/vandaag',
  '/deze-week',
  '/deze-week/boodschappen',
  '/cyclus',
  '/cyclus/vandaag',
  '/cyclus/overgang',
  '/cyclus/klachtenlast',
  '/cyclus/samenvatting',
  '/voor-jou',
  '/training',
  '/voeding',
  '/mentale-rust',
  '/slaap',
  '/buddy',
  '/dagboek',
  '/kennis',
  '/medicatie',
  '/profiel',
  '/login',
];

const browser = await chromium.launch({
  executablePath: '/usr/local/bin/google-chrome',
  headless: true,
  args: ['--no-sandbox', '--disable-dev-shm-usage'],
});
const context = await browser.newContext({
  viewport: { width: 390, height: 844 },
  userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
});
const page = await context.newPage();

await page.goto(`${BASE}/login`, { waitUntil: 'networkidle', timeout: 60000 });
await page.fill('input[type="email"]', 'ux-feedback-b6721976@cyclus.test');
await page.fill('input[type="password"]', 'CyclusTest1!');
await Promise.all([
  page.waitForURL(/\/(vandaag|onboarding)/, { timeout: 45000 }),
  page.click('button[type="submit"]'),
]);
await page.waitForTimeout(1200);

const report = [];
for (const route of routes) {
  const name = route.replace(/\//g, '_').replace(/^_/, '') || 'root';
  try {
    const res = await page.goto(`${BASE}${route}`, { waitUntil: 'networkidle', timeout: 45000 });
    await page.waitForTimeout(900);
    const path = `${OUT}/${name}.png`;
    await page.screenshot({ path, fullPage: true });
    const title = await page.locator('h1').first().innerText().catch(() => '');
    const textLen = (await page.locator('body').innerText()).length;
    const cards = await page.locator('[class*="rounded"]').count();
    report.push({
      route,
      status: res?.status() ?? 0,
      title: title.slice(0, 80),
      textLen,
      url: page.url(),
      shot: path,
    });
    console.log('OK', route, res?.status(), title.slice(0, 40));
  } catch (e) {
    report.push({ route, error: String(e).slice(0, 200) });
    console.log('FAIL', route, e.message?.slice(0, 120));
  }
}

// Dark mode sample on Vandaag
await page.goto(`${BASE}/vandaag`, { waitUntil: 'networkidle' });
await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'dark'));
await page.waitForTimeout(500);
await page.screenshot({ path: `${OUT}/vandaag_dark.png`, fullPage: true });
report.push({ route: '/vandaag?dark', shot: `${OUT}/vandaag_dark.png` });

// Desktop vandaag
await page.setViewportSize({ width: 1280, height: 800 });
await page.evaluate(() => document.documentElement.removeAttribute('data-theme'));
await page.goto(`${BASE}/vandaag`, { waitUntil: 'networkidle' });
await page.screenshot({ path: `${OUT}/vandaag_desktop.png`, fullPage: false });

fs.writeFileSync(`${OUT}/report.json`, JSON.stringify(report, null, 2));
console.log('DONE', report.length);
await browser.close();
