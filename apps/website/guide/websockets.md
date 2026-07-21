# WebSockets

A WebSocket Route is its own top-level kind — no HTTP method, no `response`. It
declares two directions, named absolutely: `upstream` (client→server) and
`downstream` (server→client), each an array of message schemas discriminated by an
internal `type` field.

```ts
const room = createRoute.ws("/rooms/:id", {
  path: { id: z.string() },
  upstream: [
    z.object({ type: z.literal("chat"), text: z.string() }),
    z.object({ type: z.literal("typing") }),
  ],
  downstream: [
    z.object({ type: z.literal("message"), text: z.string(), sender: z.string() }),
    z.object({ type: z.literal("presence"), onlineCount: z.number() }),
  ],
});
```

`upstream` and `downstream` are each a _union_ of message schemas. typeact imposes
no name or discriminant — the `type` literals above are your own convention, not a
requirement. A message can be any schema, even `z.string()`.

## Connecting

`client.ws(...)` returns a `Result` — the handshake can fail — and only resolves
once the socket is open, so a `WsConnection` you hold is always connected:

```ts
const r = await client.ws("/rooms/:id", { path: { id } });
if (!r.ok) return; // r.error: network | http
const conn = r.ok;
```

## Authentication

The browser `WebSocket` API can't send custom headers, so a header-based
`request` interceptor does **not** apply to WebSockets. For a `ws` call the
interceptor `ctx` exposes `url` and `protocols` instead of `headers`:

```ts
request: (ctx) => {
  if (ctx.route.method === "ws") {
    ctx.url += `?token=${tokens.access}`; // query param
    // or: ctx.protocols = ["bearer", tokens.access];  // subprotocol
  } else {
    ctx.headers.set("authorization", `Bearer ${tokens.access}`);
  }
};
```

Same-origin cookies are sent on the WS handshake automatically, so cookie-based
auth needs nothing here.

## Sending (upstream)

`conn.send(msg)` is typed to the `upstream` union, transforms `msg` through its
schema, and returns `Result<void>`:

```ts
const sent = conn.send({ type: "chat", text: "hi" });
if (!sent.ok) console.warn(sent.error); // input-validation | network — or fire-and-forget
```

## Receiving (downstream)

A WebSocket frame carries no name, and a downstream schema can be any shape — so
unlike SSE there is nothing to dispatch by name. `conn.onMessage` hands you the
whole validated `downstream` **union** and you narrow it yourself. The connection is
**multicast**: subscribe as many listeners as you like, each returning an
`unsubscribe` — exactly what a React `useEffect` cleanup wants:

```ts
useEffect(() => {
  const off = conn.onMessage((msg) => {
    switch (
      msg.type // your own discriminant
    ) {
      case "message":
        setMessages((p) => [...p, msg]);
        break;
      case "presence":
        setOnlineCount(msg.onlineCount);
        break;
    }
  });
  return off; // unsubscribe on unmount
}, [conn]);

const offError = conn.onError((failure) => console.warn(failure));
const offGone = conn.onDisconnect(() => setConnected(false));
```

- `conn.onMessage(handler)` — every downstream message, as the full union.
- `conn.onError(handler)` — validation or transport failures (0..n times).
- `conn.onDisconnect(handler)` — the socket closed (once). A fatal transport error
  fires `onError` first, then `onDisconnect`.
- `conn.close()` — close the socket yourself.

Because the connection is multicast, a message that arrives with no listener is
**dropped**, not buffered — subscribe first, then messages flow.

`for await (const msg of conn)` also works (per-message `Result`s, multicast), but
subscriptions are the primary API for UI code.
