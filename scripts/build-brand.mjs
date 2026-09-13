/**
 * Brand assets, derived from the supplied mark.
 *
 * The artwork is never redrawn: the source is the mark as delivered, and the
 * only transformation is lifting its black plate to alpha (a flood fill from
 * the edges, so black inside the artwork would survive) so the mark can sit on
 * Navio's charcoal surfaces. Everything else — favicon, touch icon, share card
 * — is a size of that same file.
 *
 *   node scripts/build-brand.mjs <path-to-supplied-mark.png>
 */
import sharp from "sharp";
import { mkdirSync } from "node:fs";

const SOURCE = process.argv[2] ?? "assets/brand/navio-mark-original.png";
const OUT = "public/brand";
mkdirSync(OUT, { recursive: true });

const { data, info } = await sharp(SOURCE).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const { width: w, height: h } = info;
const dark = (i) => data[i] < 28 && data[i + 1] < 28 && data[i + 2] < 28;
const seen = new Uint8Array(w * h);
const stack = [];
for (let x = 0; x < w; x++) stack.push([x, 0], [x, h - 1]);
for (let y = 0; y < h; y++) stack.push([0, y], [w - 1, y]);
while (stack.length) {
  const [x, y] = stack.pop();
  if (x < 0 || y < 0 || x >= w || y >= h) continue;
  const p = y * w + x;
  if (seen[p]) continue;
  const i = p * 4;
  if (!dark(i)) continue;
  seen[p] = 1;
  data[i + 3] = 0;
  stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
}

const mark = await sharp(data, { raw: { width: w, height: h, channels: 4 } }).png().toBuffer();

await sharp(mark).resize(512, 512, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toFile(`${OUT}/navio-mark.png`);
await sharp(mark).resize(128, 128, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toFile(`${OUT}/navio-mark-128.png`);
await sharp(mark).resize(64, 64, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toFile(`${OUT}/navio-mark-64.png`);

// Favicon and touch icon keep the mark's own ground: white on near-black.
const plate = { r: 8, g: 9, b: 11, alpha: 1 };
await sharp(mark).resize(48, 48, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .extend({ top: 8, bottom: 8, left: 8, right: 8, background: plate })
  .flatten({ background: "#08090b" }).png().toFile("src/app/icon.png");
await sharp(mark).resize(140, 140, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .extend({ top: 20, bottom: 20, left: 20, right: 20, background: plate })
  .flatten({ background: "#08090b" }).png().toFile("src/app/apple-icon.png");

// Share card: the mark on the product's own ground, centred.
const badge = await sharp(mark).resize(320, 320, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer();
await sharp({ create: { width: 1200, height: 630, channels: 4, background: { r: 8, g: 9, b: 11, alpha: 1 } } })
  .composite([{ input: badge, left: 440, top: 155 }])
  .png()
  .toFile(`${OUT}/og.png`);

console.log("brand assets written from", SOURCE);
