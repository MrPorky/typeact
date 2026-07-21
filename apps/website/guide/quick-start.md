# Quick Start

This walkthrough defines a small Contract and wires it up to a client, a server,
and mocks. One Contract, four consistent surfaces — all addressed by `(method, path)`.

## 1. Define a Contract

A Contract is an array of Routes. Author each Route with the builder or the
object-map — both infer the same shape.

```ts
// contract.ts
import { createContract, createRoute } from "@typeact/core";
import { z } from "zod";

export const contract = createContract([
  createRoute
    .get("/users/:id")
    .path({ id: z.string() })
    .response(z.object({ id: z.string(), name: z.string() }))
    .error(404, z.object({ code: z.literal("USER_NOT_FOUND") })),

  createRoute.post("/users", {
    input: { body: { name: z.string() } },
    response: z.object({ id: z.string(), name: z.string() }),
  }),
]);
```

## 2. Call it from the client

Calls are method-first; the result is a `Result` you narrow on `ok`.

```ts
// client.ts
import { createClient } from "@typeact/api";
import { contract } from "./contract";

const client = createClient(contract, { baseUrl: "https://api.example.com" });

const r = await client.get("/users/:id", { path: { id: "42" } });
if (r.ok) {
  console.log(r.ok.name); // fully typed
} else if (r.error.kind === "http" && r.error.status === 404) {
  console.log(r.error.error.code); // "USER_NOT_FOUND" — typed
}

// or throw on failure:
const user = await client.get("/users/:id", { path: { id: "42" } }).orThrow();
```

## 3. Implement it on the server

Handlers are keyed path → method; `input` is pre-validated.

```ts
// server.ts
import { Hono } from "hono";
import { registerRoutes } from "@typeact/hono";
import { contract } from "./contract";

const app = new Hono();

registerRoutes(app, contract, {
  "/users/:id": {
    get: ({ input }) => {
      const user = db.users.find(input.path.id);
      return user ? { ok: user } : { error: { code: "USER_NOT_FOUND" }, status: 404 };
    },
  },
  "/users": {
    post: ({ input }) => ({ ok: db.users.create(input.body), status: 201 }),
  },
});

export default app;
```

## 4. Mock it in tests

```ts
// mocks.ts
import { setupServer } from "msw/node";
import { fromContract } from "@typeact/msw";
import { contract } from "./contract";

export const server = setupServer(
  ...fromContract(contract, {
    "/users/:id": {
      get: ({ input }) => ({ ok: { id: input.path.id, name: "Mock User" } }),
    },
  }),
);
```

That's it — one Contract, four consistent surfaces. Explore each package in more
detail under [Packages](/packages/core).
