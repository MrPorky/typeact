# @typeact/core

> Contract definition language for typeact — `createRoute`, `createContract`,
> path utilities, `InferRoute`.

`@typeact/core` is the foundation. It provides the vocabulary for describing an API
as a typed **Contract** that every other package consumes. Its only dependency is
`@standard-schema/spec`, which it **re-exports** — downstream packages import the
spec from core, never directly.

## Installation

```bash
pnpm add @typeact/core
```

Bring any [standard-schema](https://github.com/standard-schema/standard-schema)
validator (Zod, Valibot, ArkType, …).

## Defining a Route

A **Route** is one endpoint: a method, a path template, an **Input** (what the
client sends — `path`, `query`, `body`, `form`), and a **Response**. You can author
it two equivalent ways — both infer the exact same Route.

```ts
import { createRoute } from "@typeact/core";
import { z } from "zod";

// Object-map style — request facets grouped under `input`
const getUser = createRoute.get("/users/:id", {
  input: {
    path: { id: z.coerce.number() },
    query: { view: z.enum(["compact", "full"]).default("full") },
  },
  response: UserSchema,
});

// Builder style — flat input setters, same terms
const getUser2 = createRoute
  .get("/users/:id")
  .path({ id: z.coerce.number() })
  .query({ view: z.enum(["compact", "full"]).default("full") })
  .response(UserSchema);
```

Passing a second argument to `createRoute.get(...)` switches to the object-map;
omitting it returns the builder. `path`, `query`, `body`, and `form` are the four
input facets.

### Input vs output types

A validator is a _parser_: `z.coerce.number()` and `.default(...)` change the value.
So each facet has two types — `InferInput` (what you may pass; defaults optional) and
`InferOutput` (what comes out; defaults applied). A Route carries **both**: the client
call-site uses `InferInput`, and the server/mock handler receives `InferOutput`.

## Typed error responses

Declare error bodies per status with repeatable `.error(status, schema)` (or an
`errors` record in the object-map). Undeclared statuses stay untyped.

```ts
const getUser = createRoute
  .get("/users/:id")
  .path({ id: z.string() })
  .response(UserSchema)
  .error(404, z.object({ code: z.literal("USER_NOT_FOUND"), message: z.string() }))
  .error(403, z.object({ code: z.literal("NOT_AUTHORIZED"), missingPermission: z.string() }));
```

## Streaming Routes

The `response` slot can hold a streaming descriptor instead of a plain schema:

```ts
// Server-Sent Events — a map of event name → payload schema
createRoute.get("/rooms/:id/events", {
  input: { path: { id: z.string() } },
  response: createRoute.sse({
    message: z.object({ text: z.string(), sender: z.string() }),
    presence: z.object({ onlineCount: z.number() }),
  }),
});

// One-way chunk streams
createRoute.get("/export", { response: createRoute.stream(z.object({ token: z.string() })) }); // NDJSON
createRoute.get("/logs", { response: createRoute.stream.text() }); // text
createRoute.get("/file", { response: createRoute.stream.binary() }); // binary
```

**WebSocket** is its own top-level Route kind — no HTTP method, no `response` — with
two absolutely-named directions, `upstream` (client→server) and `downstream`
(server→client):

```ts
createRoute.ws("/rooms/:id", {
  input: { path: { id: z.string() } },
  upstream: [z.object({ type: z.literal("chat"), text: z.string() })],
  downstream: [
    z.object({ type: z.literal("message"), text: z.string(), sender: z.string() }),
    z.object({ type: z.literal("presence"), onlineCount: z.number() }),
  ],
});
```

## Composing a Contract

A **Contract** is an _array_ of Routes. Routes are identified by their
`(method, path)` pair — there are no route names. Compose across files by spreading
per-file arrays.

```ts
import { createContract } from "@typeact/core";

// users.ts
export const userRoutes = [getUser, createUser];
// posts.ts
export const postRoutes = [getPost];

// contract.ts
export const contract = createContract([...userRoutes, ...postRoutes]);
```

A duplicate `(method, path)` is reported at runtime by `warnOverlappingPaths`
(an array can't catch it at the type level).

## Path utilities & `InferRoute`

Core exposes helpers to build and match concrete URLs from `:param` templates, so
client, server, and mocks address a Route identically. `InferRoute` extracts a
Route's input/response types from a Contract by `(method, path)`:

```ts
import type { InferRoute } from "@typeact/core";

type GetUser = InferRoute<typeof contract, "GET", "/users/:id">;
//   ^ { input: { path: { id: number }; query: { view: "compact" | "full" } }; response: User }
```

## Query encoding

Query strings encode primitives and primitive arrays as flat repeated keys
(`?tag=a&tag=b`); object or array-of-object fields are URL-encoded JSON in a single
param. `undefined` is stripped, `null` is preserved. Core owns both the encode
(client) and decode (server) side, so they can never drift. See
[ADR-0011](https://github.com/typeact/typeact/blob/main/docs/adr/0011-url-query-encoding.md).
