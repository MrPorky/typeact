<!--VITE PLUS START-->

# `@typeact/hono` — Typed Hono Integration

Thin typed wrapper around Hono routing. `registerRoutes(app, contract, handlers)` registers typed HTTP routes from a Contract. Supports regular HTTP handlers (Result-based), SSE (auto-framing via `streamSSE`), NDJSON/Binary/Text streams (auto-encoding via `stream`/`streamText`), and WebSocket lifecycle handlers.

## Coding Standards

- **100% type safety** — no `as` casts anywhere. Use `as const` for literal inference. Use `as never` only in exhaustive switch defaults.
- **No `any`** — if you're unsure, use `unknown` and narrow with type guards or standard-schema validation.
- **Handler shape**: `({ context, input }) => Result` — single destructured param, `context` is Hono `c`, `input` pre-validated.
- **Validation** via standard-schema built-in middleware.
- **strict TypeScript** — `strict: true`, `noUnusedLocals: true`, `verbatimModuleSyntax: true` in tsconfig.
- **Barrel exports** from `src/index.ts`. Internal modules go in `src/internal/`.

## Package Anatomy

| Entry  | Path                              |
| ------ | --------------------------------- |
| Main   | `src/index.ts`                    |
| Tests  | `tests/`                          |
| Config | `vite.config.ts`, `tsconfig.json` |

## Dependencies

- **Runtime**: `@typeact/core` (workspace)
- **Peer**: `hono` ^4
- **Dev**: `hono` ^4, typescript, vite-plus

## API Surface

- `registerRoutes(app, contract, handlers)` — register typed HTTP routes
- SSE handlers (auto-framing via `streamSSE`)
- NDJSON/Binary/Text stream handlers (auto-encoding)
- WebSocket lifecycle handlers (via optional `upgradeWebSocket` option)

## Review Checklist

- [ ] Run `vp check` and `vp test` before committing.
- [ ] No `as` casts in new code (except `as const` and exhaustive `as never`).
- [ ] Handlers are fully typed — `c` (Hono context) and pre-validated `input`.
- [ ] SSE/stream/WS handlers correctly use Hono's streaming primitives.
- [ ] Error responses use standard `Result` union shape.

<!--VITE PLUS END-->
