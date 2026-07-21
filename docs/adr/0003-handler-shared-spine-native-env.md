# Handlers share a spine but not an environment

Every typeact Handler (hono and msw) is a single-argument function `(arg) => Result` whose `arg.input` is always the pre-validated `InferOutput` Input. That shared spine is the whole cross-package promise: learn one Handler, read the other. Past `input`, the argument exposes the **native, unwrapped** framework handle — hono hands you the real `context` (`c`), msw hands you the real `request`/`cookies`.

We deliberately do **not** introduce a unified `context` abstraction over both frameworks. A common wrapper would be a lowest-common-denominator shim that hides the parts of each framework people actually reach for, and would be a permanent maintenance burden. The honest promise is narrow: the arg shape and `input` are shared; everything else is your framework, native. The accepted cost is that handler bodies are not copy-pasteable between hono and msw.
