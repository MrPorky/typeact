# @typeact/core

> Contract definition language for typeact — route builder, `createContract`, path utilities, `InferRoute`.

`@typeact/core` is the foundation of typeact. It provides the vocabulary for
describing an API as a typed contract that every other package consumes.

## Installation

```bash
pnpm add @typeact/core
```

## `createContract`

Define a contract as a map of named routes:

```ts
import { createContract } from "@typeact/core";
import { z } from "zod";

export const contract = createContract({
  listPosts: {
    method: "GET",
    path: "/posts",
    query: z.object({ page: z.number().optional() }),
    response: z.array(z.object({ id: z.string(), title: z.string() })),
  },
  createPost: {
    method: "POST",
    path: "/posts",
    body: z.object({ title: z.string() }),
    response: z.object({ id: z.string(), title: z.string() }),
  },
});
```

## Path utilities

Contracts use `:param` style path templates. Core exposes helpers for building and
matching concrete URLs from those templates, so the client, server, and mocks all
agree on how a route is addressed.

## `InferRoute`

Extract the input and output types of any route from a contract:

```ts
import type { InferRoute } from "@typeact/core";

type CreatePost = InferRoute<typeof contract, "createPost">;
//   ^ { body: { title: string }; response: { id: string; title: string } }
```

Use these inferred types anywhere you need to reference a route's shape without
duplicating it.
