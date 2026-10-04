---
title: 'How to publish a writeup'
description: 'Step-by-step guide to adding a new writeup to the site via GitHub, from the template to going live.'
---

This site is generated from Markdown files stored in this [GitHub
repository](https://github.com/rniedson/writeups_ctf). There's no admin panel: publishing a writeup
means creating (or editing) files, pushing them to GitHub, and letting the automation (GitHub
Actions) handle the rest. Anyone with access to the repository can follow this guide.

## 1. Set up your local environment

Clone the repository (only needed once):

```bash
git clone git@github.com:rniedson/writeups_ctf.git
cd writeups_ctf
npm install
```

Before starting a new writeup, create a branch from an up-to-date `main`:

```bash
git checkout main
git pull
git checkout -b writeup/challenge-name
```

## 2. Duplicate the template

The template files live in [`templates/writeup/`](https://github.com/rniedson/writeups_ctf/tree/main/templates/writeup): `pt.md`, `es.md`, `en.md`, and an empty `imagens/` folder (that Portuguese name stays the same
across all three languages: it's the single folder shared by all three translations). Copy that
whole folder into `src/content/writeups/`, with the event and challenge names in lowercase and
without spaces (the path becomes part of the URL):

```bash
mkdir -p "src/content/writeups/<event-slug>/<challenge-slug>"
cp templates/writeup/pt.md templates/writeup/es.md templates/writeup/en.md \
   "src/content/writeups/<event-slug>/<challenge-slug>/"
cp -r templates/writeup/imagens "src/content/writeups/<event-slug>/<challenge-slug>/"
```

You don't need to fill in all three languages at once: you can publish just `en.md` now and
translate later. Until a translation exists, the site shows the Portuguese version at that route,
with a "translation pending" notice.

## 3. Fill in the frontmatter

Each `.md` file starts with a metadata block between `---`. The template already has a comment
explaining every field: the main ones are:

| Field         | What it is                                                                                                                                               |
| ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `title`       | Title shown on the site                                                                                                                                  |
| `description` | 1-2 sentence summary (shown on the card and when shared)                                                                                                 |
| `event`       | CTF/platform name: becomes the "Organizer" filter                                                                                                       |
| `category`    | `web`, `pwn`, `reverse`, `crypto`, `forensics`, `misc`, `osint` or `hardware`                                                                            |
| `subcategory` | Vulnerability class within the category: free text, e.g. `IDOR`, `XXE`, `SSTI`, `JWT` (optional, becomes the "Subcategory" filter, grouped by category) |
| `difficulty`  | `easy`, `medium` or `hard` (optional)                                                                                                                    |
| `tags`        | Free-form list of topics: become the "Topic" filter                                                                                                     |
| `pubDate`     | Publish date (`YYYY-MM-DD`)                                                                                                                              |
| `author`      | Your name: required field, shows up in the "Author" filter                                                                                              |
| `draft`       | `true` hides the writeup from the site until you flip it to `false`                                                                                      |

> [!IMPORTANT/Invalid frontmatter breaks the build]
> If `category` has a value outside the list, or a required field like `author` is missing, the
> build fails: both locally (`npm run check`) and in the pull request's GitHub Actions run. That's
> how the site guarantees no malformed writeup ever makes it to production.

## 4. Write the content

Everything below the frontmatter is regular Markdown. Some features the site already supports:

- **Callouts**: `> [!NOTE]`, `[!TIP]`, `[!IMPORTANT]`, `[!WARNING]` or `[!CAUTION]` on the first
  line of a blockquote, with an optional custom title (`[!TIP/A title here]`).
- **Code blocks with a language** (` ```json `, ` ```bash `, etc.) automatically get syntax
  highlighting, line numbers, and a copy button.
- **Images** go in the `imagens/` folder next to the `.md` file and are referenced with a relative
  path: `*[Image: alt text]*`: Astro optimizes the file at build time.
- **Downloadable files** (exploit scripts, for example) go in
  `public/writeups/<event>/<challenge>/` and are referenced with an absolute path from the site
  root: `download solve.py`.

## 5. Test locally (recommended)

```bash
npm run dev
```

Open `http://localhost:4321/en/writeups/<event-slug>/<challenge-slug>/` and check the result. Also
run the full validation before submitting:

```bash
npm run check
npm run format
npm run build
```

`npm run format` fixes formatting automatically (Prettier); the other two only check.

## 6. Commit, push, and open a pull request

```bash
git add src/content/writeups/<event-slug>/<challenge-slug>/
git commit -m "Add writeup: <challenge name>"
git push -u origin writeup/challenge-name
```

Open a pull request from your branch to `main` on GitHub. The CI workflow runs `astro check`,
`format:check`, and `build` automatically: if something slips through locally but breaks there, the
PR shows exactly what.

## 7. Merge and automatic publishing

Once the PR is approved and merged into `main`, the `Deploy to GitHub Pages` workflow triggers on
its own and publishes the updated site: no manual step needed. Follow along in the repository's
**Actions** tab; it usually takes under a minute.

---

Questions about the project structure? Check the repository's
[`README.md`](https://github.com/rniedson/writeups_ctf#readme) for more technical details on
architecture, deployment, and the responsible-publication policy.
