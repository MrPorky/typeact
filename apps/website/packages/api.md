# @typeact/api

> Typed fetch client for typeact Contracts — `createClient`, `Result`, SSE / stream
> / WebSocket support, `onEvent`.

`@typeact/api` turns a Contract into a fully typed client. Calls are **method-first**,
addressed by `(method, path)`, and every input, response, and error is inferred from
the Contract.

## Installation

```bash
pnpm add @typeact/api @typeact/core
```

## `createClient`

```ts
import { createClient } from "@typeact/api";
import { contract } from "./contract";

const client = createClient(contract, {
  baseUrl: "/api", // optional; single-slash join with the path template
  headers: { "x-app": "web" }, // static defaults, applied UNDER interceptors
  credentials: "include", // e.g. send cookies
  timeout: 10_000, // ms -> AbortSignal.timeout
  maxRetries: 3,
  // interceptors: { request, error, success }  // see the Interceptors guide
});

// method-first, input passed as the request facets:
const r = await client.get("/users/:id", { path: { id: "42" }, query: { view: "full" } });
```

Every call takes a third, per-call override arg (`{ headers, signal, credentials,
timeout }`) merged last. Override order is: static `headers` → `request` interceptors
→ per-call overrides (last wins).

## `Result`

A call never throws — it returns a `Result`, discriminated by the presence of `ok`
vs `error`:

```ts
const r = await client.get("/users/:id", { path: { id } });
if (r.ok) {
  r.ok; // the validated response, fully typed
} else {
  switch (r.error.kind) {
    case "input-validation": // your input failed its schema before sending
    case "response-validation": // the server's body failed the contract
      r.error.issues;
      break;
    case "http": // a non-2xx arrived
      r.error.status;
      break; // declared .error() statuses narrow r.error to their typed shape
    case "network": // no response (offline, DNS, CORS, timeout, abort)
      r.error.cause;
      break;
  }
}
```

`error` is a superset of the handler side on purpose: the client must know _why_ a
call failed, so it discriminates on `kind` (no `unknown`, no casts). See
[ADR-0001](https://github.com/typeact/typeact/blob/main/docs/adr/0001-per-package-aligned-result.md).

### Typed errors

If a Route declares `.error(status, schema)`, the `http` arm narrows per status:

```ts
if (!r.ok && r.error.kind === "http" && r.error.status === 404) {
  r.error.error.code; // "USER_NOT_FOUND" — typed from the Route's 404 schema
}
```

Declared error bodies are validated inbound like responses; a declared status whose
body fails its schema surfaces as `response-validation`.

## `orThrow`

For the ergonomic path, unwrap to the `ok` value and throw on failure:

```ts
const user = await client.get("/users/:id", { path: { id } }).orThrow();
```

It throws a `TypeactError` (an `Error` subclass) whose `.failure` is the same
discriminated union — narrow with `instanceof TypeactError`.

## Interceptors

Attach auth, retry on 401, observe successes — via `request` / `error` / `success`
interceptors, set at construction or added dynamically:

```ts
const remove = client.interceptors.request.use((ctx) => {
  ctx.headers.set("authorization", `Bearer ${token}`);
});
remove(); // unregister later (e.g. on logout)
```

See the **[Interceptors guide](../guide/interceptors)** (including the
single-flight token-refresh recipe).

## Streaming & WebSockets

SSE and one-way streams return `Result<Stream>` where the stream yields per-item
`Result`s; consume with `for await` or the standalone `onEvent` helper. WebSockets
return `Result<WsConnection>` — a multicast, bidirectional handle. See the
**[Streaming guide](../guide/streaming)** and **[WebSockets guide](../guide/websockets)**.
