# WebSocket auth: the `request` interceptor drops `headers` for `ws`

The browser `WebSocket` API is `new WebSocket(url, protocols)` — there is **no way**
to set custom HTTP headers on the handshake. So the `request` interceptor's usual
auth move (`ctx.headers.set("authorization", ...)`, which works for HTTP and for our
`fetch`-based SSE) silently does nothing for a `client.ws(...)` call. Left unshaped,
a single "add auth header" interceptor would authenticate HTTP and SSE but leak 401s
only on WebSockets — an invisible, maddening gap.

So for a `ws` call the `request` interceptor `ctx` **omits `headers`** and instead
exposes mutable **`url`** and **`protocols`**. The type system stops you from writing
header auth that can't work and points you at the mechanisms that can:

- **Cookie** — a same-origin WS handshake sends cookies automatically; cookie-based
  auth needs no interceptor at all.
- **Query param** — the interceptor edits `ctx.url` (`wss://…/rooms/1?token=abc`).
- **Subprotocol** — the interceptor sets `ctx.protocols` (`["bearer", token]`).

## Consequences

- The `request` interceptor `ctx` is not one shape: HTTP/SSE calls get the full
  mutable fetch init (`headers`, `body`, …); `ws` calls get `url` + `protocols`.
  Discriminate on `ctx.route.method === "ws"` to narrow.
