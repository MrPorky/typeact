# Docs live in one place and cannot silently drift

`apps/website` is the single canonical home for all documentation. Every `packages/*/README.md` is reduced to a stub — title, one-paragraph description, install line, and a link to its website page. No API surface, examples, or guides live in a README. This is a direct response to real drift: the same API was written up as a chained builder in a package README and as an object-map on the website, and they disagreed. One authoritative home makes that contradiction structurally impossible.

Documentation is treated as a test, not prose:

- **Every website code sample is type-checked against the real packages in CI** (VitePress twoslash or compiled `.ts` snippets). A sample that uses a stale API fails the build. For a project whose entire pitch is zero-cast type safety, docs that drift from the types would be the worst possible bug — so the docs are compiled.
- **Completeness goal (best-effort):** CI enumerates each package's barrel exports and fails if a public export has no documented, type-checked example. This is aspirational for v1 — pursued where practical, not a hard blocker if the enumeration proves brittle.

## Consequences

- Contributors add features in two places by construction: the code and its website page. A PR that exports a new symbol without a type-checked example is caught (once the completeness check lands).
