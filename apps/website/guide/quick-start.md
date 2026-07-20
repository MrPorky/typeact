# Quick Start

This walkthrough defines a small contract and wires it up to a client, a server,
and mocks.

## 1. Define a contract

```ts
// contract.ts
import { createContract } from "@typeact/core";
import { z } from "zod";

export const contract = createContract({
  getUser: {
    method: "GET",
    path: "/users/:id",
    params: z.object({ id: z.string() }),
    response: z.object({ id: z.string(), name: z.string() }),
  },
});
```

## 2. Call it from the client

```ts
// client.ts
import { createClient } from "@typeact/api";
import { contract } from "./contract";

const client = createClient(contract, { baseUrl: "https://api.example.com" });

const result = await client.getUser({ params: { id: "42" } });
if (result.ok) {
  console.log(result.data.name);
}
```

## 3. Implement it on the server

```ts
// server.ts
import { Hono } from "hono";
import { registerRoutes } from "@typeact/hono";
import { contract } from "./contract";

const app = new Hono();

registerRoutes(app, contract, {
  getUser: ({ params }) => ({ id: params.id, name: "Ada" }),
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
    getUser: ({ params }) => ({ id: params.id, name: "Mock User" }),
  }),
);
```

That's it — one contract, four consistent surfaces. Explore each package in more
detail under [Packages](/packages/core).
