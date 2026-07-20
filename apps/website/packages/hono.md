# @typeact/hono

> Thin typed Hono wrapper for typeact contracts — `registerRoutes`, SSE/stream/WS support.

`@typeact/hono` registers a contract's routes onto a [Hono](https://hono.dev) app.
Handlers receive fully typed inputs and are checked against the contract's response
types, so the server can never drift from the client.

## Installation

```bash
pnpm add @typeact/hono @typeact/core hono
```

## `registerRoutes`

```ts
import { Hono } from "hono";
import { registerRoutes } from "@typeact/hono";
import { contract } from "./contract";

const app = new Hono();

registerRoutes(app, contract, {
  listPosts: ({ query }) => {
    return db.posts.list({ page: query.page ?? 1 });
  },
  createPost: ({ body }) => {
    return db.posts.create(body);
  },
});

export default app;
```

Each handler key must match a route name in the contract, and its argument and
return type are inferred from that route.

## Streaming: SSE, WebSockets, and streams

Routes declared as streaming in the contract can be implemented with Hono's
streaming primitives while remaining fully typed:

```ts
registerRoutes(app, contract, {
  watchPosts: ({ stream }) => {
    stream.onNewPost((post) => stream.send(post));
  },
});
```
