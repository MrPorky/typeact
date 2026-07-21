# Routes carry both `InferInput` and `InferOutput` of each facet

A standard-schema validator is a _parser_, not just an assertion: `z.string().default('test')`, `z.coerce.number()`, and `.transform(...)` change the value. So every facet has two types — `InferInput` (what may be passed; defaults optional, pre-coercion) and `InferOutput` (what comes out; defaults applied, coerced). The inferred Route type keeps **both** sides, and each consumer reads from the correct one:

- **api call-site argument** uses `InferInput` — so `z.string().default('test')` makes that field optional at the call site.
- The client **runs the input validators** to produce `InferOutput`, and that transformed value is what is serialized onto the wire (query / JSON body / form). Running them is required for transformation, not trust — otherwise defaults never fill in and coercions never happen.
- **hono/msw handler `input`** uses `InferOutput` — the server re-parses the raw request; defaults are already applied and values coerced.

Validation runs at trust boundaries in the direction data crosses them: server validates inbound Input (short-circuit `400` with `issues` before the handler), client validates inbound Response (feeds the `response-validation` error arm). Outbound data is otherwise trusted by its types — the one exception is the client running input validators for _transformation_ as above (a parse failure there is the `input-validation` error arm).

## Considered Options

- **Carry only one side per facet.** Rejected: a single type either breaks the call-site (defaults become required) or breaks the handler (defaults appear optional), and papering over the gap requires casts — banned by the zero-cast policy.
