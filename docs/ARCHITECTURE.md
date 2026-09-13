# Cowind architecture

## The path of one request

```
browser
  └─ POST /api/wind/chat            validate · rate limit · permission check
       └─ Wind runtime              ASK → PLAN → ACT → REPORT
            ├─ router               intent · complexity · lane plan
            ├─ knowledge            permission-filtered retrieval
            ├─ orchestrator         parallel lanes, dependencies, budget
            │    └─ executor        one lane → fallback chain → engine
            ├─ synthesis            one answer, one voice
            └─ approval             prepared action, held for a human
       └─ SSE event stream          status · plan · lane · delta · approval · done
```

The browser never speaks to an engine. It speaks to Cowind; Cowind speaks to
Wind; Wind speaks to the private adapters.

## The gather phase

Before planning, Wind looks at what it is allowed to look at. The fast engine
picks read-effect tools from the ones that are both connected and wired to an
endpoint; they run in parallel, and what comes back becomes context for every
later pass, alongside workspace knowledge.

Three rules make this safe to leave on:

- **Reads only.** A write tool is never callable here. Writes go through an
  approval, always.
- **Reachable only.** A tool on an integration without an endpoint is not
  offered to the engine, so it cannot be chosen and then faked.
- **Bounded.** At most six lookups per request, and a deterministic fallback by
  intent so a classification hiccup does not leave Wind blind.

Each call becomes a visible action in the chat, grouped by service. A failed
call says failed; a service Wind never reached has no card at all.

## Routing

Two stages, in this order:

1. **Deterministic** (`classifier.ts`). Attachments first — an image routes to
   the visual specialist regardless of wording. Then bilingual domain
   vocabulary, message shape (code fences, structured payloads, page counts),
   and cross-domain detection. Generic analysis verbs ("analiz et", "evaluate")
   raise *complexity* but never outvote a *domain*: "bilançoyu analiz et" is
   finance work, not generic reasoning.
2. **Assisted** (`router.ts`). Only when stage one is below the confidence
   threshold and the message is long enough to be worth a call. A single
   low-token classification on the fast engine, with the deterministic result as
   the fallback if it fails.

The output is a plan of lanes. An empty plan is a valid, common answer: "Selam"
must not cost a specialist call.

## Parallelism

The orchestrator resolves the lane dependency graph and starts every lane whose
dependencies are satisfied, up to `maxParallelLanes`. Lane events are pushed
through an async channel (`channel.ts`) so the browser sees streams open, run
and land *while* they run, rather than after the fact. A cycle or an
unsatisfiable dependency ends as skipped lanes, never a hang.

## Failure

Each lane walks an ordered chain (`fallback.ts`). Every chain crosses pools and
ends somewhere the primary pool serves, so a specialist outage degrades the
answer rather than breaking the conversation. The user sees at most one calm
line — "Wind switched to another reasoning path to finish this step." The real
cause goes to server telemetry with the engine key, error code and latency.

When a whole run produces nothing usable, the runtime falls back to answering
directly on the primary engine before it will show an error.

## Bounds

Every run carries an `ExecutionBudget`: specialist calls, orchestration depth,
per-lane attempts, wall-clock for the run and for each request. Uploads, prompt
size, replayed history and requests-per-minute are bounded at the edge. Depth
plus call ceiling is what makes an agent loop impossible rather than unlikely.

## The outbound guard

`redaction.ts` is the last thing between Wind and a user:

- raw engine identifiers (`vendor/model:tag`) → "a Wind specialist"
- vendor names, in any casing or inflection → "Wind"
- endpoints, API hosts, bearer tokens, key-shaped strings → removed
- HTTP and transport vocabulary → product language
- genuine file paths (`src/lib/wind/router.ts`) → left intact

`StreamSanitizer` applies the same passes to a live stream, holding a short tail
back so a name split across two frames is still caught. Every status, notice,
error and lane note is sanitised in the runtime; every delta is sanitised in the
route; the stored message is sanitised again on write.

## Workspace

Entities: workspace, department, member, team, conversation, message, task,
task step, agent, workflow, workflow run, knowledge source, integration,
connection, approval, artifact, activity event.

RBAC (`rbac.ts`) is a strict nesting from viewer to owner. The rule that matters
is `effectivePermissions(initiatorRole, agentGrants)`: the intersection, always.
An agent can be narrower than the person who started it, never wider.

Knowledge (`knowledge.ts`) filters by department membership *and* agent scope
before it scores anything. Retrieval is lexical and transparent by design; the
interface is what the rest of the system depends on, so replacing the body with
embeddings changes nothing above it.

## Adding things

**A specialist:** add the engine to `models.ts` (with a fallback chain), add a
brief in `specialists/`, map a role, and teach `planLanes` when to open the lane.

**An integration:** the catalogue itself is generated — add the definition to
`FIRST_CLASS` in `workspace/integrations.ts` (its `id` must match a catalogue
slug) and its tools to `wind/tools/registry.ts`, marking each tool's effect and
required permission. A `write` tool is held for approval by default. Implement the
adapter, and set the credentials the definition declares — the UI reports the
true state from the environment, so nothing else needs updating.
