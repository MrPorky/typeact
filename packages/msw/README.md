# `@typeact/msw`

Typed bridge from `@typeact` Contracts to [MSW](https://mswjs.io/) (Mock Service Worker) handlers. `fromContract(contract, handlers)` returns `HttpHandler[]` ready for use in any MSW environment.

## Features

- **`fromContract(contract, routeMap)`** — path-keyed route-config map in, `HttpHandler[]` out
- **Pre-validated input** — handler receives already-validated `{ param, query, body, form }` based on the Contract schema
- **Raw `HttpResponse` escape hatch** — drop down to raw MSW for cookies, redirects, delayed responses, etc.
- **Cross-environment** — works with vitest, Playwright, Cypress, Storybook, and browser via MSW's interceptors
- **No assertion utilities in v1** — use standard Vitest/Jest assertions

## Installation

```bash
vp install @typeact/msw
```

Requires `msw` ^2 as a peer dependency.

## Quick Start

```ts
import { http, HttpResponse } from "msw";
import { createContract, createRoute } from "@typeact/core";
import { fromContract } from "@typeact/msw";
import { z } from "zod";

const myApi = createContract({
  getUser: createRoute
    .get("/users/:id")
    .path({ id: z.string() })
    .response(z.object({ id: z.string(), name: z.string() })),
});

const handlers = fromContract(myApi, {
  getUser: async ({ input }) => {
    return HttpResponse.json({ id: input.path.id, name: "Alice" });
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
