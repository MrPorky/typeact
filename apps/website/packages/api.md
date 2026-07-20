# @typeact/api

> Typed fetch client for typeact contracts — `createClient`, `Result`, SSE/WS/stream support, `onEvent`.

`@typeact/api` turns a contract into a fully typed fetch client. Every method is
inferred from the contract, so params, query, body, and responses are checked at
compile time.

## Installation

```bash
pnpm add @typeact/api @typeact/core
```

## `createClient`

```ts
import { createClient } from "@typeact/api";
import { contract } from "./contract";

const client = createClient(contract, {
  baseUrl: "https://api.example.com",
  headers: { authorization: "Bearer token" },
});

const result = await client.listPosts({ query: { page: 1 } });
```

## `Result`

Client calls return a `Result` rather than throwing, so success and failure are
part of the type:

```ts
const result = await client.getPost({ params: { id: "1" } });

if (result.ok) {
  console.log(result.data.title);
} else {
  console.error(result.status, result.error);
}
```

## Streaming: SSE, WebSockets, and streams

For routes that stream, the client exposes an event interface via `onEvent`:

```ts
const stream = client.watchPosts();

stream.onEvent((post) => {
  console.log("new post", post.title);
});
```

Server-Sent Events, WebSockets, and raw streaming responses are all supported and
typed from the contract.
