import { chromium } from 'playwright';
const pages = [
  ['m-home','/'], ['m-platform','/platform'], ['m-integrations','/integrations'],
  ['m-about','/about'], ['m-faq','/faq'], ['w-integrations','/app/integrations'], ['w-home','/app/home'],
];
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
const page = await ctx.newPage();
const errors = [];
page.on('pageerror', e => errors.push('PAGEERROR ' + e.message));
page.on('console', m => { if (m.type() === 'error') errors.push(m.text().slice(0,160)); });
page.on('response', r => { if (r.status() >= 400) errors.push(`HTTP ${r.status()} ${r.url().slice(0,90)}`); });
for (const [name, path] of pages) {
  await page.goto('http://localhost:3100' + path, { waitUntil: 'networkidle' });
  await page.waitForTimeout(700);
  await page.screenshot({ path: `/tmp/shots/${name}.png` });
}
// search behaviour on the big gallery
await page.goto('http://localhost:3100/integrations', { waitUntil: 'networkidle' });
await page.fill('input[placeholder^="Search"]', 'hub');
await page.waitForTimeout(500);
await page.screenshot({ path: '/tmp/shots/m-search.png' });
console.log('errors:', errors.length ? [...new Set(errors)].slice(0,8) : 'none');
await browser.close();
