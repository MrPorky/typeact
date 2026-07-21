# typeact

**End-to-end typed contracts for the web.** Define an API as a single typed
**Contract** once, then consume that same Contract everywhere — as a typed fetch
client, a Hono server, and MSW mocks. "typeact" = type + contract.

```ts
import { createContract, createRoute } from "@typeact/core";
import { z } from "zod";

export const contract = createContract([
  createRoute.get("/users/:id", {
    input: { path: { id: z.string() } },
    response: z.object({ id: z.string(), name: z.string() }),
  }),
  createRoute
    .post("/users")
    .body(z.object({ name: z.string() }))
    .response(z.object({ id: z.string(), name: z.string() }))
    .error(409, z.object({ code: z.literal("EXISTS") })),
]);
```

Routes are identified by their `(method, path)` pair everywhere — the client,
the server, and the mocks all speak the same address.

## Packages

| Package                            | What it is                                                                    |
| ---------------------------------- | ----------------------------------------------------------------------------- |
| [`@typeact/core`](./packages/core) | Contract definition language — `createRoute`, `createContract`, `InferRoute`. |
| [`@typeact/api`](./packages/api)   | Typed fetch client — `createClient`, `Result`, SSE / stream / WS, `onEvent`.  |
| [`@typeact/hono`](./packages/hono) | Typed Hono server — `registerRoutes`.                                         |
| [`@typeact/msw`](./packages/msw)   | Typed MSW mocks — `fromContract`.                                             |

`@typeact/core` is the only package with a hard dependency (`@standard-schema/spec`,
which it re-exports); the framework packages peer-depend on their framework.

## Design docs

- **[`CONTEXT.md`](./CONTEXT.md)** — the domain glossary (Contract, Route, Input,
  Result, Stream, WsConnection, …). Read this first.
- **[`docs/adr/`](./docs/adr)** — architecture decision records. Every non-obvious
  choice (route identity, the Result taxonomy, streaming model, interceptors,
  query encoding, typed errors, …) is recorded there.
- **[`apps/website`](./apps/website)** — the canonical, user-facing documentation.
- **[`apps/kitchen-sink`](./apps/kitchen-sink)** — a real TanStack Start app that
  uses all four packages against one Contract.

## Project-wide policies

- **Zero casts.** No `any`, no `as` (except `as const` and `as never`) — CI-enforced
  via oxlint. Use `unknown` and narrow with the Contract's validators or type guards.
- **standard-schema everywhere.** Any `@standard-schema/spec` validator works (Zod,
  Valibot, ArkType). Core owns and re-exports the spec; other packages import it from
  core.
- **Docs can't drift.** The website is the single source of doc truth; package
  READMEs are stubs that link to it (see ADR-0006).

## Development

This is a [Vite+](https://viteplus.dev) monorepo (`vp`).

```bash
vp install          # install after pulling
vp run ready        # check + test + build everything
vp run -r test      # run all package tests
vp run dev          # run the docs website
```

Released under the MIT License.
