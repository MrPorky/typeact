<!--VITE PLUS START-->

# `@typeact/core` — Contract Definition Language

The core package defines the contract language: route builders (`createRoute.get()`, `.post()`, etc.), `createContract`, path utilities, and `InferRoute`. All other `@typeact/*` packages consume this as a dependency.

## Coding Standards

- **100% type safety** — no `as` casts anywhere. Use `as const` for literal inference. Use `as never` only in exhaustive switch defaults.
- **No `any`** — if you're unsure, use `unknown` and narrow with type guards or standard-schema validation.
- **`@standard-schema/spec`** is the only hard runtime dependency. All validation flows through standard-schema-compatible validators (Zod, Valibot, ArkType).
- **strict TypeScript** — `strict: true`, `noUnusedLocals: true`, `verbatimModuleSyntax: true` in tsconfig.
- **Barrel exports** from `src/index.ts`. Internal modules go in `src/internal/`.

## Package Anatomy

| Entry  | Path                              |
| ------ | --------------------------------- |
| Main   | `src/index.ts`                    |
| Tests  | `tests/`                          |
| Config | `vite.config.ts`, `tsconfig.json` |

## Dependencies

- **Runtime**: `@standard-schema/spec` ^1.0.0
- **Dev**: typescript, vite-plus (build/test/lint)

## Review Checklist

- [ ] Run `vp check` and `vp test` before committing.
- [ ] No `as` casts in new code (except `as const` and exhaustive `as never`).
- [ ] Public API is fully typed with no `any` leakage.
- [ ] Path utilities are runtime-safe (no assumptions about input format).
- [ ] `createContract` and route builders accept standard-schema-compatible validators.

<!--VITE PLUS END-->
