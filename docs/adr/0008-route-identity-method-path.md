# Routes are identified by `(method, path)`, not by name

A Contract is an **array** of Routes, and every Route is addressed by its `(method, path)` pair everywhere — the client call, the hono handler, and the msw handler. There are no route names.

We explored a name-keyed map (`createContract({ getUser: ... })`) first, but the keys were never used for addressing — the client, both handler packages, and the underlying frameworks (`fetch`, `app.get`, `http.get`) all speak `(method, path)`. A name would have been dead weight that could silently duplicate or drift from the path it labels. Dropping names makes the four packages share one addressing scheme, which is the project's alignment goal.

Concretely:

- **define:** `createContract([ createRoute.get("/users/:id", {...}), createRoute.post("/users", {...}) ])`; compose across files by spreading per-file route arrays.
- **client:** method-first — `client.get("/users/:id", input)`.
- **hono / msw:** a **path → method** nested handler map — `{ "/users": { get: h, post: h } }`.
- **WebSocket:** `ws` is a value in the _method slot_, not an HTTP verb — `createRoute.ws("/rooms/:id", {...})`, `client.ws("/rooms/:id", ...)`, `{ "/rooms/:id": { ws: h } }`. WS is thus "top-level" (its own entry point everywhere) while SSE/stream stay ordinary `get` routes whose `response` is a streaming descriptor.

## Consequences

- A duplicate `(method, path)` cannot be caught at the type level in an array; `warnOverlappingPaths` reports it at runtime. This is the accepted cost of dropping the map's unique-key guarantee.
- To refer to a route in prose or types you name it by `(method, path)`, not by a short handle.
