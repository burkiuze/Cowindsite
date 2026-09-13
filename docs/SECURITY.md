# Security notes

## Credentials

- Both engine credentials are read only inside `src/lib/wind/adapters/endpoints.ts`,
  which is `server-only`. No component, route response or client bundle can reach them.
- No credential is ever logged. Telemetry stores engine keys (`wind.code`),
  error codes and latency — never headers, bodies or secrets.
- `.env*` files are git-ignored; `.env.example` ships with empty placeholders.
- Key-shaped strings and bearer tokens are stripped from any text on its way to
  a browser, in case one ever appears in engine output.

## Agent authority

An agent's permissions for a run are `agentGrants ∩ initiatorPermissions`.
There is no path that widens authority: the intersection is computed from the
session's member record, and the UI shows which grants are being dropped.

## Consequential actions

Tools declare an effect. `write` tools require approval by default. An approval
shows the exact payload, can be edited before approval, and produces a receipt.
Execution only happens against an integration whose credentials are actually
present; otherwise the receipt says plainly that nothing was sent.

## Input handling

- Request bodies are size-checked before parsing and schema-validated (Zod).
- Uploads, attachment counts, prompt characters and replayed history are bounded.
- Rate limiting is per member, per minute, refilling continuously.
- Model output is rendered by a dependency-free Markdown renderer that emits
  React nodes only — no `dangerouslySetInnerHTML`, so output cannot execute.

## What is never shown

Private reasoning, system prompts, raw provider errors, engine identifiers,
endpoints and vendor names. Execution visibility stops at operational state:
which stream is open, what it is called, and whether it finished.

## Reporting

Found something? Open an issue with reproduction steps — no credentials in the
report, please.
