import Image from "next/image";
import { headers } from "next/headers";
import { cloudModels, DOWNLOADS, PLANS } from "@/lib/kronos/catalog";

export const metadata = { title: { absolute: "Kronos Agent — local, private, yours" } };

const NUMERALS = ["I", "II", "III", "IV", "V"];
const PLAN_ART: Record<string, { src: string; alt: string }> = {
  lite: { src: "art-01-ascent", alt: "Astronaut at the top of a stone staircase before a radiant moon" },
  pro: { src: "art-03-knight", alt: "Armoured knight in profile with a closed visor" },
  max: { src: "art-02-messenger", alt: "Winged figure diving into a spiralling checkerboard" },
  max5: { src: "art-05-seer", alt: "Bearded seer behind a broken mask, a beam of light from his eye" },
};

const PILLARS = [
  {
    title: "Local",
    art: { src: "art-03-knight", alt: "Armoured knight in profile with a closed visor" },
    lead: "It lives on your machine.",
    points: [
      "Runs in your terminal, the desktop app or on your own server.",
      "Sessions, memory and skills are plain files in ~/.kronos — yours to read, back up or delete.",
      "Works with local models through Ollama or LM Studio, even offline.",
    ],
  },
  {
    title: "Private",
    art: { src: "art-04-eye", alt: "Engraved eye with a spiral galaxy for an iris" },
    lead: "Nothing leaves unless you send it.",
    points: [
      "No telemetry — it is off by default.",
      "Your API keys stay in ~/.kronos/.env; requests go straight from your machine to the provider you chose.",
      "An OS sandbox and command approvals keep the agent inside the folders you allow.",
    ],
  },
  {
    title: "Quality",
    art: { src: "art-05-seer", alt: "Bearded seer behind a broken mask, a beam of light from his eye" },
    lead: "Done means checked.",
    points: [
      "Runs your tests, linter and type checks before it says it is finished.",
      "Reviews its own changes and fixes what the review finds.",
      "Notices when a test was weakened instead of the code fixed, and says so.",
    ],
  },
];

type Brand = { name: string; logo?: string };
const PROVIDERS: Brand[] = [
  { name: "OpenAI", logo: "openai" },
  { name: "Anthropic", logo: "anthropic" },
  { name: "Google Gemini", logo: "gemini" },
  { name: "OpenRouter", logo: "openrouter" },
  { name: "Groq", logo: "groq" },
  { name: "DeepSeek", logo: "deepseek" },
  { name: "Mistral", logo: "mistral" },
  { name: "xAI", logo: "xai" },
  { name: "Together", logo: "together" },
  { name: "Fireworks", logo: "fireworks" },
  { name: "Ollama", logo: "ollama" },
  { name: "LM Studio", logo: "lmstudio" },
  { name: "Any OpenAI-compatible endpoint" },
];

/** What Kronos Cloud and the site run on, row by row. */
const INFRA: { row: string; note: string; items: Brand[] }[] = [
  {
    row: "Inference",
    note: "Each Kronos Cloud model is pinned to one provider through OpenRouter, with no fallback to another.",
    items: [{ name: "OpenRouter", logo: "openrouter" }, { name: "Open Inference" }, { name: "Nebius Token Factory" }, { name: "Crusoe" }, { name: "Wafer" }],
  },
  {
    row: "Models",
    note: "Open-weight models from the labs that made them.",
    items: [{ name: "Z.ai", logo: "zai" }, { name: "MiniMax", logo: "minimax" }, { name: "NVIDIA", logo: "nvidia" }, { name: "DeepSeek", logo: "deepseek" }],
  },
  {
    row: "Accounts & platform",
    note: "Sign-in, the membership ledger and the site. Your code and files never pass through them.",
    items: [{ name: "Clerk", logo: "clerk" }, { name: "Supabase", logo: "supabase" }, { name: "Vercel", logo: "vercel" }],
  },
];

function BrandMark({ b }: { b: Brand }) {
  return (
    <>
      {b.logo ? <span className="kx-logo" style={{ maskImage: `url(/kronos/logos/${b.logo}.svg)`, WebkitMaskImage: `url(/kronos/logos/${b.logo}.svg)` }} aria-hidden="true" /> : null}
      <span>{b.name}</span>
    </>
  );
}
const INSTALL = "curl -fsSL https://kronos-agent.vercel.app/install.sh | bash";

