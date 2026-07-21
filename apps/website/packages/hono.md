# @typeact/hono

> Typed [Hono](https://hono.dev) server integration for typeact Contracts —
> `registerRoutes`.

`@typeact/hono` registers a Contract's Routes onto a Hono app. Handlers receive a
pre-validated, fully typed `input` and are checked against the Contract's response
types, so the server can never drift from the client.

## Installation

```bash
pnpm add @typeact/hono @typeact/core hono
```

## `registerRoutes`

Handlers are a **path → method** map that mirrors Route identity. Each handler is
`({ context, input }) => Result` — a single argument whose `input` is the validated
request (`InferOutput`), and whose `context` is the native Hono `c`.

```ts
import { Hono } from "hono";
import { registerRoutes } from "@typeact/hono";
import { contract } from "./contract";

const app = new Hono();

registerRoutes(app, contract, {
  "/users/:id": {
    get: ({ input }) => {
      const user = db.users.find(input.path.id);
      if (!user) return { error: { code: "USER_NOT_FOUND", message: "…" }, status: 404 };
      return { ok: user }; // status defaults to 200
    },
  },
  "/users": {
    post: ({ input, context }) => {
      const user = db.users.create(input.body);
      return { ok: user, status: 201 };
    },
  },
});

export default app;
```

## Result

A handler returns `{ ok, status? }` or `{ error, status }`:

- `{ ok }` → `status ?? 200`, JSON body = `ok` (trusted by its type, not re-validated).
- `{ error, status }` → that status. If the status was declared with `.error()`, the
  `error` shape is **compile-checked** against its schema; returning the wrong shape
  is a type error. Undeclared statuses may still be returned untyped.

## Input validation

`input` is validated **before** the handler runs. Invalid input short-circuits with
an automatic `400` and the standard-schema `issues` — the handler never sees a bad
request, exactly like the client and mocks.

## Streaming: SSE, streams, WebSockets

Streaming Routes are implemented with Hono's primitives while staying typed:

- **SSE** (`createRoute.sse({...})`) — auto-framed via `streamSSE`; you send typed,
  named events.
- **NDJSON / text / binary** (`createRoute.stream(...)`) — auto-encoded via
  `stream` / `streamText`.
- **WebSocket** (`createRoute.ws(...)`) — lifecycle handlers via Hono's
  `upgradeWebSocket`; the handler reads `upstream` (client→server) messages and
  sends `downstream` (server→client) ones, both typed.
