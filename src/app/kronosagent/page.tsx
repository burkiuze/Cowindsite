import Image from "next/image";
import Link from "next/link";
import { cloudModels, PLANS, SITE_PATH } from "@/lib/kronos/catalog";

export const metadata = { title: { absolute: "Kronos Cloud — models for Kronos Agent, no keys" } };

const NUMERALS = ["I", "II", "III", "IV", "V"];
const PLAN_ART: Record<string, { src: string; alt: string }> = {
  lite: { src: "art-01-ascent", alt: "Astronaut at the top of a stone staircase before a radiant moon" },
  pro: { src: "art-03-knight", alt: "Armoured knight in profile with a closed visor" },
  max: { src: "art-02-messenger", alt: "Winged figure diving into a spiralling checkerboard" },
  max5: { src: "art-05-seer", alt: "Bearded seer behind a broken mask, a beam of light from his eye" },
};
const INSTALL = "curl -fsSL https://kronos-agent.vercel.app/install.sh | bash";

export default function KronosCloudPage() {
  const models = cloudModels();
  const ticker = [...models.map((m) => m.name), "No API keys", "5-hour & weekly allowance", "Promo codes"];
  return (
    <>
      <section className="kx-hero">
        <div>
          <p className="kx-label">
            Kronos Cloud <span className="dim">/ 2026</span>
          </p>
          <h1 className="kx-hero-title">
            Cloud Models.
            <br />
            <span className="blue">No Keys.</span>
          </h1>
          <p className="kx-lede">
            Sign in once and Kronos runs on fast open models served by dedicated providers — <em>no API keys to buy, paste or rotate.</em> Your own keys
            keep working, always free.
          </p>
          <div className="kx-hero-cta">
            <Link href={`${SITE_PATH}/sign-up`} className="kx-btn blue">
              Create account
            </Link>
            <a href="#plans" className="kx-btn ghost">
              See plans
            </a>
          </div>
          <dl className="kx-stats">
            <div>
              <dt>Models</dt>
              <dd>{models.length}</dd>
            </div>
            <div>
              <dt>Plans</dt>
              <dd>{PLANS.length}</dd>
            </div>
            <div>
              <dt>Resets</dt>
              <dd>5h · Weekly</dd>
            </div>
          </dl>
        </div>
        <figure className="kx-hero-art" style={{ margin: 0 }}>
          <Image src="/kronos/img/hero-wide.webp" alt="Engraving of many-armed Kronos, Father Time, holding an hourglass while gathering rays of light" fill priority sizes="(max-width: 900px) 100vw, 48vw" />
          <figcaption>
            <code>kronos -m cloud:glm-5.3-flash</code>
            <span>Members</span>
          </figcaption>
        </figure>
      </section>

      <div className="kx-ticker" aria-hidden="true">
        <div className="kx-ticker-track">
          {[...ticker, ...ticker].map((t, i) => (
            <span key={i}>{t}</span>
          ))}
        </div>
      </div>

      <section className="kx-section" id="models">
        <div className="kx-section-head">
          <div>
            <p className="kx-label">The Four Models</p>
            <h2 className="kx-display" style={{ marginTop: 16 }}>
              Pinned To
              <br />
              Their Makers
            </h2>
          </div>
          <p className="kx-lede">Every request goes to the provider named here — never silently to another. Pick one in Kronos with the model picker or <code>kronos -m</code>.</p>
        </div>
        <div className="kx-models">
          <div className="kx-models-art">
            <Image src="/kronos/img/art-04-eye.webp" alt="Engraved eye with a spiral galaxy for an iris" fill sizes="(max-width: 900px) 100vw, 34vw" />
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
          <p className="kx-lede">Every plan opens all four models. Usage is counted per 5-hour session and per week, and both reset on their own.</p>
        </div>
        <div className="kx-plans">
          {PLANS.map((p, i) => {
            const art = PLAN_ART[p.id]!;
            const width = Math.round((p.multiplier / 5) * 100);
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
                      <i style={{ width: `${Math.max(width, 6)}%` }} />
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
            <p>The desktop app, or one line in a terminal on macOS, Linux and WSL.</p>
          </div>
          <div className="kx-step">
            <span className="num">II</span>
            <h3>Sign in</h3>
            <p>
              Kronos asks on first start — or run <code>kronos login</code>. Continue without an account if you only use your own keys.
            </p>
          </div>
          <div className="kx-step">
            <span className="num">III</span>
            <h3>Pick a model</h3>
            <p>
              With a membership, the Kronos Cloud models unlock in the model picker. Choose one and start working.
            </p>
          </div>
        </div>
        <div className="kx-cmd">
          <span className="p">$</span>
          <code>{INSTALL}</code>
        </div>
      </section>
    </>
  );
}
