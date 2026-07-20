# `@typeact/core`

Contract definition language for the `@typeact` ecosystem. Provides route builders (`createRoute.get()`, `.post()`, etc.), `createContract`, path utilities, and `InferRoute`.

This package has **zero runtime framework coupling** — it only depends on `@standard-schema/spec` for type-safe validation integration.

## Features

- **`createRoute`** — chainable route builder with `.get()`, `.post()`, `.put()`, `.patch()`, `.delete()`, `.ws()` methods
- **`createContract`** — compose multiple routes into a typed contract
- **`InferRoute`** — extract endpoint types from a route or contract
- **Path utilities** — typed path parameters, slot resolution, query string building
- **`warnOverlappingPaths`** — shared utility for detecting conflicting route patterns
- **Standard-schema compatible** — integrates with Zod, Valibot, ArkType, or any `@standard-schema/spec` validator

## Installation

```bash
vp install @typeact/core
```

## Quick Start

```ts
import { createRoute } from "@typeact/core";
import { z } from "zod";

const getUser = createRoute
  .get("/users/:id")
  .path({ id: z.string() })
  .query({ include: z.string().optional() })
  .response(z.object({ id: z.string(), name: z.string() }));
```

## Development

```bash
vp test       # Run tests
vp check      # Lint, format, type-check
vp pack       # Build
```

## Zero-Cast Policy

This package follows the `@typeact` project-wide policy: **no `as` casts** except `as const` for literal inference and `as never` in exhaustive switch defaults. When uncertain, use `unknown` and narrow with type guards or standard-schema validation.