function OsIcon({ os }: { os: "windows" | "mac" }) {
  if (os === "windows")
    return (
      <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" fill="currentColor">
        <path d="M3 5.1 10.4 4v7.2H3V5.1Zm0 13.8 7.4 1.1v-7.1H3v6Zm8.3 1.2L21 21.5v-8.6h-9.7v7.2Zm0-16.2v7.3H21V2.5l-9.7 1.4Z" />
      </svg>
    );
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" fill="currentColor">
      <path d="M16.4 12.6c0-2.6 2.1-3.8 2.2-3.9-1.2-1.8-3.1-2-3.7-2-1.6-.2-3.1.9-3.9.9-.8 0-2-.9-3.4-.9-1.7 0-3.3 1-4.2 2.6-1.8 3.1-.5 7.7 1.3 10.2.9 1.2 1.9 2.6 3.2 2.6 1.3-.1 1.8-.8 3.3-.8 1.6 0 2 .8 3.4.8 1.4 0 2.3-1.3 3.1-2.5 1-1.4 1.4-2.8 1.4-2.9-.1 0-2.7-1-2.7-4.1ZM13.9 4.9c.7-.9 1.2-2.1 1.1-3.3-1 0-2.3.7-3 1.6-.7.8-1.2 2-1.1 3.2 1.1.1 2.3-.6 3-1.5Z" />
    </svg>
  );
}

