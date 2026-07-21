# api interceptor pipeline: three kinds, asymmetric powers

`@typeact/api` exposes three interceptor kinds via `createClient(contract, { interceptors })`, each with deliberately different powers:

- **`request`** — runs before fetch and receives the **whole mutable fetch init** (`url`, `method`, `headers`, `body`, `credentials`, `signal`) plus the read-only `route` and `input`. Mutates in place. Used to attach auth, rewrite URLs, etc. (Exception: a `ws` call's ctx omits `headers` and exposes `url`/`protocols` instead — see ADR-0016.)
- **`error`** — runs on a failure (`network`, `http`, `response-validation`; **not** `input-validation`), receives the failed `route` narrowed by `(method, path)` so `error` is typed per route, and decides the outcome by returning `ctx.retry()` or `ctx.passthrough()`.
- **`success`** — runs on a validated success, **read-only** (`ok`, raw `response`). Cannot modify the response, preserving the "success is always the validated contract type" guarantee.

Each kind accepts a single function or an array run in registration order; all are `await`ed.

Interceptors can also be registered **dynamically** after client creation via
`client.interceptors.{request,error,success}.use(fn)`, which returns a remover
function — the same register-then-unsubscribe idiom as the WebSocket subscriptions
(ADR-0014). The static `createClient({ interceptors })` option is just convenient
initial setup that pre-registers through the same mechanism; static interceptors run
first, then `.use()`-added ones in call order. This makes lifecycle-scoped
interceptors possible — e.g. add the auth interceptor on login, remove it on logout —
without rebuilding the client.

Decisions worth the context:

- **Outcome via `ctx` methods (`retry()`/`passthrough()`), not magic return values.** Explicit and discoverable; a bare `return true` would be a guessing game.
- **`retry()` re-runs from the `request` interceptors**, not just re-`fetch` — otherwise a refreshed token (written to your token store by the `error` interceptor) would never be attached. Guarded by a per-call `attempt` counter exposed to interceptors and a hard `maxRetries` ceiling (default 3) so an always-retry interceptor can't infinite-loop.
- **The `error` interceptor cannot synthesize a success** (retry or propagate only). Recovery would fabricate an unvalidated success and invite `unknown` casts — banned by the zero-cast policy.
- **`input-validation` bypasses the pipeline entirely.** Nothing was sent, so no `request`/`error` interceptor runs; it fails fast to the caller.
- **Refresh-token single-flight is _not_ built in.** The client only guarantees the `error` interceptor is `async` and carries `{ route, error, request, attempt }`; deduping concurrent refreshes is user closure state (see the website interceptors guide). Keeping it out of the surface is the "enough context to build your own retry cycle" principle.
