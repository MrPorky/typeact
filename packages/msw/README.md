# `@typeact/msw`

The typed [MSW](https://mswjs.io) mock integration for typeact Contracts —
`fromContract(contract, handlers)` returns `HttpHandler[]`. Handlers are keyed
path→method, receive a pre-validated `input`, and may return a `Result` or drop to
a raw `HttpResponse` escape hatch.

```bash
vp install @typeact/msw @typeact/core
```

Requires `msw` ^2 as a peer dependency.

📖 **Full documentation:** [`apps/website/packages/msw.md`](../../apps/website/packages/msw.md)

This README is intentionally a stub. All API reference and examples live in the
website, which is the single source of doc truth (see [ADR-0006](../../docs/adr/0006-docs-single-source-type-checked.md)).
