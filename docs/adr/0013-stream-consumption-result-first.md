# Stream consumption is Result-first, all the way down

Consuming any one-way stream (SSE, NDJSON, text, binary) never throws. All stream
kinds share one spine and differ only in the item shape.

**Shared spine:**

- **Connection** — the call returns `Result<Stream>`. A failed handshake (offline,
  non-2xx) lands on the ordinary failure taxonomy (`network` / `http` /
  `response-validation`), identical to a unary call. The `ok` arm is the live stream.
- **Each item** — the stream is an `AsyncIterable` of **`Result`** items, so
  `for await` needs no `try/catch`. A per-item validation failure is yielded as
  `{ error: { kind: "response-validation", ... } }` and the stream **continues**; a
  fatal transport failure is yielded as a **final** `{ error: { kind: "network" } }`
  and then the iterator **completes**. Throw-free end to end. Resilience vs
  strictness (skip vs `break`) is the consumer's call, not the library's.

**Item shape differs by kind:**

- **SSE** (`createRoute.sse({ message, presence })`) — `Item = { event; data }`,
  discriminated by the wire `event:` name.
- **NDJSON** (`createRoute.stream(ChunkSchema)`) — `Item = Chunk`, one type, no names.
- **text / binary** (`createRoute.stream.text()` / `.binary()`) — `Item = string` /
  `Uint8Array`; validation is identity but still `Result`-wrapped for uniformity.

**`onEvent`** is a standalone, tree-shakeable helper for all one-way streams. Its
handler object is derived from the item type: name-discriminated items (SSE) get
per-event-name handlers (typed from each event's schema); single-chunk items get a
single `onData` handler. Both share reserved lifecycle keys `onError(failure)`
(0..n) and `onDone()` (once). There is no `onSuccess`. Preference is for named SSE
handlers, but if the conditional/mapped types that switch the handler shape by kind
add too much complexity or hurt inference, `onEvent` degrades to a uniform `onData`
that receives the whole discriminated item and the consumer switches inside.

**WebSocket is excluded** from `onEvent`: it is bidirectional (also needs a _send_ /
`upstream` side) and its downstream discriminates on an internal `type` field, not
an SSE event name — so WS gets its own consumption API.
