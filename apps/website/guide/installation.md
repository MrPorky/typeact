# Installation

Install the packages you need. `@typeact/core` is always required, since it defines
the contract that everything else consumes.

::: code-group

```bash [pnpm]
pnpm add @typeact/core @typeact/api
```

```bash [npm]
npm install @typeact/core @typeact/api
```

```bash [yarn]
yarn add @typeact/core @typeact/api
```

:::

Add the server and mocking integrations as needed:

```bash
# Hono server integration
pnpm add @typeact/hono hono

# MSW mocks (dev dependency)
pnpm add -D @typeact/msw msw
```

## Requirements

- **Node.js** `>= 22.18.0`
- **TypeScript** `>= 5.0` with `strict` mode enabled (recommended)

Next: [Quick Start](/guide/quick-start).
