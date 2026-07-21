# Streaming

One-way streams (SSE, NDJSON, text, binary) share one consumption spine: the call
returns `Result<Stream>`, and the stream yields per-item `Result`s that never
throw. They differ only in the item shape.

## Server-Sent Events (SSE)

An SSE Route declares its events as a map of `event:` name → payload schema:

```ts
const roomEvents = createRoute.get("/rooms/:id/events", {
  path: { id: z.string() },
  response: createRoute.sse({
    message: z.object({ text: z.string(), sender: z.string() }),
    presence: z.object({ onlineCount: z.number() }),
  }),
});
```

## Consuming a stream

An SSE call returns a `Result`, because the connection can fail before any event
arrives. The `ok` arm is the live `SseStream`:

```ts
const r = await client.get("/rooms/:id/events", { path: { id } });
if (!r.ok) return; // r.error: network | http | response-validation — the handshake failed

for await (const evt of r.ok) {
  if (evt.ok) {
    switch (evt.ok.event) {
      case "message":
        evt.ok.data.text;
        break; // typed from the schema
      case "presence":
        evt.ok.data.onlineCount;
        break;
    }
  } else {
    // evt.error.kind === "response-validation" -> one bad event; loop continues
    // evt.error.kind === "network"            -> fatal; this is the last item, loop ends
    console.warn(evt.error);
  }
}
```

Every item is a `Result`, so you never need `try/catch`. A single malformed event
is yielded as a `response-validation` error and the stream **keeps going** — skip
it or `break`, your choice. A dropped connection is yielded as a final `network`
error and then the iterator completes.

## `onEvent`

`onEvent` is a standalone helper that dispatches by event name so you don't write
the `switch` yourself:

```ts
import { onEvent } from "@typeact/api";

const stop = onEvent(r.ok, {
  message: (data) => appendMessage(data.text, data.sender), // typed per event
  presence: (data) => setOnlineCount(data.onlineCount),
  onError: (failure) => console.warn(failure), // 0..n times
  onDone: () => console.log("stream ended"), // once
});

// later
stop(); // aborts the stream and stops delivery
```

The per-event handlers are the success path (there is no `onSuccess`). `onError`
and `onDone` are reserved lifecycle keys, so an SSE event cannot be named
`onError` or `onDone`.

## NDJSON / text / binary streams

A `createRoute.stream(...)` Route has no event names — just chunks of one type — so
it's consumed with `for await`, or with `onEvent` using a single `onData` handler:

```ts
const report = createRoute.get("/export", {
  response: createRoute.stream(z.object({ token: z.string() })), // NDJSON
  // or createRoute.stream.text() / createRoute.stream.binary()
});

const r = await client.get("/export");
if (!r.ok) return;

// for await
for await (const chunk of r.ok) {
  if (chunk.ok)
    chunk.ok.token; // typed Chunk
  else chunk.error; // response-validation (continue) or network (final)
}

// or onEvent with onData
onEvent(r.ok, {
  onData: (chunk) => chunk.token, // typed Chunk / string / Uint8Array
  onError: (failure) => console.warn(failure),
  onDone: () => console.log("done"),
});
```

`onEvent` works for every one-way stream: SSE items are name-discriminated so you
get per-event handlers; chunk streams have one type so you get `onData`. TypeScript
picks the right handler shape from the stream. WebSocket is _not_ consumed with
`onEvent` — it is bidirectional and has its own API.
