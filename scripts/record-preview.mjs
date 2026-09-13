/**
 * Product preview recorder.
 *
 * Drives the real workspace in a browser and records it, so the video on the
 * public site is the product rather than a mockup. A synthetic cursor is drawn
 * in the page (the OS pointer is never captured in a headless recording) and
 * follows the same coordinates Playwright is actually moving to, with a ripple
 * on each click — what you see is what the run did.
 *
 * Usage (requires the app running with a reachable engine):
 *   node scripts/record-preview.mjs http://localhost:3100
 */
import { chromium } from "playwright";
import { mkdirSync, renameSync, readdirSync } from "node:fs";
import { join } from "node:path";

const BASE = process.argv[2] ?? "http://localhost:3100";
const OUT_DIR = "/tmp/preview-raw";
const WIDTH = 1440;
const HEIGHT = 900;

mkdirSync(OUT_DIR, { recursive: true });

/** Drawn cursor: follows real pointer events, reacts to real clicks. */
const CURSOR_SCRIPT = `
  (() => {
    // Init scripts run before the document exists, so wait for a body to attach to.
    const mount = () => {
    if (!document.body || document.getElementById("__cursor")) return;
    const style = document.createElement("style");
    style.textContent = \`
      #__cursor { position: fixed; z-index: 2147483647; top: 0; left: 0; width: 22px; height: 22px;
        pointer-events: none; transform: translate(-2px, -2px); transition: transform 90ms linear;
        filter: drop-shadow(0 2px 6px rgba(0,0,0,.55)); }
      #__ripple { position: fixed; z-index: 2147483646; width: 34px; height: 34px; margin: -17px 0 0 -17px;
        border-radius: 999px; pointer-events: none; opacity: 0;
        background: radial-gradient(closest-side, rgba(34,207,245,.55), rgba(34,207,245,0)); }
      #__ripple.on { animation: __tap 480ms ease-out; }
      @keyframes __tap { 0% { opacity: .95; transform: scale(.35); } 100% { opacity: 0; transform: scale(1.5); } }
    \`;
    document.head.appendChild(style);

    const cursor = document.createElement("div");
    cursor.id = "__cursor";
    cursor.innerHTML = '<svg viewBox="0 0 24 24" width="22" height="22"><path d="M5 2.5 19 12l-6.2 1.2L10 20Z" fill="#ffffff" stroke="#0b0d10" stroke-width="1.2" stroke-linejoin="round"/></svg>';
    document.body.appendChild(cursor);

    const ripple = document.createElement("div");
    ripple.id = "__ripple";
    document.body.appendChild(ripple);

    addEventListener("mousemove", (event) => {
      cursor.style.transform = \`translate(\${event.clientX - 2}px, \${event.clientY - 2}px)\`;
      ripple.style.left = event.clientX + "px";
      ripple.style.top = event.clientY + "px";
    }, true);

    addEventListener("mousedown", () => {
      ripple.classList.remove("on");
      void ripple.offsetWidth;
      ripple.classList.add("on");
    }, true);
    };

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", mount, { once: true });
    } else {
      mount();
    }
    // Client-side navigation can replace the body: re-mount when it does.
    setInterval(mount, 400);
  })();
`;

const browser = await chromium.launch({
  executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome",
  args: ["--force-device-scale-factor=1", "--hide-scrollbars"],
});

const context = await browser.newContext({
  viewport: { width: WIDTH, height: HEIGHT },
  deviceScaleFactor: 1,
  recordVideo: { dir: OUT_DIR, size: { width: WIDTH, height: HEIGHT } },
  reducedMotion: "no-preference",
});

// Re-inject on every navigation so the cursor survives route changes.
await context.addInitScript(CURSOR_SCRIPT);

const page = await context.newPage();

/** Move like a hand: eased, in steps, never teleporting. */
let at = { x: WIDTH / 2, y: HEIGHT - 120 };
async function glide(x, y, steps = 26) {
  const from = { ...at };
  for (let i = 1; i <= steps; i += 1) {
    const t = i / steps;
    const ease = t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2;
    await page.mouse.move(from.x + (x - from.x) * ease, from.y + (y - from.y) * ease);
    await page.waitForTimeout(12);
  }
  at = { x, y };
}

async function glideToSelector(selector, { dx = 0, dy = 0 } = {}) {
  const element = page.locator(selector).first();
  await element.waitFor({ state: "visible", timeout: 15_000 });
  const box = await element.boundingBox();
  if (!box) throw new Error(`no box for ${selector}`);
  await glide(box.x + box.width / 2 + dx, box.y + box.height / 2 + dy);
  return element;
}

async function click(selector, options) {
  await glideToSelector(selector, options);
  await page.waitForTimeout(180);
  await page.mouse.down();
  await page.waitForTimeout(70);
  await page.mouse.up();
}

/** Type at human speed, with the cursor parked in the field. */
async function type(text, perKey = 34) {
  for (const character of text) {
    await page.keyboard.type(character);
    await page.waitForTimeout(perKey + Math.random() * 26);
  }
}

// --- the run ---------------------------------------------------------------
await page.goto(`${BASE}/app/home`, { waitUntil: "networkidle" });
await page.waitForTimeout(1400);

// Look around the dashboard.
await glide(880, 300);
await page.waitForTimeout(500);
await glide(640, 520, 20);
await page.waitForTimeout(700);

// Into Wind.
await click('a[href="/app/wind"]');
await page.waitForTimeout(1200);

// Ask for an outcome.
await click("textarea");
await page.waitForTimeout(350);
await type(
  "Review our startup for the founders: code architecture and technical debt in the repo, burn rate and runway from the finances, and how we compare against competitors in the market.",
  26,
);
await page.waitForTimeout(500);
await page.keyboard.press("Enter");

// Watch the streams open and land.
await page.waitForTimeout(900);
await glide(900, 330, 22);
await page.waitForTimeout(6000);
await glide(880, 520, 18);
await page.waitForTimeout(4800);

// The approval that was held.
await click('a[href="/app/approvals"]');
await page.waitForTimeout(1500);
await glide(900, 430, 22);
await page.waitForTimeout(1200);
await glideToSelector("text=Approve", { dx: 0, dy: 0 });
await page.waitForTimeout(1600);

// End on the catalogue.
await click('a[href="/app/integrations"]');
await page.waitForTimeout(1800);
await glide(720, 620, 20);
await page.waitForTimeout(1400);

await context.close();
await browser.close();

const file = readdirSync(OUT_DIR).find((name) => name.endsWith(".webm"));
if (!file) throw new Error("no recording produced");
renameSync(join(OUT_DIR, file), join(OUT_DIR, "preview.webm"));
console.log("recorded", join(OUT_DIR, "preview.webm"));
