---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

hero:
  name: "typeact"
  text: "End-to-end typed contracts for the web"
  tagline: Define a contract once, then share a typed fetch client, a Hono server, and MSW mocks — all from a single source of truth.
  actions:
    - theme: brand
      text: Get Started
      link: /guide/introduction
    - theme: alt
      text: Packages
      link: /packages/core

features:
  - title: Contract-first
    details: Describe routes, params, and payloads once with @typeact/core. Types flow everywhere else automatically.
  - title: Typed client
    details: "@typeact/api gives you a fully typed fetch client with Result handling and SSE / WS / stream support."
  - title: Server integration
    details: "@typeact/hono registers your contract routes on a Hono app with full inference — no drift between client and server."
  - title: First-class mocks
    details: "@typeact/msw turns a contract straight into typed MSW request handlers for tests and local development."
---
