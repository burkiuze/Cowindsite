import Image from "next/image";
import Link from "next/link";
import { cloudModels, PLANS, SITE_PATH } from "@/lib/kronos/catalog";

export const metadata = { title: { absolute: "Kronos Agent — your agent, any model" } };

const FEATURES = [
  { title: "Works where you work", body: "Terminal, desktop app, browser and your chat apps — one agent, one memory, one set of skills." },
  { title: "Codes and checks its work", body: "Plans, edits, runs your tests, reviews its own changes and reports what it verified." },
  { title: "Safe by default", body: "An OS sandbox, command approvals and injection defenses keep it inside the lines you draw." },
  { title: "Your keys or ours", body: "Connect your own OpenAI, Anthropic, Gemini, OpenRouter or local models — or use Kronos Cloud." },
];

const INSTALL = "curl -fsSL https://raw.githubusercontent.com/burkiuze/KronosAgent/main/scripts/install.sh | bash";

export default function KronosHome() {
  const models = cloudModels();
  return (
    <div>
      <section className="mx-auto w-full max-w-6xl px-6 pt-20 pb-16 text-center">
        <Image src="/kronos/kronos-512.png" alt="Kronos" width={88} height={88} className="mx-auto rounded-2xl" priority />
        <h1 className="mx-auto mt-8 max-w-3xl text-[40px] leading-[1.08] font-semibold tracking-tight sm:text-[54px]">One agent for your terminal, desktop and every chat app</h1>
        <p className="mx-auto mt-5 max-w-2xl text-[16px] leading-relaxed text-[var(--color-ink-muted)]">
          Kronos codes, researches, automates and remembers — on your machine. Bring your own API keys for free, or sign in and use Kronos Cloud models with a membership.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3 text-[14px]">
          <Link href={`${SITE_PATH}/sign-up`} className="rounded-lg bg-[var(--color-porcelain)] px-5 py-2.5 font-medium text-[var(--color-on-light)] hover:opacity-90">
            Create a free account
          </Link>
          <a href="#install" className="rounded-lg border border-[var(--color-hairline)] px-5 py-2.5 hover:bg-[var(--color-raised)]">
            Install Kronos
          </a>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-6xl gap-4 px-6 pb-20 sm:grid-cols-2 lg:grid-cols-4">
        {FEATURES.map((f) => (
          <div key={f.title} className="panel px-5 py-5">
            <h2 className="text-[15px] font-semibold">{f.title}</h2>
            <p className="mt-2 text-[13.5px] leading-relaxed text-[var(--color-ink-muted)]">{f.body}</p>
          </div>
        ))}
      </section>

      <section id="models" className="mx-auto w-full max-w-6xl scroll-mt-20 px-6 pb-20">
        <h2 className="text-[28px] font-semibold tracking-tight">Kronos Cloud models</h2>
        <p className="mt-2 max-w-2xl text-[14.5px] text-[var(--color-ink-muted)]">
          Fast, capable open models served by dedicated inference providers. Available in Kronos with any membership — no API keys to manage.
        </p>
        <div className="mt-6 overflow-hidden rounded-[var(--radius-panel)] border border-[var(--color-hairline)]">
          <table className="w-full text-left text-[13.5px]">
            <thead className="bg-[var(--color-panel)] text-[12px] tracking-wide text-[var(--color-ink-faint)] uppercase">
              <tr>
                <th className="px-5 py-3 font-medium">Model</th>
                <th className="px-5 py-3 font-medium">Provider</th>
                <th className="hidden px-5 py-3 font-medium sm:table-cell">Good at</th>
              </tr>
            </thead>
            <tbody>
              {models.map((m) => (
                <tr key={m.id} className="border-t border-[var(--color-hairline)]">
                  <td className="px-5 py-3.5 font-medium">
                    {m.name}
                    {m.vision ? <span className="ml-2 rounded border border-[var(--color-hairline)] px-1.5 py-0.5 text-[11px] text-[var(--color-ink-muted)]">vision</span> : null}
                  </td>
                  <td className="px-5 py-3.5 text-[var(--color-ink-muted)]">{m.providerName}</td>
                  <td className="hidden px-5 py-3.5 text-[var(--color-ink-muted)] sm:table-cell">{m.blurb}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section id="plans" className="mx-auto w-full max-w-6xl scroll-mt-20 px-6 pb-20">
        <h2 className="text-[28px] font-semibold tracking-tight">Memberships</h2>
        <p className="mt-2 max-w-2xl text-[14.5px] text-[var(--color-ink-muted)]">
          Every plan includes all Kronos Cloud models. Usage resets every 5 hours and every week. Using your own API keys is always free.
        </p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PLANS.map((p) => (
            <div key={p.id} className={`panel flex flex-col px-5 py-5 ${p.id === "max" ? "ring-1 ring-[var(--color-stream-cyan)]/50" : ""}`}>
              <h3 className="text-[18px] font-semibold">{p.name}</h3>
              <p className="mt-1 text-[13px] text-[var(--color-stream-cyan)]">{p.multiplier === 1 ? "Standard usage" : p.multiplier < 1 ? "Lighter usage" : `${p.multiplier}× Pro usage`}</p>
              <p className="mt-3 flex-1 text-[13.5px] leading-relaxed text-[var(--color-ink-muted)]">{p.blurb}</p>
            </div>
          ))}
        </div>
        <p className="mt-5 text-[13.5px] text-[var(--color-ink-muted)]">
          Have a promo code? Redeem it in Kronos under <span className="text-[var(--color-ink)]">Settings → Membership</span>, or on your{" "}
          <Link href={`${SITE_PATH}/account`} className="underline underline-offset-2">
            account page
          </Link>
          .
        </p>
      </section>

      <section id="install" className="mx-auto w-full max-w-6xl scroll-mt-20 px-6 pb-24">
        <h2 className="text-[28px] font-semibold tracking-tight">Install</h2>
        <p className="mt-2 text-[14.5px] text-[var(--color-ink-muted)]">macOS, Linux or WSL with Node.js 20.19+ and git:</p>
        <pre className="mt-4 overflow-x-auto rounded-xl border border-[var(--color-hairline)] bg-[var(--color-panel)] px-4 py-3.5 font-mono text-[13px]">{INSTALL}</pre>
        <p className="mt-4 text-[14px] text-[var(--color-ink-muted)]">
          Then run <code className="font-mono text-[var(--color-ink)]">kronos web</code>. On first start Kronos asks you to sign in, create an account, or continue without one.
        </p>
      </section>
    </div>
  );
}
