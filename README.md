<div align="center">

<img src="public/brand/wind-mark-128.png" width="72" alt="" />

# Cowind

**An AI work operating system.** Ask for an outcome — **Wind** plans the work,
runs it across specialists and connected tools, holds anything consequential for
a human decision, and reports exactly what it did.

</div>

---

## What this is

Cowind is not a chat wrapper. It is a workspace with a runtime underneath it:

```
USER → WIND → intent + task router → orchestrator → specialist workers
     → tools / knowledge / integrations → approval if required
     → action → Wind's final answer
```

The user sees **one** assistant. Wind decides internally what the request is,
how hard it is, which specialists are needed, whether workspace knowledge should
be searched, what can run in parallel, and whether a human has to say yes before
anything happens.

## The loop

| Beat | What happens |
| --- | --- |
| **Ask** | Someone describes an outcome in their own words, in any language. |
| **Plan** | Wind classifies intent and complexity, picks specialists, and builds an execution plan with dependencies. |
| **Act** | Independent lanes run in parallel; every lane has a fallback path; the whole run is bounded by an execution budget. |
| **Report** | One answer in one voice, plus a task record, an audit trail, and any approval Wind is holding. |

## Product rules that are enforced in code

- **One assistant.** Users see Wind, and product roles like Wind Code or Wind
  Finance. Engine identifiers, vendors, endpoints, HTTP semantics and raw error
  bodies are stripped from everything user-facing — including mid-stream, across
  chunk boundaries (`src/lib/wind/redaction.ts`, `StreamSanitizer`).
- **No fake work.** An integration without credentials reads *Not connected* and
  stays that way. Approving an action whose system is not connected records the
  decision and says plainly that nothing was sent.
- **Approval before consequence.** Anything that sends, publishes, changes or
  deletes outside Cowind is prepared in full, shown verbatim, editable by the
  approver, and executed only on a yes — with a receipt either way.
- **Authority cannot inflate.** An agent's permissions are intersected with the
  permissions of the person who started the run. Narrower is allowed; wider is not.
- **Scoped memory.** Knowledge belongs to departments and agent scopes. A finance
  source does not reach an engineering run because they share a workspace.
- **No private reasoning on screen.** The execution trace shows operational state
  ("Financial analysis — running"), never chain-of-thought.

## Getting started

```bash
npm install
cp .env.example .env.local     # fill in the two keys, server-side only
npm run dev                    # http://localhost:3000
```

Cowind runs fully without credentials — the workspace, tasks, approvals,
knowledge, integrations and audit trail are all live. Wind itself is disabled
until the two keys are present, and says so instead of failing obscurely.

| Script | Purpose |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` / `npm start` | Production build and serve |
| `npm test` | Unit + runtime suite (Vitest) |
| `npm run typecheck` | TypeScript, no emit |
| `npm run lint` | ESLint |

## Configuration

Two server-side keys, never exposed to the browser, never `NEXT_PUBLIC_`:

```bash
WIND_PRIMARY_API_KEY=       # fast conversational layer: chat, routing, planning, synthesis
WIND_SPECIALIST_API_KEY=    # specialist pool: code, finance, vision, reasoning, data
```

Everything else is optional and documented in [`.env.example`](.env.example):
endpoint overrides, per-role model overrides, and every guardrail
(specialist-call ceiling, orchestration depth, parallelism, timeouts, upload
size, rate limit).

**Engine identifiers live in exactly one file** — [`src/lib/wind/models.ts`](src/lib/wind/models.ts) —
and each one can also be overridden by an environment variable, so an upstream
rename needs no code change and no deploy.

## Architecture

```
src/
  app/
    (marketing)/            public landing page
    (workspace)/            the product: home, wind, tasks, flows, approvals,
                            agents, knowledge, integrations, team, analytics, settings
    api/                    streaming chat + workspace routes
  components/               brand mark, icon system, shell, chat, trace, timeline
  lib/
    wind/                   the runtime (server-only)
      models.ts             every engine, one place, env-overridable
      classifier.ts         deterministic intent + complexity (bilingual)
      router.ts             heuristics + optional assisted pass → execution plan
      orchestrator.ts       dependency-aware parallel execution
      executor.ts           one lane, end to end
      fallback.ts           ordered fallback chains, never a raw error
      runtime.ts            ASK → PLAN → ACT → REPORT, event stream
      redaction.ts          the outbound guard
      config.ts             guardrails + execution budget
      adapters/             private transport and endpoints
      specialists/          per-domain briefs
      tools/                tool registry with permission + approval metadata
    workspace/              entities, RBAC, store, scoped knowledge, integrations
```

Further reading: [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) ·
[`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) · [`docs/SECURITY.md`](docs/SECURITY.md)

## Storage

State lives behind one narrow interface in `src/lib/workspace/store.ts`, seeded
with a populated workspace so the product is usable on first run. It is
in-process: for a multi-instance deployment, implement the same interface
against your database — nothing above it needs to change.

## Tests

62 tests covering the parts where a mistake is expensive: routing decisions for
the documented cases (including Turkish), fallback chain integrity, guardrails,
permission intersection, knowledge scoping, and — most of all — that nothing
about the private engine layer can reach a user, whole or split across a stream.
