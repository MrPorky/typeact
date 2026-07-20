# Introduction

**typeact** is a set of small, focused packages for building end-to-end type-safe
HTTP APIs. You describe your API as a _contract_ once, and that single source of
truth drives your client, your server, and your mocks.

## Why contracts?

Most type-safety in web apps stops at the network boundary. The server knows its
own types, the client guesses, and mocks drift out of sync. typeact keeps a single
contract at the center:

```
                ┌─────────────────────┐
                │   @typeact/core     │
                │   (the contract)    │
                └──────────┬──────────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
┌───────▼───────┐  ┌───────▼───────┐  ┌───────▼───────┐
│ @typeact/api  │  │ @typeact/hono │  │ @typeact/msw  │
│ typed client  │  │ typed server  │  │ typed mocks   │
└───────────────┘  └───────────────┘  └───────────────┘
```

## The packages

| Package                           | Responsibility                                                                                |
| --------------------------------- | --------------------------------------------------------------------------------------------- |
| [`@typeact/core`](/packages/core) | Contract definition language — route builder, `createContract`, path utilities, `InferRoute`. |
| [`@typeact/api`](/packages/api)   | Typed fetch client — `createClient`, `Result`, SSE/WS/stream support, `onEvent`.              |
| [`@typeact/hono`](/packages/hono) | Thin typed Hono wrapper — `registerRoutes`, SSE/stream/WS support.                            |
| [`@typeact/msw`](/packages/msw)   | MSW integration — typed request handlers from a contract via `fromContract`.                  |

Continue to [Installation](/guide/installation) to add typeact to your project.