export default async function KronosPage() {
  const ua = (await headers()).get("user-agent") ?? "";
  // the visitor's own system comes first
  const order: ("windows" | "mac")[] = /Mac|iPhone|iPad/i.test(ua) && !/Windows/i.test(ua) ? ["mac", "windows"] : ["windows", "mac"];
  const models = cloudModels();
  const ticker = ["Runs on your machine", "Your own API keys", "No telemetry", "OS sandbox", "Verifies its work", "Open source"];
  return (
    <>
      <section className="kx-hero" id="download">
        <div className="kx-hero-glow" aria-hidden="true" />
        <p className="kx-kicker">Kronos Agent · Open source · No telemetry</p>
        <h1 className="kx-hero-title">
          Local. Private.
          <br />
          <span className="blue">Yours.</span>
        </h1>
        <p className="kx-hero-lede">
          Kronos is an AI agent that works on your own computer: it reads your code, runs the commands you allow and checks its work before it says it is done.
          Nothing leaves your disk unless you send it.
        </p>
        <div className="kx-downloads">
          {order.map((os) => (
            <a key={os} href={DOWNLOADS[os].file} className={`kx-pill-btn ${os === order[0] ? "solid" : "ghost"}`}>
              <OsIcon os={os} />
              Download for {DOWNLOADS[os].label}
            </a>
          ))}
        </div>
        <ul className="kx-checks">
          <li>Runs on your machine</li>
          <li>Your own API keys</li>
          <li>Checks its own work</li>
        </ul>
        <p className="kx-hero-alt">
          Linux or a server? <code>{INSTALL}</code>
        </p>
      </section>

      <div className="kx-ticker" aria-hidden="true">
        <div className="kx-ticker-track">
          {[...ticker, ...ticker].map((t, i) => (
            <span key={i}>{t}</span>
          ))}
        </div>
      </div>

      <section className="kx-section" id="why">
        <div className="kx-section-head">
          <div>
            <p className="kx-label">Three Promises</p>
            <h2 className="kx-display" style={{ marginTop: 16 }}>
              Built To Be
              <br />
              Trusted
            </h2>
          </div>
          <p className="kx-lede">An agent reads your code and runs commands. It should do that on your terms, on your machine, and do it well.</p>
        </div>
        <div className="kx-plans" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))" }}>
          {PILLARS.map((p, i) => (
            <article key={p.title} className="kx-plan">
              <div className="kx-plan-art">
                <Image src={`/kronos/img/${p.art.src}-480.webp`} alt={p.art.alt} fill sizes="(max-width: 860px) 100vw, 33vw" />
              </div>
              <div className="kx-plan-body">
                <div className="row">
                  <h3>{p.title}</h3>
                  <span className="num">{NUMERALS[i]}</span>
                </div>
                <p>{p.lead}</p>
                <ul className="kx-points">
                  {p.points.map((pt) => (
                    <li key={pt}>{pt}</li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="kx-section" id="keys">
        <div className="kx-section-head">
          <div>
            <p className="kx-label">Bring Your Own Keys</p>
            <h2 className="kx-display" style={{ marginTop: 16 }}>
              Your Keys.
              <br />
              No Middleman.
            </h2>
          </div>
          <p className="kx-lede">
            Paste a key in Settings → Providers &amp; API keys, or run <code>kronos setup</code>. Kronos checks it live, keeps it on your machine, and talks to the
            provider directly. Free, and no account needed.
          </p>
        </div>
        <ul className="kx-providers">
          {PROVIDERS.map((p) => (
            <li key={p.name}>
              <BrandMark b={p} />
            </li>
          ))}
        </ul>
      </section>

      <section className="kx-section" id="start">
        <div className="kx-section-head">
          <div>
            <p className="kx-label">Three Steps</p>
            <h2 className="kx-display" style={{ marginTop: 16 }}>
              From Install
              <br />
              To Answer
            </h2>
          </div>
        </div>
        <div className="kx-steps">
          <div className="kx-step">
            <span className="num">I</span>
            <h3>Download Kronos</h3>
            <p>
              The app for <a href={DOWNLOADS.windows.file}>Windows</a> or <a href={DOWNLOADS.mac.file}>macOS</a>. On Linux, one line in a terminal.
            </p>
          </div>
          <div className="kx-step">
            <span className="num">II</span>
            <h3>Connect a model</h3>
            <p>
              Paste your own API key or pick a local model. Sign in from the app only if you want Kronos Cloud.
            </p>
          </div>
          <div className="kx-step">
            <span className="num">III</span>
            <h3>Start working</h3>
            <p>
              Open a folder and ask. In a terminal, <code>kronos</code> does the same.
            </p>
          </div>
        </div>
        <div className="kx-cmd">
          <span className="p">$</span>
          <code>{INSTALL}</code>
        </div>
      </section>

      <section className="kx-section" id="models">
        <div className="kx-section-head">
          <div>
            <p className="kx-label">Optional · Kronos Cloud</p>
            <h2 className="kx-display" style={{ marginTop: 16 }}>
              No Keys?
              <br />
              Use Ours.
            </h2>
          </div>
          <p className="kx-lede">For people who would rather not manage API keys: four open models, each pinned to one inference provider, with a membership.</p>
        </div>
        <div className="kx-models">
          <div className="kx-models-art">
            <Image src="/kronos/img/art-02-messenger.webp" alt="Winged figure diving into a spiralling checkerboard" fill sizes="(max-width: 900px) 100vw, 34vw" />
          </div>
          <ol className="kx-ledger">
            {models.map((m, i) => (
              <li key={m.id}>
                <span className="num">{NUMERALS[i]}</span>
                <span className="name">
                  {m.name}
                  {m.vision ? <span className="kx-chip">Vision</span> : null}
                </span>
                <span className="by">{m.providerName}</span>
                <span className="what">
                  {m.blurb} <span className="ref">cloud:{m.id}</span>
                </span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="kx-section" id="infrastructure">
        <div className="kx-section-head">
          <div>
            <p className="kx-label">Our Infrastructure</p>
            <h2 className="kx-display" style={{ marginTop: 16 }}>
              What Kronos
              <br />
              Runs On
            </h2>
          </div>
          <p className="kx-lede">The services behind Kronos Cloud and your account. With your own keys, Kronos talks to your provider directly and none of these are involved.</p>
        </div>
        <div className="kx-infra">
          {INFRA.map((r) => (
            <div key={r.row} className="kx-infra-row">
              <div className="kx-infra-head">
                <h3>{r.row}</h3>
                <p>{r.note}</p>
              </div>
              <ul className="kx-infra-logos">
                {r.items.map((b) => (
                  <li key={b.name}>
                    <BrandMark b={b} />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="kx-section" id="plans">
        <div className="kx-section-head">
          <div>
            <p className="kx-label">Memberships</p>
            <h2 className="kx-display" style={{ marginTop: 16 }}>
              Choose Your
              <br />
              Allowance
            </h2>
          </div>
          <p className="kx-lede">Every plan opens all four Kronos Cloud models. Usage resets every 5 hours and every week. Your own keys stay free either way.</p>
        </div>
        <div className="kx-plans">
          {PLANS.map((p, i) => {
            const art = PLAN_ART[p.id]!;
            return (
              <article key={p.id} className={`kx-plan ${p.id === "max" ? "featured" : ""}`}>
                <div className="kx-plan-art">
                  <Image src={`/kronos/img/${art.src}-480.webp`} alt={art.alt} fill sizes="(max-width: 560px) 100vw, (max-width: 1000px) 50vw, 25vw" />
                </div>
                <div className="kx-plan-body">
                  <div className="row">
                    <h3>{p.name}</h3>
                    <span className="num">{NUMERALS[i]}</span>
                  </div>
                  <span className="mult">{p.multiplier === 1 ? "Standard usage" : p.multiplier < 1 ? "Half of Pro" : `${p.multiplier}× Pro usage`}</span>
                  <p>{p.blurb}</p>
                  <div className="kx-meter" aria-hidden="true">
                    <div className="kx-meter-bar">
                      <i style={{ width: `${Math.max(Math.round((p.multiplier / 5) * 100), 6)}%` }} />
                    </div>
                    <span>Allowance</span>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
        <p className="kx-note">
          Memberships and promo codes live in the app: Settings → Membership, or <code>kronos redeem CODE</code> in a terminal.
        </p>
      </section>
    </>
  );
}
