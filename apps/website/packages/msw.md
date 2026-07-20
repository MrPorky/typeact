# @typeact/msw

> MSW integration for typeact contracts — typed request handlers from a `Contract` via `fromContract`.

`@typeact/msw` generates [MSW](https://mswjs.io) request handlers directly from a
contract. Your mocks share the same types as your real client and server, so they
stay consistent as the contract evolves.

## Installation

```bash
pnpm add -D @typeact/msw msw
pnpm add @typeact/core
```

## `fromContract`

```ts
import { setupServer } from "msw/node";
import { fromContract } from "@typeact/msw";
import { contract } from "./contract";

export const server = setupServer(
  ...fromContract(contract, {
    listPosts: ({ query }) => [{ id: "1", title: "Hello" }],
    createPost: ({ body }) => ({ id: "2", title: body.title }),
  }),
);
```

Resolver keys correspond to contract route names, and their arguments and return
values are typed from the contract — the same guarantees you get on the client and
server.

## Browser usage

`fromContract` also works with MSW's browser worker:

```ts
import { setupWorker } from "msw/browser";
import { fromContract } from "@typeact/msw";
import { contract } from "./contract";

export const worker = setupWorker(
  ...fromContract(contract, {
    listPosts: () => [{ id: "1", title: "Hello" }],
  }),
);
```
