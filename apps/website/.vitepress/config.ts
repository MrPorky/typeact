import { defineConfig } from "vitepress";

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "typeact",
  description:
    "End-to-end typed contracts for the web — define once, share client, server, and mocks.",
  cleanUrls: true,
  lastUpdated: true,
  srcExclude: ["README.md"],

  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: "Guide", link: "/guide/introduction" },
      { text: "Packages", link: "/packages/core" },
    ],

    sidebar: {
      "/guide/": [
        {
          text: "Getting Started",
          items: [
            { text: "Introduction", link: "/guide/introduction" },
            { text: "Installation", link: "/guide/installation" },
            { text: "Quick Start", link: "/guide/quick-start" },
          ],
        },
      ],
      "/packages/": [
        {
          text: "Packages",
          items: [
            { text: "@typeact/core", link: "/packages/core" },
            { text: "@typeact/api", link: "/packages/api" },
            { text: "@typeact/hono", link: "/packages/hono" },
            { text: "@typeact/msw", link: "/packages/msw" },
          ],
        },
      ],
    },

    socialLinks: [{ icon: "github", link: "https://github.com/typeact/typeact" }],

    search: {
      provider: "local",
    },

    footer: {
      message: "Released under the MIT License.",
      copyright: "Copyright © 2025 typeact contributors",
    },
  },
});
