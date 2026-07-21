# URL query encoding: flat for primitives, JSON-per-param for objects

Query strings have no canonical encoding for nested data, but typeact owns **both
ends** — core builds the URL on the client and parses it back on the server
(hono/msw) — so the encode/decode pair can never drift. That makes structured
query data safe to support:

- **Primitives and arrays of primitives** → flat, repeated keys: `?tag=a&tag=b&page=2`.
- **An object field (or array-of-objects)** → **URL-encoded JSON in that one param**:
  `filter=%7B%22status%22%3A%22active%22%7D`. Core encodes on the client and does
  the exact inverse on the server before handing `input.query` to the handler.
- **`undefined` is stripped** to keep URLs lean — top-level keys whose value is
  `undefined` are omitted, and `JSON.stringify` drops `undefined` object
  properties for free. An absent key lets the server schema's default fill in
  (see ADR-0002). **`null` is preserved** as an intentional value, distinct from
  "absent".

JSON-per-param round-trips any nesting depth losslessly. Bracket notation
(`filter[status]=active`) was rejected: it is lossy (everything becomes a string,
empty arrays vanish, arrays-of-objects are ambiguous) and would lean on coercion
schemas to survive the round-trip. JSON-per-param is uglier in the address bar but
unambiguous.

The `createClient` `query.serialize` override breaks this symmetry unless the
server-side parse is overridden to match, so overriding is documented as a
matched pair (both ends or neither). The default needs no override and is
symmetric by construction.
