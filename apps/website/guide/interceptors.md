# Interceptors

`@typeact/api` runs every call through an interceptor pipeline. There are three
kinds, each with deliberately different powers:

| Kind      | Runs on              | Can it change things?                              |
| --------- | -------------------- | -------------------------------------------------- |
| `request` | before every fetch   | **Yes** — mutates the whole fetch init in place    |
| `error`   | on a failed outcome  | Decides `retry()` vs `passthrough()` — no mutation |
| `success` | on a validated reply | **No** — read-only observation                     |

```ts
import { createClient } from "@typeact/api";
import { contract } from "./contract";

const client = createClient(contract, {
  baseUrl: "/api",
  maxRetries: 3,
  interceptors: {
    request: (ctx) => {
      ctx.headers.set("authorization", `Bearer ${tokens.access}`);
    },
    error: (ctx) => ctx.passthrough(),
    success: (ctx) => analytics.record(ctx.route.method, ctx.route.path),
  },
});
```

Each kind accepts a single function **or an array** run in registration order,
and all may be `async`.

## Adding and removing interceptors dynamically

Beyond the `createClient` option, interceptors can be registered at runtime. Each
`.use(fn)` returns a remover — the same idiom as a WebSocket subscription:

```ts
const removeAuth = client.interceptors.request.use((ctx) => {
  ctx.headers.set("authorization", `Bearer ${tokens.access}`);
});

const removeLog = client.interceptors.success.use((ctx) => {
  analytics.record(ctx.route.method, ctx.route.path);
});

// later — e.g. on logout
removeAuth();
```

Static interceptors (the `createClient` option) run first, then `.use()`-added ones
in call order. This makes lifecycle-scoped interceptors easy: add on login, remove
on logout, no client rebuild.

## The pipeline

For each attempt the client:

1. Builds the fetch init from `(method, path, input)`, running the input
   validators to apply defaults and coercions. An `input-validation` failure
   here **short-circuits the whole pipeline** — nothing is sent, no interceptor
   runs, and the caller gets the error immediately.
2. Runs `request` interceptors in order, mutating the shared init.
3. Calls `fetch`.
4. Classifies the outcome: a thrown fetch is `network`; a non-2xx is `http`
   (declared error bodies are validated); a 2xx has its `response` validated to
   `ok` or `response-validation`.
5. On **success**, runs `success` interceptors (read-only) and returns `{ ok }`.
6. On **failure**, runs `error` interceptors in order. The first to return
   `ctx.retry()` re-runs from step 1 (if `attempt < maxRetries`); if all return
   `ctx.passthrough()`, the failure becomes the caller's `Result`.

Because `retry()` re-runs from the `request` interceptors, anything they read —
like a freshly refreshed access token — is reapplied on the retry.

## Recipe: refresh an expired token once, across concurrent requests

typeact does **not** build token refresh into the client. Instead the `error`
interceptor gives you `{ route, error, request, attempt }` and an `async` body —
enough to build your own retry cycle. The classic requirement is _single-flight_
refresh: if ten requests 401 at the same moment, refresh **once** and let all ten
await that single refresh before retrying.

```ts
// --- token store + single-flight refresh (plain module state, no library) ---
const tokens = { access: "", refresh: "" };
let refreshInFlight: Promise<boolean> | null = null;

function refreshOnce(): Promise<boolean> {
  // Every caller that arrives while a refresh is running awaits the SAME promise.
  refreshInFlight ??= (async () => {
    try {
      const res = await fetch("/auth/refresh", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ refresh: tokens.refresh }),
      });
      if (!res.ok) return false;
      const next: unknown = await res.json();
      // zero-cast: validate before trusting the payload
      const parsed = TokenSchema["~standard"].validate(next);
      if (parsed instanceof Promise || parsed.issues) return false;
      tokens.access = parsed.value.access;
      tokens.refresh = parsed.value.refresh;
      return true;
    } finally {
      refreshInFlight = null; // clear so a future 401 can refresh again
    }
  })();
  return refreshInFlight;
}

// --- client ---
const client = createClient(contract, {
  baseUrl: "/api",
  maxRetries: 3,
  interceptors: {
    request: (ctx) => {
      ctx.headers.set("authorization", `Bearer ${tokens.access}`);
    },
    error: async (ctx) => {
      if (ctx.error.kind === "http" && ctx.error.status === 401 && ctx.attempt < 1) {
        const ok = await refreshOnce(); // all concurrent 401s await the same refresh
        if (ok) return ctx.retry(); // re-runs `request`, attaching the NEW token
      }
      return ctx.passthrough(); // give up — error propagates to the caller
    },
  },
});
```

### What happens when three requests 401 at once

1. All three fetches return `401` and each fires the `error` interceptor.
2. The **first** to reach `refreshOnce()` sees `refreshInFlight === null`, starts
   the refresh, and stores the promise.
3. The other two see a promise already in flight and, via `??=`, await the **same**
   one — so exactly **one** network refresh happens.
4. It resolves `true`, `refreshInFlight` is cleared, and all three return
   `ctx.retry()`.
5. Each retry re-runs `request`, which now reads the **new** `tokens.access`.
   `attempt` is `1`, so a second 401 would `passthrough()` instead of looping.

The single-flight logic lives entirely in your closure — the client only
guarantees the interceptor shape that makes it possible.
