# Streaming Route model: kind-tagged payloads, WS on its own

A Route's payload is one of four kinds, and the kind is carried by the _value_ of the terminal, not by a separate flag — so `InferRoute` switches on it and every consumer (api/hono/msw) derives the right shape zero-cast.

- **unary** — `.response(schema)` — one value.
- **sse** — `.response(createRoute.sse({ message: A, presence: B }))` — a **map** keyed by the wire `event:` name; infers `AsyncIterable` discriminated by event name.
- **stream** — `.response(createRoute.stream(ChunkSchema))` for NDJSON, `createRoute.stream.text()` / `createRoute.stream.binary()` for raw one-way chunks; infers `AsyncIterable<Chunk>`.
- **ws** — `createRoute.ws("/rooms/:id")`, a **distinct top-level Route with no `response` slot**, carrying `{ upstream: [...schemas], downstream: [...schemas] }` — each an array meaning a **union of message schemas**. typeact imposes no discriminant: on receive it validates a raw frame against the union (tries the members); how a message is told apart is the consumer's concern.

Two shape choices worth the context:

- **SSE stays inside `response`; WS does not.** SSE and one-way streams genuinely _are_ the body of a normal GET, so they belong in the one output facet. WS is a different transport (upgrade handshake, no HTTP response body); modeling it as a `response` would leak that lie into every consumer. So WS is its own entry point.
- **WS directions are named absolutely — `upstream` (client→server) / `downstream` (server→client) — not `send`/`receive`.** A WS Route is authored once but consumed by both the client and the server; perspective-relative names (`send`/`receive`) force one side to read them inverted. Absolute names read identically on both sides.
- **SSE uses a named map (wire `event:` field); WS uses arrays (plain JSON frames, no typeact-imposed name).** The asymmetry is justified: SSE has a wire-level event name to dispatch on, WS frames don't — which is why SSE is consumed by name (`onEvent`) and WS by union (`onMessage`).
