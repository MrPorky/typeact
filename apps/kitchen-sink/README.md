# Kitchen Sink — `@typeact` Demo App

A full-stack demo application showcasing `@typeact/*` packages integrated with [TanStack Start](https://tanstack.com/start), [Hono](https://hono.dev/), [MSW](https://mswjs.io/), and other modern web tooling.

## Stack

- **Frontend**: React, TanStack Router, TanStack Query, Tailwind CSS
- **Backend**: Hono via TanStack Start server functions
- **API contracts**: `@typeact/core` + `@typeact/api` (typed fetch client)
- **Route handlers**: `@typeact/hono` (typed Hono integration)
- **Mocking**: `@typeact/msw` (typed MSW handlers from Contract)
- **Database**: SQLite via Drizzle ORM + better-sqlite3
- **Toolchain**: Vite+ (vite, vitest, oxlint, oxfmt, tsdown)

## Getting Started

```bash
vp install
vp run dev
```

## Development

```bash
vp dev              # Start dev server
vp test             # Run tests
vp check            # Lint, format, type-check
vp build            # Production build
```

## Project Structure

```
apps/kitchen-sink/
├── src/
│   ├── routes/         # TanStack file-based routes
│   ├── integrations/   # Integration wrappers (tanstack-query, etc.)
│   ├── db/             # Database schema and migrations
│   └── styles.css      # Global styles
├── drizzle/            # Drizzle schema files
└── vite.config.ts      # Vite+ configuration
```

## Environment Variables

See `.env.example` for required environment variables.

## Learn More

- [TanStack Start](https://tanstack.com/start)
- [Hono](https://hono.dev/)
- [MSW](https://mswjs.io/)
- [Drizzle ORM](https://orm.drizzle.team/)
- [Tailwind CSS](https://tailwindcss.com/)
