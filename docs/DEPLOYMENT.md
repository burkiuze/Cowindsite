# Deploying Cowind

## Requirements

- Node 20+ (built and verified on Node 22)
- Two server-side credentials for Wind's engines

## Any Node host

```bash
npm ci
npm run build
npm start            # defaults to port 3000, override with PORT
```

Set the environment before starting:

```bash
WIND_PRIMARY_API_KEY=…
WIND_SPECIALIST_API_KEY=…
NEXT_PUBLIC_COWIND_URL=https://your-domain
```

## Vercel

1. Import the repository.
2. Framework preset: Next.js. No build-command override is needed.
3. Add the environment variables in **Project → Settings → Environment
   Variables**, for Production *and* Preview:

   | Name | Required | Notes |
   | --- | --- | --- |
   | `WIND_PRIMARY_API_KEY` | yes | Fast conversational layer |
   | `WIND_SPECIALIST_API_KEY` | yes | Specialist pool |
   | `NEXT_PUBLIC_COWIND_URL` | recommended | Public URL, used for metadata |
   | `WIND_MODEL_*` | no | Per-role engine overrides |
   | `WIND_*_TIMEOUT_MS`, `WIND_MAX_*`, `WIND_RATE_LIMIT_PER_MINUTE` | no | Guardrails |

   Never prefix a credential with `NEXT_PUBLIC_` — that publishes it to the browser.

4. Deploy, then check `/api/health`. It reports `windReady` without saying
   anything about who serves the engines.

The chat route runs on the Node runtime with `maxDuration = 60`, which every
Vercel plan accepts, and `vercel.json` enables fluid compute so a streaming run
stays efficient inside it. A deep multi-lane run can want longer: raise the
export in `src/app/api/wind/chat/route.ts` to what your plan allows (a value
above the plan ceiling fails the build), and raise `WIND_TASK_TIMEOUT_MS` to
match. Left as is, Wind's own run budget is the tighter of the two.

## The workspace is sealed by default

Only the public site is reachable. `/app` and the routes that drive it are
closed by middleware unless an operator opens them:

| Variable | Effect |
| --- | --- |
| `COWIND_WORKSPACE_ENABLED=1` | Opens the workspace to everyone |
| `COWIND_PREVIEW_KEY=<secret>` | Opens it to whoever visits `/app?preview=<secret>`, which sets an http-only cookie and drops the secret from the URL |

With neither set, a workspace page redirects to `/access` and a workspace API
returns 404. `/api/health` stays public.

## Making an approved action actually run

An approval only executes when two things are true: the integration is
connected (its credentials are present) **and** an action endpoint is wired for
it. The endpoint receives the tool id and the approved payload and performs the
real call for that service:

```bash
INTEGRATION_ENDPOINT_GOOGLE_CALENDAR=https://actions.example.com/calendar
INTEGRATION_ENDPOINT_GMAIL=https://actions.example.com/gmail
```

The variable name is `INTEGRATION_ENDPOINT_` plus the service slug, uppercased,
with non-alphanumerics as underscores. Without one, an approved action is
recorded and its receipt says plainly that nothing was sent — Cowind never
reports work it did not do.

## After deploying

- `/settings` shows which credentials the server can see and every active guardrail.
- `/integrations` shows the true connection state of every service.
- A workspace-level rate limit and execution budget are on by default; tighten
  them with environment variables rather than code.

## Multi-instance

Workspace state is in-process. Before scaling past one instance, implement the
`WorkspaceStore` interface in `src/lib/workspace/store.ts` against a shared
database and back the rate limiter in `src/lib/api.ts` with the same store.
