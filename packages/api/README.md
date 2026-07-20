# `@typeact/api`

Typed fetch client for `@typeact` contracts. `createClient(contract, options)` returns a fully typed HTTP client with methods matching your contract's routes.

## Features

- **`createClient`** — typed client from a contract: `.get()`, `.post()`, etc. return a `Result` discriminated union
- **`Result<T>`** — `{ ok: T, status?: number } | { error: unknown, status: number }` — never throw on network errors
- **`.orThrow()`** — convenience method to unwrap a result or throw
- **SSE support** — `onEvent(response)` for consuming typed SSE `AsyncIterable` streams
- **WebSocket & stream support** — typed WS and binary/text/NDJSON streaming
- **Interceptors** — configurable request/response pipeline
- **No framework dependency** — works in any JS runtime with `fetch`

## Installation

```bash
vp install @typeact/api
```

Requires `@standard-schema/spec` as a peer dependency for response validation.

## Quick Start

```ts
import { createContract, createRoute } from "@typeact/core";
import { createClient } from "@typeact/api";
import { z } from "zod";

const myApi = createContract({
  getUser: createRoute
    .get("/users/:id")
    .path({ id: z.string() })
    .response(z.object({ id: z.string(), name: z.string() })),
});

const client = createClient(myApi, { baseUrl: "https://api.example.com" });

const result = await client.getUser({ path: { id: "42" } });
if (result.ok) {
  console.log(result.data.name); // fully typed
}
```

## Development

```bash
vp test       # Run tests
vp check      # Lint, format, type-check
vp pack       # Build
```

## Zero-Cast Policy

This package follows the `@typeact` project-wide policy: **no `as` casts** except `as const` for literal inference and `as never` in exhaustive switch defaults. When uncertain, use `unknown` and narrow with type guards or standard-schema validation.
