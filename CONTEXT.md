# typeact

A set of `@typeact/*` packages for describing an HTTP API as a single typed **Contract** and consuming that one Contract everywhere: as a fetch client, a Hono server, and MSW mocks. "typeact" = type + contract.

## Language

**Contract**:
A collection of Routes describing an API — the typed pact a client and server both agree to. Produced by `createContract([...routes])` (an **array**, composable by spreading per-file route arrays). Routes are identified by their `(method, path)` pair, never by a name or map key.
_Avoid_: schema, spec, API definition, named map

**Route identity**:
The `(method, path)` pair that uniquely addresses a Route everywhere — client call, server handler, mock handler. `method` is an HTTP verb (`get`/`post`/…) **or** `ws`. There are no route names. A duplicate `(method, path)` in a Contract is reported at runtime by `warnOverlappingPaths` (arrays can't catch it at the type level — an accepted cost).

**Route**:
A single typed endpoint _definition_ in `@typeact/core`: an HTTP method (or `ws`), a path template, an Input, and a Response (or, for `ws`, `upstream`/`downstream`). Static. Authored either fluently (builder) or as an object-map — both infer the same Route shape.
_Avoid_: endpoint (an Endpoint is the callable, not the definition), handler (a handler implements a Route; it is not the Route)

**Handler map**:
How `@typeact/hono` and `@typeact/msw` bind Handlers to Routes: a **path → method** nested object, e.g. `{ "/users": { get: h, post: h }, "/rooms/:id": { ws: h } }`. Mirrors Route identity exactly; `ws` sits in the method slot alongside HTTP verbs.
_Avoid_: name-keyed handlers, flat path keys

**Interceptor**:
A user-supplied function on the `@typeact/api` client that observes or alters a call as it flows through the pipeline. Three kinds with asymmetric powers: **request** (mutates the outgoing fetch init before send), **error** (inspects a failure and returns `retry()`/`passthrough()`), **success** (read-only observation of a validated response). Registered per kind as a single function or an ordered array.
_Avoid_: middleware (that is a hono/server concept), hook, plugin

**RetryDecision**:
The opaque value an **error interceptor** must return, produced only by `ctx.retry()` (re-run the call from the request interceptors, `attempt`-bumped, `maxRetries`-ceilinged) or `ctx.passthrough()` (let the failure become the caller's `Result`).
_Avoid_: boolean flags, magic return values

**Endpoint**:
The callable, bound instance of a Route in `@typeact/api`, reached method-first by `(method, path)` — `client.get("/users/:id", input)`, `client.ws("/rooms/:id", ...)`. A Route plus a base URL and fetch config. Dynamic. What you actually invoke.
_Avoid_: route (a Route is the static definition), client method

**EndpointCall**:
What invoking an Endpoint returns: a `PromiseLike<Result<T>>` that also exposes `.orThrow(): Promise<T>`. Awaiting it yields a `Result`; awaiting `.orThrow()` yields the `ok` value and throws a `TypeactError` on failure.

**TypeactError**:
The `Error` subclass thrown by `EndpointCall.orThrow()`. Its `.failure` property carries the same discriminated failure union as the `Result` `error` arm; narrow with `instanceof TypeactError`.
_Avoid_: throwing the bare failure union

**Input**:
The grouping of everything a client sends for a Route: `path`, `query`, `body`, and `form`. It is a first-class part of the inferred Route shape (`{ input: {...}, response }`) regardless of which authoring style wrote it.
_Avoid_: request, params (those name only one facet)

**Input facet**:
One of the four members of Input — `path`, `query`, `body`, `form`. In the builder these are flat setters (`.path()`, `.query()`, ...); in the object-map they nest under `input`.

**Response**:
The primary output facet of a Route, set by `.response()` or the `response` key — the **success** body. Its value is either a plain schema (a **unary** Route) or a streaming descriptor (`createRoute.sse(...)` or `createRoute.stream(...)`). WebSocket is _not_ a Response — it is its own Route kind.
_Avoid_: output, result (Result is a different, client-side concept)

**Error response**:
An optional, status-keyed error body declared on a Route via repeatable `.error(status, schema)` (builder) or an `errors: { 404: schema }` record (object-map). Produces a typed, status-discriminated outcome: each declared status narrows to its schema; undeclared statuses stay `unknown`. Validated inbound on the client like a Response — a declared status whose body fails its schema is a `response-validation` failure, not a typed arm.
_Avoid_: exception, fault

**Route kind**:
What a Route's payload is shaped like: **unary** (one `response` value), **sse** (server→client named events), **stream** (one-way server→client chunks: NDJSON / text / binary), or **ws** (bidirectional WebSocket). `InferRoute` switches on the kind. unary/sse/stream live in the `response` slot; ws is a distinct top-level Route (`createRoute.ws(...)`) with no `response`.

**SSE event map**:
The argument to `createRoute.sse({ message: MsgSchema, presence: PresenceSchema })`: a map whose key is the wire `event:` name and whose value is that event's payload schema. Infers an `AsyncIterable` discriminated by event name.

**SseStream**:
The `ok` value of an SSE call — one kind of Stream whose items are per-event `Result`s (`{ ok: { event; data } } | { error }`), discriminated by the wire `event:` name.

**Stream**:
The `ok` value of any one-way streaming call (SSE, NDJSON, text, binary) — an `AsyncIterable` of per-item `Result`s. Validation failures are yielded and iteration continues; a fatal transport error is yielded as a final error Result before the iterator completes. Never throws. Item shape varies by kind: `{ event; data }` for SSE, a bare `Chunk`/`string`/`Uint8Array` for `stream`. Consumed by `for await` or `onEvent`.

**onEvent**:
A standalone, tree-shakeable `@typeact/api` helper that consumes any one-way Stream. Its handlers are derived from the item type: per-event-name handlers for SSE, a single `onData` handler for chunk streams — plus reserved lifecycle keys `onError(failure)` (0..n) and `onDone()` (once). No `onSuccess`. Not used for WebSocket.
_Avoid_: subscribe, addEventListener

**upstream / downstream**:
The two directions of a `ws` Route, named _absolutely_ (not by perspective): **upstream** = client→server, **downstream** = server→client. Each is an array meaning a _union of message schemas_; typeact imposes no name or discriminant (unlike an SSE event map). Both `@typeact/api` and `@typeact/hono` read these names identically — no perspective inversion.
_Avoid_: send/receive (perspective-ambiguous), client/server

**WsConnection**:
The `ok` value of a `client.ws(...)` call — an always-open, **multicast** bidirectional handle. Send with `conn.send(msg)` (typed to the `upstream` union, returns `Result<void>`). Receive by subscription: `conn.onMessage(handler)` (the whole validated `downstream` union, which you narrow yourself), `conn.onError(handler)`, `conn.onDisconnect(handler)` — each returning an `unsubscribe`. Also `AsyncIterable<Result<Downstream>>`. Messages with no listener are dropped, not buffered.
_Avoid_: socket, channel; `on(type)`/`onEvent`/`onClose`/`catch` (the methods are `onMessage`/`onDisconnect`/`onError`)

**Path template**:
The `/users/:id` string on a Route, with `:param` slots. Shared vocabulary so client, server, and mocks address a Route identically.
_Avoid_: url, route string

**Handler**:
An implementation of a Route on the server side (`@typeact/hono`) or mock side (`@typeact/msw`). Every Handler is a single-argument function whose argument always exposes a pre-validated `input`; past `input` the argument carries the native framework handle (hono's `context`, msw's `request`/`cookies`).
_Avoid_: route (a Route is the definition; a Handler implements it), resolver, controller
