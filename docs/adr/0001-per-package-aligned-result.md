# Per-package `Result`, aligned by shape

Each of `@typeact/api`, `@typeact/hono`, and `@typeact/msw` defines its own `Result` type rather than sharing one from core. They align on a common spine so they read as one family: discriminated by the presence of an `ok` vs `error` key (not a `kind`/`type` tag), the success arm keys the payload as `ok` with an optional `status`, and the failure arm keys as `error` with a `status`. `"ok" in r` narrows in every package.

The arms specialize per package: hono and msw carry `error: unknown` (an app throws whatever); api carries a _typed, discriminated_ failure union because the client must know why a call failed — `unknown` there would force casts, which the zero-cast policy bans. The api `error` is discriminated by a `kind` field with four arms:

- `input-validation` — the client's own Input failed to parse _before_ sending (developer error); carries `issues`.
- `response-validation` — the Response failed to parse against the Route's `response` schema (server's fault); carries `issues`.
- `http` — a response arrived but was non-2xx. Status-discriminated: declared error statuses (via `.error(status, schema)`) narrow `error` to their typed shape; undeclared statuses fall to `{ status: number; error: unknown }`.
- `network` — fetch never produced a response (offline, DNS, CORS, timeout, abort).

`"ok" in r` still splits ok/error at the top level, so the cross-package alignment holds. msw's raw `HttpResponse` escape hatch sits _outside_ the Result union (handler returns `Result | HttpResponse`), not as a third arm.

Core stays Result-free: it is pure definition (Contract/Route) and has no call or handler outcome to model.

## Considered Options

- **One shared `Result` in core, re-exported.** Rejected: it forces the client's richer failure taxonomy into `error: unknown`, so every caller casts to discover why a call failed — the exact thing the zero-cast policy forbids. Keeping the handler `Result` simple keeps handlers pleasant while letting the client be precise.
