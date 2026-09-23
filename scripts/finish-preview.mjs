/**
 * Finishing pass for the product preview.
 *
 * Takes the raw recording and produces what the site ships: an H.264 file, a
 * VP9 fallback and a poster frame — with two short zoom pushes on the moments
 * the recorder marked, so the eye is taken to the thing that matters instead of
 * hunting for it in a full-width screen capture.
 *
 * Usage: node scripts/finish-preview.mjs [scenario] [ffmpeg-path]
 */
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const SCENARIO = process.argv[2] ?? "meeting";
const RAW_DIR = `/tmp/preview-raw/${SCENARIO}`;
const SOURCE = join(RAW_DIR, "preview.webm");
const OUT_DIR = "public/video";
const NAME = SCENARIO === "meeting" ? "preview" : `preview-${SCENARIO}`;
// The page never shows these wider than ~900 CSS pixels, so 1120 is already
// past a 2x panel and every byte beyond that is spent on nothing a visitor can
// see. Four of them autoplay on one page: size is a feature.
const WIDTH = 1120;
const HEIGHT = 700;
const FPS = 24;

const ffmpeg = process.argv[3] ?? "ffmpeg";
if (!existsSync(SOURCE)) throw new Error(`no recording at ${SOURCE} — run scripts/record-preview.mjs first`);

const marks = existsSync(join(RAW_DIR, "marks.json"))
  ? JSON.parse(readFileSync(join(RAW_DIR, "marks.json"), "utf8"))
  : [];

/**
 * Short pushes, each held briefly: the integrations Navio just read, the month's
 * figures when the run produced them, and the receipt that proves the approved
 * action actually ran. A run without a report simply has one push fewer.
 */
/**
 * What each marked moment is worth zooming on. A take only has the marks its
 * own run produced, so the list is filtered rather than assumed: a tour with no
 * receipt simply has no receipt push, and a run with no report has no report
 * push. Order follows the recording, which the focus expression relies on.
 */
const PUSH_SPECS = [
  { label: "actions", lead: 0.8, hold: 3.4, scale: 1.22, cx: 0.58, cy: 0.42 },
  { label: "mode", lead: 0.2, hold: 3.0, scale: 1.3, cx: 0.5, cy: 0.86 },
  { label: "rounds", lead: 1.5, hold: 4.2, scale: 1.18, cx: 0.6, cy: 0.5 },
  { label: "position", lead: 0.6, hold: 3.6, scale: 1.18, cx: 0.55, cy: 0.3 },
  { label: "report", lead: 0.8, hold: 4.6, scale: 1.2, cx: 0.58, cy: 0.38 },
  { label: "charts", lead: 0.6, hold: 4.0, scale: 1.2, cx: 0.55, cy: 0.5 },
  { label: "receivables", lead: 0.6, hold: 3.6, scale: 1.18, cx: 0.55, cy: 0.5 },
  { label: "sources", lead: 0.6, hold: 3.6, scale: 1.2, cx: 0.62, cy: 0.55 },
  { label: "passed", lead: 0.4, hold: 3.8, scale: 1.2, cx: 0.6, cy: 0.4 },
  { label: "receipt", lead: -0.3, hold: 3.3, scale: 1.26, cx: 0.58, cy: 0.72 },
];

const PUSHES = PUSH_SPECS.flatMap((spec) => {
  const found = marks.find((mark) => mark.label === spec.label)?.at;
  if (found === undefined) return [];
  return [{ start: found + spec.lead, end: found + spec.lead + spec.hold, scale: spec.scale, cx: spec.cx, cy: spec.cy }];
});

/** Ramp in over `ramp` seconds, hold, ramp out — expressed for zoompan. */
function zoomExpression(ramp = 0.45) {
  const windows = PUSHES.map(({ start, end, scale }) => {
    const rise = `min(1,max(0,(in_time-${start.toFixed(2)})/${ramp}))`;
    const fall = `min(1,max(0,(${end.toFixed(2)}-in_time)/${ramp}))`;
    return `(${(scale - 1).toFixed(3)}*min(${rise},${fall}))`;
  });
  return `1+${windows.join("+")}`;
}

/** Follow the focal point of whichever push is active. */
function focusExpression(axis) {
  const key = axis === "x" ? "cx" : "cy";
  const active = PUSHES.map(({ start, end, [key]: value }) => `if(between(in_time,${start.toFixed(2)},${end.toFixed(2)}),${value},`).join("");
  return `${active}0.5${")".repeat(PUSHES.length)}`;
}

const zoom = zoomExpression();
const focusX = focusExpression("x");
const focusY = focusExpression("y");

// zoompan crops in input coordinates, so convert the focal fraction into a
// top-left corner and keep it inside the frame.
const filter = [
  `fps=${FPS}`,
  `scale=${WIDTH}:-2`,
  `zoompan=z='${zoom}':x='max(0,min(iw-iw/zoom,(${focusX})*iw-(iw/zoom)/2))':y='max(0,min(ih-ih/zoom,(${focusY})*ih-(ih/zoom)/2))':d=1:s=${WIDTH}x${HEIGHT}:fps=${FPS}`,
].join(",");

function run(args) {
  execFileSync(ffmpeg, ["-hide_banner", "-loglevel", "error", "-y", ...args], { stdio: "inherit" });
}

console.log("pushes:", PUSHES.map((push) => `${push.start.toFixed(1)}s→${push.end.toFixed(1)}s ×${push.scale}`).join(", "));

run(["-i", SOURCE, "-vf", filter, "-c:v", "libx264", "-preset", "slow", "-crf", "32",
  "-profile:v", "high", "-pix_fmt", "yuv420p", "-movflags", "+faststart", "-an", join(OUT_DIR, `${NAME}.mp4`)]);

run(["-i", SOURCE, "-vf", filter, "-c:v", "libvpx-vp9", "-b:v", "0", "-crf", "42",
  "-row-mt", "1", "-an", join(OUT_DIR, `${NAME}.webm`)]);

// The poster is the still a visitor sees before pressing play, so prefer the
// frame that says most about the run: the report, when there is one.
const posterAt = marks.find((mark) => ["report", "position", "passed", "actions"].includes(mark.label))?.at;
run(["-ss", String((posterAt ?? 20) + 2.5), "-i", SOURCE, "-vframes", "1",
  "-vf", `scale=${WIDTH}:-2`, "-c:v", "libwebp", "-quality", "82", join(OUT_DIR, `${NAME}-poster.webp`)]);

console.log("wrote", NAME, "→", OUT_DIR);
