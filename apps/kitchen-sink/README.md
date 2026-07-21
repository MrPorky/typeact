# Kitchen Sink — the `@typeact` integration app

A real [TanStack Start](https://tanstack.com/start) app that exercises **all four
`@typeact/*` packages against a single Contract**. It is the living proof that the
client, server, and mocks never drift, because they all derive from the same
`src/contract.ts`.

## How the packages fit together

| Package         | Where it lives here                                                               |
| --------------- | --------------------------------------------------------------------------------- |
| `@typeact/core` | `src/contract.ts` — the one Contract, imported by every layer.                    |
| `@typeact/hono` | `registerRoutes` mounted as the TanStack Start server handler, backed by Drizzle. |
| `@typeact/api`  | `createClient` in the React frontend, wired into TanStack Query.                  |
| `@typeact/msw`  | `fromContract` mocks the same Contract in Storybook and tests.                    |

Routes are addressed by `(method, path)` everywhere — the client calls
`client.get("/…")`, the server/mocks key handlers path→method.

## Two test tiers (see [ADR-0005](../../docs/adr/0005-kitchen-sink-two-test-tiers.md))

Both tiers derive from the one Contract, so they cannot drift:

- **msw-mocked tier** — Storybook stories, vitest-browser component tests, and
  Playwright E2E with msw intercepting at the browser boundary. Exercises
  core + api + msw + frontend, no backend needed.
- **unmocked tier** — a small Playwright/vitest suite that boots the real hono
  server against a throwaway Drizzle database with **no msw**. Exercises
  core + api + hono + db end to end, so a wiring bug (base URL, query
  serialization, db→response mapping) can't hide behind a mock.

## Stack

- **Frontend**: React, TanStack Router, TanStack Query, Tailwind CSS
- **Backend**: Hono via TanStack Start server routes + Drizzle ORM (better-sqlite3)
- **Mocks/tests**: MSW, Storybook, vitest-browser, Playwright
- **Toolchain**: Vite+ (vite, vitest, oxlint, oxfmt, tsdown)

## Getting started

```bash
vp install
vp run dev          # start the real app (api ↔ hono ↔ db)
vp test             # run both test tiers
vp check            # lint, format, type-check
vp build            # production build
```

## Project structure

```
apps/kitchen-sink/
├── src/
│   ├── contract.ts     # the single @typeact/core Contract
│   ├── routes/         # TanStack file-based routes (frontend + server handlers)
│   ├── integrations/   # tanstack-query wiring (uses @typeact/api client)
│   ├── stories/        # Storybook stories (mocked via @typeact/msw)
│   ├── db/             # Drizzle schema + client
│   └── styles.css
├── drizzle/
└── vite.config.ts
```

## Learn more

- typeact docs: [`apps/website`](../website)
- [TanStack Start](https://tanstack.com/start) · [Hono](https://hono.dev) ·
  [MSW](https://mswjs.io) · [Drizzle ORM](https://orm.drizzle.team)
