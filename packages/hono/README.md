# `@typeact/hono`

The typed [Hono](https://hono.dev) server integration for typeact Contracts —
`registerRoutes(app, contract, handlers)`. Handlers are keyed path→method and
receive a pre-validated `input` plus the native Hono `context`.

```bash
vp install @typeact/hono @typeact/core
```

Requires `hono` ^4 as a peer dependency.

📖 **Full documentation:** [`apps/website/packages/hono.md`](../../apps/website/packages/hono.md)

This README is intentionally a stub. All API reference and examples live in the
website, which is the single source of doc truth (see [ADR-0006](../../docs/adr/0006-docs-single-source-type-checked.md)).
