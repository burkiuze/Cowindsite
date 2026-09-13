import { chromium } from 'playwright';
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const errors = [];
for (const [name, path, width, height] of [
  ['v-home','/',1440,1000], ['v-access','/access',1440,900],
  ['v-platform','/platform',1440,1000], ['v-mobile','/',420,860],
]) {
  const ctx = await browser.newContext({ viewport: { width, height } });
  const page = await ctx.newPage();
  page.on('pageerror', e => errors.push('PAGEERROR ' + e.message));
  page.on('response', r => { if (r.status() >= 400) errors.push(`HTTP ${r.status()} ${r.url().slice(0,80)}`); });
  await page.goto('http://localhost:3100' + path, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1800);
  await page.screenshot({ path: `/tmp/shots/${name}.png` });
  await ctx.close();
}
console.log('errors:', errors.length ? [...new Set(errors)].slice(0,6) : 'none');
await browser.close();
