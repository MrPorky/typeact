# website

Documentation site for **typeact**, built with [VitePress](https://vitepress.dev).

## Development

```bash
# from the repo root
vp run website#dev

# or from this directory
vp run dev
```

The site is served at http://localhost:5173.

## Build

```bash
vp run website#build
vp run website#preview
```

## Structure

```
apps/website
├── .vitepress/
│   └── config.ts        # site config, nav, sidebar
├── index.md             # home page
├── guide/               # getting-started guide
└── packages/            # per-package reference
```
