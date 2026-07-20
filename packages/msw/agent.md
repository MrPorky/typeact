<!--VITE PLUS START-->

# `@typeact/msw` — MSW Integration for Contracts

Typed bridge from `@typeact` Contracts to MSW handlers. `fromContract(contract, handlers)` returns `HttpHandler[]` for use with MSW in any environment: vitest, Playwright, Cypress, Storybook, or browser.

## Coding Standards

- **100% type safety** — no `as` casts anywhere. Use `as const` for literal inference. Use `as never` only in exhaustive switch defaults.
- **No `any`** — if you're unsure, use `unknown` and narrow with type guards or standard-schema validation.
- **Handler shape**: `({ input, request?, cookies? }) => Result | HttpResponse` — input pre-validated against Contract (param, query, body, form). Raw `HttpResponse` escape hatch for MSW-specific features.
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
- **Peer**: `msw` ^2
- **Dev**: `msw` ^2, typescript, vite-plus

## API Surface

- `fromContract(contract, routeMap)` — path-keyed route-config map in, `HttpHandler[]` out
- Input pre-validated against Contract (param, query, body, form)
- Raw `HttpResponse` escape hatch for MSW-specific features (cookies, redirects, delayed responses)
- No assertion utilities in v1

## Review Checklist

- [ ] Run `vp check` and `vp test` before committing.
- [ ] No `as` casts in new code (except `as const` and exhaustive `as never`).
- [ ] Handlers receive pre-validated input — no manual validation in user code.
- [ ] Works across MSW environments (node, jsdom, browser).
- [ ] `warnOverlappingPaths()` utility (shared via core) is used where appropriate.

<!--VITE PLUS END-->
