# `orThrow` throws a typed `TypeactError`, not the bare failure

A client call returns an **`EndpointCall<T>`** — a `PromiseLike<Result<T>>` that also
exposes `.orThrow(): Promise<T>`. So both styles are one call away:

```ts
const r = await client.get("/users/:id", { path: { id } }); // Result — handle error inline
const user = await client.get("/users/:id", { path: { id } }).orThrow(); // ok value, throws on failure
```

`orThrow` runs the full interceptor pipeline first and throws only the error that
would have _propagated_ (after any `retry()`/`passthrough()`).

What it throws is a **`TypeactError extends Error`** whose `.failure` property is the
same discriminated failure union the `Result` `error` arm carries. It does **not**
throw the bare union object.

We chose the wrapper over throwing `result.error` directly because in a zero-cast
project `catch` is `unknown` regardless, so the only question is what is most
narrow-able and tooling-friendly. A branded `Error` subclass wins on every axis
except literal brevity: it carries a stack trace, satisfies `instanceof Error`
(so loggers, error boundaries, and crash reporters that special-case `Error`
handle it correctly), narrows cleanly via `instanceof TypeactError` to the typed
`.failure`, and can summarize in `.message` (`"http 404 GET /users/:id"`). A bare
POJO throw has no stack, fails `instanceof Error`, and still needs hand-narrowing.
