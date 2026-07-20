# `@typeact/hono`

Thin typed wrapper around [Hono](https://hono.dev/) routing. `registerRoutes(app, contract, handlers)` registers fully typed HTTP routes from a `@typeact` Contract.

## Features

- **`registerRoutes`** — register typed routes on a Hono app from a contract + handler map
- **Handler shape**: `({ context, input }) => Result` — single destructured param, `context` is Hono's `c`, `input` is pre-validated
- **SSE handlers** — auto-framing via Hono's `streamSSE`
- **Stream handlers** — NDJSON/Binary/Text streaming via `stream` / `streamText`
- **WebSocket handlers** — lifecycle handlers via optional `upgradeWebSocket` option
- **Validation** via standard-schema built-in middleware

## Installation

```bash
vp install @typeact/hono
```

Requires `hono` ^4 as a peer dependency.

## Quick Start

```ts
import { Hono } from "hono";
import { createContract, createRoute } from "@typeact/core";
import { registerRoutes } from "@typeact/hono";
import { z } from "zod";

const app = new Hono();

const contract = createContract({
  greet: createRoute
    .get("/hello/:name")
    .path({ name: z.string() })
    .response(z.object({ message: z.string() })),
});

registerRoutes(app, contract, {
  greet: async ({ context, input }) => {
    return { ok: { message: `Hello, ${input.path.name}!` } };
  },
});
```

## Development

```bash
vp test       # Run tests
vp check      # Lint, format, type-check
vp pack       # Build
```

## Zero-Cast Policy

This package follows the `@typeact` project-wide policy: **no `as` casts** except `as const` for literal inference and `as never` in exhaustive switch defaults. When uncertain, use `unknown` and narrow with type guards or standard-schema validation.
