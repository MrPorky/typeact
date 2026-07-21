# Zero-cast is CI-enforced; core owns the standard-schema surface

Type safety is typeact's whole value proposition, so the zero-cast policy is a build gate, not a guideline. `vp check` (oxlint) enforces it:

- `no-explicit-any` — `any` is banned; use `unknown` and narrow with the Route's own validators (from the Contract) where possible, otherwise type guards.
- [`consistent-type-assertions`](https://oxc.rs/docs/guide/usage/linter/rules/typescript/consistent-type-assertions.html) — type assertions (`as`) are banned, with a narrow allowlist for `as const` (literal inference) and `as never` (exhaustive-switch defaults).

A stray cast or `any` fails CI. This turns the policy from prose (which gets violated on the first busy afternoon) into an enforced invariant.

`@typeact/core` is the **sole standard-schema surface**. Core depends on `@standard-schema/spec` and **re-exports it**; every downstream package (`api`, `hono`, `msw`) imports standard-schema types from `@typeact/core`, never depending on `@standard-schema/spec` directly. One package owns that dependency and its version, so the whole ecosystem can never disagree on the spec version. Framework packages still peer-dep their own framework (`hono`, `msw`).
