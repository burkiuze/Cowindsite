import Image from "next/image";
import Link from "next/link";
import { cloudModels, PLANS, SITE_PATH } from "@/lib/kronos/catalog";

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

const PROVIDERS = ["OpenAI", "Anthropic", "Google Gemini", "OpenRouter", "Groq", "DeepSeek", "Mistral", "xAI", "Together", "Fireworks", "Ollama", "LM Studio", "Any OpenAI-compatible endpoint"];
const INSTALL = "curl -fsSL https://kronos-agent.vercel.app/install.sh | bash";

/** A clock face for Kronos: sixty ticks, twelve numerals and a slow second hand, drawn behind the hero. */
function Dial() {
  const ticks = Array.from({ length: 60 }, (_, i) => {
    const a = (i * Math.PI) / 30;
    const major = i % 5 === 0;
    const r1 = major ? 430 : 446;
    return (
      <line
        key={i}
        x1={500 + r1 * Math.sin(a)}
        y1={500 - r1 * Math.cos(a)}
        x2={500 + 460 * Math.sin(a)}
        y2={500 - 460 * Math.cos(a)}
        strokeWidth={major ? 2 : 1}
      />
    );
  });
  const numerals = ["XII", "I", "II", "III", "IIII", "V", "VI", "VII", "VIII", "IX", "X", "XI"].map((n, i) => {
    const a = (i * Math.PI) / 6;
    return (
      <text key={n} x={500 + 392 * Math.sin(a)} y={500 - 392 * Math.cos(a)} textAnchor="middle" dominantBaseline="central">
        {n}
      </text>
    );
  });
  return (
    <svg className="kx-dial" viewBox="0 0 1000 1000">
      <g className="face">
        <circle cx="500" cy="500" r="470" />
        <circle cx="500" cy="500" r="340" strokeDasharray="2 10" />
        <circle cx="500" cy="500" r="200" />
        <g className="ticks">{ticks}</g>
        <g className="numerals">{numerals}</g>
      </g>
      <line className="hand" x1="500" y1="560" x2="500" y2="70" />
      <circle className="hub" cx="500" cy="500" r="5" />
    </svg>
  );
}

export default function KronosPage() {
  const models = cloudModels();
  const ticker = ["Runs on your machine", "Your own API keys", "No telemetry", "OS sandbox", "Verifies its work", "Open source"];
  return (
    <>
      <section className="kx-hero">
        <div className="kx-hero-bg" aria-hidden="true">
          <Dial />
        </div>
        <div className="kx-hero-body">
          <p className="kx-pill">
            <span className="dot" />
            Open source <span className="sep">·</span> No telemetry<span className="opt"> <span className="sep">·</span> Works offline</span>
          </p>
          <p className="kx-label" style={{ marginTop: 26 }}>
            Kronos Agent <span className="dim">/ Local-first</span>
          </p>
          <h1 className="kx-hero-title">
            Local.
            <br />
            Private.
            <br />
            <span className="blue">Yours.</span>
          </h1>
          <p className="kx-lede">
            An AI agent that works on your own computer, with your own keys. <em>Your code, files and memory stay on your disk</em> — and it checks its work
            before it tells you it is done.
          </p>
          <div className="kx-hero-cta">
            <a href="#start" className="kx-btn blue">
              Install Kronos
            </a>
            <a href="#keys" className="kx-btn ghost">
              Use your own keys
            </a>
          </div>
          <div className="kx-cmd kx-hero-cmd">
            <span className="p">$</span>
            <code>{INSTALL}</code>
          </div>
          <dl className="kx-stats">
            <div>
              <dt>Runs on</dt>
              <dd>Your machine</dd>
            </div>
            <div>
              <dt>Your data</dt>
              <dd>Stays local</dd>
            </div>
            <div>
              <dt>Account</dt>
              <dd>Optional</dd>
            </div>
          </dl>
        </div>
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
            <li key={p}>{p}</li>
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
            <h3>Install Kronos</h3>
            <p>One line in a terminal on macOS, Linux and WSL, or the desktop app.</p>
          </div>
          <div className="kx-step">
            <span className="num">II</span>
            <h3>Connect a model</h3>
            <p>
              Your own API key or a local model — <code>kronos setup</code>. On first start, choose “Continue without an account”.
            </p>
          </div>
          <div className="kx-step">
            <span className="num">III</span>
            <h3>Start working</h3>
            <p>
              <code>kronos</code> in a terminal, or <code>kronos web</code> for the desktop interface.
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
          Have a promo code? Redeem it in Kronos under Settings → Membership, with <code>kronos redeem CODE</code>, or on your{" "}
          <Link href={`${SITE_PATH}/account`}>account page</Link>.
        </p>
      </section>
    </>
  );
}
