# WebSocket client consumption: Result handshake, multicast subscriptions

`client.ws(path, input)` returns `Result<WsConnection>` — the handshake can fail
(`network` / `http`) like any other call, and the `Result` only resolves **after**
the handshake, so a held `WsConnection` is always open (there is no "connecting"
state to model).

`WsConnection` is bidirectional:

- **Send (upstream)** — `conn.send(msg)` is typed to the `upstream` union
  (discriminated by an internal `type` field). It **transforms `msg` via the
  matching upstream schema** before sending (parse-then-send, per ADR-0002, so
  defaults/coercions apply) and returns **`Result<void>`**: `{ ok }` when queued,
  `{ error: input-validation }` if `msg` fails its schema, `{ error: network }` if
  the socket has dropped. Throw-free; fire-and-forget is fine because failures also
  surface via `onError`/`onDisconnect`.
- **Receive (downstream)** — the connection is **multicast**. Each downstream
  message fans out to every subscriber via a single `onMessage` handler that
  receives the whole validated downstream **union** — the consumer discriminates it
  however their schema allows. A message that arrives with no listener is
  **dropped** (fire-and-forget, like a real socket), not buffered — the opposite of
  the pull-buffered one-way streams.

The subscription API is an EventEmitter-style family, each returning an
`unsubscribe` for `useEffect` cleanup:

- `conn.onMessage(handler)` — every downstream message; `handler` receives the full
  downstream union (`InferOutput`), which the consumer narrows itself.
- `conn.onError(handler)` — validation or transport failures (0..n).
- `conn.onDisconnect(handler)` — socket closed (once). A fatal transport error fires
  `onError` then `onDisconnect`, matching the stream model's "error, then done".
- `conn.close()` — explicit clean close.

`for await (const msg of conn)` still works alongside subscriptions (also multicast,
yielding per-message `Result`s), but subscriptions are the primary API.

## Decisions worth the context

- **`conn.onMessage(union)`, not `conn.on(type, cb)`.** SSE has a wire-level event
  name, so per-name dispatch (`onEvent`) is natural there. A WebSocket frame carries
  **no name**, and a downstream schema can be any shape (`z.string()`, a union on
  `kind`, no discriminant at all), so there is no reliable key to dispatch on.
  Forcing a name would be a lie about the transport. `onMessage` hands you the
  validated union and you discriminate; the three helpers then honestly reflect what
  each transport provides: SSE → `onEvent` (named), WS → `onMessage` (union), chunk
  stream → `onData` (single type).
- **`onError`, not `catch`.** `.catch` carries Promise semantics (terminal, returns
  a chainable) that clash with a multicast subscription returning `unsubscribe`.
  `onMessage`/`onError`/`onDisconnect` form one coherent subscription family.
- **`onDisconnect`, not `onClose`** — "disconnect" is the WebSocket vocabulary.
