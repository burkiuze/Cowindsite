import sharp from "sharp";

/**
 * Wordmarks, in a square.
 *
 * About a third of the bulk logo set is a wordmark — the brand's name set in
 * type, four or five times wider than it is tall. Shrunk into a 26px square it
 * becomes a grey smudge, which is worse than no logo: it looks broken. Most of
 * those wordmarks open with an icon, though, and that icon is the brand's
 * actual mark. This finds it and cuts it out, from the full-resolution source,
 * so it stays sharp.
 *
 * A wordmark with no icon in front of it is reported as such and left alone;
 * the interface draws a lettered tile in the brand's own colour for those
 * rather than inventing a symbol the brand does not have.
 */

const WIDE = 1.9;
const INK_ALPHA = 24;
const BACKGROUND_DISTANCE = 42;

/**
 * @returns {Promise<{ kind: "square" } | { kind: "icon", buffer: Buffer } | { kind: "wordmark", tint: string | null }>}
 */
export async function squareMark(input) {
  const { data, info } = await sharp(input, { density: 300 })
    .resize({ width: 1200, height: 1200, fit: "inside", withoutEnlargement: true })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const { width, height } = info;

  // An opaque image (a JPEG, a PNG on white) has a background colour rather
  // than transparency: read it from the corners and treat it as empty.
  const corner = (x, y) => {
    const i = (y * width + x) * 4;
    return [data[i], data[i + 1], data[i + 2], data[i + 3]];
  };
  const corners = [corner(0, 0), corner(width - 1, 0), corner(0, height - 1), corner(width - 1, height - 1)];
  const opaque = corners.every((pixel) => pixel[3] > 240);
  const background = opaque ? average(corners) : null;

  const ink = (x, y) => {
    const i = (y * width + x) * 4;
    if (data[i + 3] <= INK_ALPHA) return false;
    if (!background) return true;
    return distance([data[i], data[i + 1], data[i + 2]], background) > BACKGROUND_DISTANCE;
  };

  let minX = width, minY = height, maxX = -1, maxY = -1;
  const columns = new Uint8Array(width);
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      if (!ink(x, y)) continue;
      columns[x] = 1;
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  }
  if (maxX < 0) return { kind: "square" };

  const contentWidth = maxX - minX + 1;
  const contentHeight = maxY - minY + 1;
  if (contentWidth / contentHeight < WIDE) return { kind: "square" };
  // A wide mark printed on a square plate is already a square logo — the plate
  // is the frame, and it reads at small sizes. Only a wide canvas is a wordmark.
  if (background && width / height < 1.5) return { kind: "square" };

  // Most wordmarks lead with their icon; some close with it. Try both ends.
  for (const side of ["left", "right"]) {
    const found = findIcon(side, { columns, minX, maxX, minY, maxY, contentWidth, contentHeight, ink });
    if (!found) continue;
    const pad = Math.round(Math.max(found.width, found.height) * 0.06);
    const left = Math.max(0, found.from - pad);
    const upper = Math.max(0, found.top - pad);
    const right = Math.min(width - 1, found.to + pad);
    const lower = Math.min(height - 1, found.bottom + pad);
    const png = await sharp(data, { raw: { width, height, channels: 4 } })
      .extract({ left, top: upper, width: right - left + 1, height: lower - upper + 1 })
      .png()
      .toBuffer();
    // Drop an opaque background so the icon sits on Navio's surface like the rest.
    const buffer = background ? await knockOut(png, background) : png;
    return { kind: "icon", buffer };
  }

  return { kind: "wordmark", tint: tintOf(data, width, height, ink) };
}

/**
 * The run of ink at one end of the mark, up to a gap wider than the space
 * between letters, if it is shaped like an icon: roughly square, nearly the
 * full height of the mark, and not most of its width.
 */
function findIcon(side, { columns, minX, maxX, minY, maxY, contentWidth, contentHeight, ink }) {
  const gap = Math.max(3, Math.round(contentHeight * 0.2));
  const step = side === "left" ? 1 : -1;
  const start = side === "left" ? minX : maxX;
  const limit = side === "left" ? maxX : minX;
  let edge = start;

  for (let x = start; side === "left" ? x <= limit : x >= limit; x += step) {
    if (columns[x]) {
      edge = x;
      continue;
    }
    let empty = 0;
    while ((side === "left" ? x + empty * step <= limit : x + empty * step >= limit) && !columns[x + empty * step]) {
      empty += 1;
    }
    if (empty >= gap) break;
    x += (empty - 1) * step;
  }

  const from = Math.min(start, edge);
  const to = Math.max(start, edge);
  const iconWidth = to - from + 1;
  let top = Infinity;
  let bottom = -1;
  for (let y = minY; y <= maxY; y += 1) {
    for (let x = from; x <= to; x += 1) {
      if (ink(x, y)) {
        if (y < top) top = y;
        if (y > bottom) bottom = y;
        break;
      }
    }
  }
  const iconHeight = bottom - top + 1;

  const iconShaped =
    iconWidth < contentWidth * 0.45 &&
    iconHeight >= contentHeight * 0.7 &&
    iconWidth >= contentHeight * 0.55 &&
    iconWidth / iconHeight >= 0.6 &&
    iconWidth / iconHeight <= 1.7 &&
    iconHeight >= 24;

  return iconShaped ? { from, to, top, bottom, width: iconWidth, height: iconHeight } : null;
}

async function knockOut(png, background) {
  const { data, info } = await sharp(png).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  for (let i = 0; i < data.length; i += 4) {
    if (distance([data[i], data[i + 1], data[i + 2]], background) <= BACKGROUND_DISTANCE) data[i + 3] = 0;
  }
  return sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } }).png().toBuffer();
}

/** The brand's strongest colour: the most-used saturated hue among its ink. */
function tintOf(data, width, height, ink) {
  const buckets = new Map();
  for (let y = 0; y < height; y += 2) {
    for (let x = 0; x < width; x += 2) {
      if (!ink(x, y)) continue;
      const i = (y * width + x) * 4;
      const [r, g, b] = [data[i], data[i + 1], data[i + 2]];
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      const saturation = max === 0 ? 0 : (max - min) / max;
      if (saturation < 0.35 || max < 70) continue;
      const key = `${r >> 5},${g >> 5},${b >> 5}`;
      const bucket = buckets.get(key) ?? { count: 0, r: 0, g: 0, b: 0 };
      bucket.count += 1;
      bucket.r += r;
      bucket.g += g;
      bucket.b += b;
      buckets.set(key, bucket);
    }
  }
  let best = null;
  for (const bucket of buckets.values()) if (!best || bucket.count > best.count) best = bucket;
  if (!best || best.count < 12) return null;
  const hex = (value) => Math.round(value / best.count).toString(16).padStart(2, "0");
  return `#${hex(best.r)}${hex(best.g)}${hex(best.b)}`;
}

function average(pixels) {
  return [0, 1, 2].map((channel) => pixels.reduce((sum, pixel) => sum + pixel[channel], 0) / pixels.length);
}

function distance(a, b) {
  return Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
}
