# Optional typed error responses via `.error(status, schema)`

A Route may declare typed error bodies per HTTP status, repeatable:

```ts
createRoute
  .get("/users/:id")
  .path({ id: z.string() })
  .response(UserSchema)
  .error(404, z.object({ code: z.literal("USER_NOT_FOUND"), message: z.string() }))
  .error(403, z.object({ code: z.literal("NOT_AUTHORIZED"), missingPermission: z.string() }));
```

Object-map equivalent: an `errors: { 404: schema, 403: schema }` record. This is optional — a Route with no `.error(...)` has untyped errors, and success stays the common case.

The declared statuses produce a **status-discriminated** outcome on both sides:

- **Client** — the api `http` error arm narrows per declared status to that schema's type; undeclared statuses fall to `{ status: number; error: unknown }`. Declared error bodies are **validated inbound** (like a Response): a declared status whose body fails its schema is a `response-validation` failure, not the typed arm. Undeclared statuses skip validation.
- **Server** — the hono/msw handler's error arm is **compile-checked** against the declared schema per status: returning `{ status: 404, error: { code: "WRONG" } }` is a type error. Undeclared statuses may still be returned untyped.

This is what makes typed errors type-_safe_, not merely type-_hinted_: the same schema constrains what the server may emit and what the client may observe. It reverses an earlier lean toward deferring typed errors to v2 — the `.error()` chain keeps them opt-in and cheap enough to ship in v1.

## Consequences

- Errors are only fully typed for statuses the author declared. Undeclared statuses remain the one place a caller touches `unknown` and narrows by hand. This is deliberate: authors pay for typing only the errors they care about.
