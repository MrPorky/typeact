# msw: faithful input validation, response-side escape hatch

`fromContract(contract, handlerMap)` turns a Contract into `HttpHandler[]`.
Handlers are keyed path→method (ADR-0008) and take the shared spine
`({ input, request?, cookies? }) => Result | HttpResponse` (ADR-0003: `input`
pre-validated, native msw `request`/`cookies`).

**Input validation always runs, before the handler, regardless of return path.**
msw must parse the raw request (query string, JSON body, form) against the schemas
just to hand the handler a typed `input` — parsing is load-bearing. Invalid input
short-circuits with an auto-`400` and `issues`, and the handler is never called —
identical to hono (ADR-0007). A mock rejects exactly what the real server rejects.

The two return paths:

- **`Result`** — the typed path. Serialized per contract: `{ ok, status? }` →
  `status ?? 200` + JSON(`ok`); `{ error, status }` → that status + body (typed if
  the status was declared via `.error()`, else raw). **Not** response-validated by
  default — trust the types, matching hono's outbound rule (ADR-0002).
- **`HttpResponse`** — the raw escape hatch, returned verbatim; typeact touches
  nothing. For MSW-specific features the `Result` shape can't express: artificial
  `delay`, non-JSON bodies, arbitrary headers, streaming, simulated network errors,
  `passthrough()` to the real server. It is a **response-side** tool only — it does
  not bypass input validation.

## Consequences

- A typed handler cannot mock a server that _wrongly accepts_ invalid input — the
  auto-400 fires first. For that rare "misbehaving server" test, drop to a plain
  MSW handler (`http.get(...)`) outside `fromContract`, which typeact never touches.
  Typed handlers are faithful mocks; raw MSW handlers are the total bypass.
- No assertion utilities in v1 (per the original scope) — `fromContract` produces
  handlers, nothing more.
