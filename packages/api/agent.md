<!--VITE PLUS START-->

# `@typeact/api` — Typed Fetch Client

Typed fetch client for `@typeact` contracts. `createClient(contract, options)` returns a typed client with `.get()`, `.post()`, etc. methods that return a `Result` discriminated union. Includes SSE/WS/stream support via `onEvent` for consuming typed streams.

## Coding Standards

- **100% type safety** — no `as` casts anywhere. Use `as const` for literal inference. Use `as never` only in exhaustive switch defaults.
- **No `any`** — if you're unsure, use `unknown` and narrow with type guards or standard-schema validation.
- **Result type** is a discriminated union: `{ ok: T, status?: number } | { error: unknown, status: number }`.
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
- **Dev**: typescript, vite-plus

## API Surface

- `createClient(contract, options)` → client with typed methods
- `Result<T>` — discriminated union for responses
- `onEvent(response)` — consume typed SSE `AsyncIterable` streams
- URL builder, slot resolver, interceptor pipeline (internal)

## Review Checklist

- [ ] Run `vp check` and `vp test` before committing.
- [ ] No `as` casts in new code (except `as const` and exhaustive `as never`).
- [ ] Fetch client handles network errors gracefully (no throw unless `.orThrow()`).
- [ ] Response validation uses standard-schema.
- [ ] SSE/WS/stream clients are correctly typed with proper async iteration.

<!--VITE PLUS END-->
