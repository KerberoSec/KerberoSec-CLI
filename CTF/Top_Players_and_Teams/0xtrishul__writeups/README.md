# trishul // writeups

Static writeups blog built with [Astro](https://astro.build), styled to match
`trishul.re` (JetBrains Mono, `#0d0d0d`, `#9e1d1d`).

## Run locally

```bash
npm install
npm run dev      # http://localhost:4321
```

```bash
npm run build    # outputs to ./dist
npm run preview  # serve the built site
```

## Add a writeup

Drop a Markdown file in `src/content/writeups/`. The filename becomes the URL
slug (`biscuit.md` → `/writeups/biscuit/`). Required frontmatter:

```markdown
---
title: "Post title"
description: "One-line summary shown on the index."
date: 2026-07-09
platform: "HackingClub"        # optional
tags: ["web", "rfi", "privesc"]
draft: false                   # true = hidden from index and build
---

Your writeup in Markdown...
```

The schema is enforced in `src/content.config.ts`: if the frontmatter doesn't
match, the build fails with a clear error (that's the point).

## Deploy to GitHub Pages (writeups.trishul.re)

1. Push this repo to GitHub.
2. In repo Settings → Pages, set source to **GitHub Actions** and use the
   Astro deploy workflow (`withastro/action`), or build and push `dist/` to a
   `gh-pages` branch.
3. `public/CNAME` already contains `writeups.trishul.re`: it ships in the build.
4. In Cloudflare, add a `CNAME` record `writeups` → `0xtrishul.github.io`, and keep
   SSL/TLS mode on **Full** (Flexible causes redirect loops in front of Pages).

## Structure

```
src/
├── content.config.ts          content collection schema
├── content/writeups/*.md       the posts
├── layouts/BaseLayout.astro    head, fonts, footer
├── pages/
│   ├── index.astro             the writeups index
│   ├── writeups/[...slug].astro post page
│   └── rss.xml.js              feed
└── styles/terminal.css         the whole look
```
