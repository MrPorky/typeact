# kitchen-sink: two test tiers over one contract

The `kitchen-sink` app is the integration proof that all four packages derive from a single `@typeact/core` contract and stay in sync. It uses every package in its natural place:

- **core** — one `src/contract.ts`, the single source of truth imported by every layer.
- **hono** — `registerRoutes` mounted as the TanStack Start server route handler; handlers backed by the real Drizzle db.
- **api** — `createClient` in the React frontend, wired into TanStack Query.
- **msw** — `fromContract` mocks the _same_ contract in Storybook and browser tests.

Automated tests run in two tiers, both deriving from the one contract so they cannot drift:

- **msw-mocked tier** (fast, no backend) — Storybook stories, vitest-browser component tests, and Playwright E2E with msw intercepting at the browser boundary. Exercises core + api + msw + frontend.
- **unmocked tier** (one real path) — a small Playwright/vitest suite that boots the real hono server against a throwaway Drizzle db and drives the UI with **no msw**. Exercises core + api + hono + db end to end.

We keep the unmocked tier deliberately (not msw-only) because msw-only would leave the real frontend→api→hono→db path untested: a wiring bug (wrong base URL, query-string serialization mismatch, db-to-response mapping) would pass every mocked test yet break at the real boundary. The unmocked tier proves the seam; the mocked tier proves the mock path; together they prove both claims typeact makes.
