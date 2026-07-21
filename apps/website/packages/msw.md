# @typeact/msw

> Typed [MSW](https://mswjs.io) integration for typeact Contracts — `fromContract`.

`@typeact/msw` generates MSW request handlers directly from a Contract. Your mocks
share the same types — and the same input validation — as your real client and
server, so they stay consistent as the Contract evolves.

## Installation

```bash
pnpm add -D @typeact/msw msw
pnpm add @typeact/core
```

## `fromContract`

Handlers are a **path → method** map (mirroring Route identity), each
`({ input, request?, cookies? }) => Result | HttpResponse`. `input` is pre-validated
(`InferOutput`); `request`/`cookies` are the native MSW values.

```ts
import { setupServer } from "msw/node";
import { HttpResponse } from "msw";
import { fromContract } from "@typeact/msw";
import { contract } from "./contract";

export const server = setupServer(
  ...fromContract(contract, {
    "/users/:id": {
      get: ({ input }) => {
        if (input.path.id === "0") {
          return { error: { code: "USER_NOT_FOUND", message: "…" }, status: 404 };
        }
        return { ok: { id: input.path.id, name: "Alice" } };
      },
    },
    "/users": {
      post: ({ input }) => ({ ok: { id: "2", ...input.body }, status: 201 }),
    },
  }),
);
```

## Two return paths

- **`Result`** — serialized per the Contract (`{ ok, status? }` → status + JSON;
  `{ error, status }` → status + body, typed if declared via `.error()`). Not
  re-validated by default — trusted by its type.
- **`HttpResponse`** — a raw escape hatch, returned verbatim, for MSW-specific
  features (`delay`, custom headers, non-JSON bodies, streaming, simulated network
  errors, `passthrough()`). It bypasses only the _response_ side.

## Input validation

Just like `@typeact/hono`, `input` is validated **before** the handler runs — invalid
input auto-`400`s and the handler is skipped. A mock rejects exactly what the real
server rejects. (To mock a server that _wrongly accepts_ invalid input, use a plain
MSW `http.*` handler outside `fromContract`.)

## Environments

The generated `HttpHandler[]` works anywhere MSW does — `setupServer` (node/vitest),
`setupWorker` (browser/Storybook), and Playwright/Cypress via MSW's interceptors:

```ts
import { setupWorker } from "msw/browser";
export const worker = setupWorker(...fromContract(contract, handlers));
```
