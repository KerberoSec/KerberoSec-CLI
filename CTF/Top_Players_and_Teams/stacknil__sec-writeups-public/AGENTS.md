# AGENTS.md

## Mission

Normalize and maintain this repository as a local-first canonical knowledge base.

## Hard rules

- Do not rewrite technical meaning.
- Do not invent facts, targets, commands, or results.
- Preserve existing safe-writing placeholders, and use the canonical placeholder set from `docs/placeholder-policy.md` in public writeups.
- Remove empty front matter fields unless required by schema.
- Enforce controlled vocabulary from `schemas/taxonomy.json`; it is the canonical taxonomy source.
- Treat `TryHackMe/_meta/TAGS.md` as a derived document rendered from `schemas/taxonomy.json`.
- Do not invent new tags in notes; update `schemas/taxonomy.json` first if the existing taxonomy cannot express the note accurately.
- Treat blocking markdownlint as changed-files-only for active notes; repo-wide markdownlint belongs to the manual debt audit workflow.
- Prefer small, reviewable commits by category.

## Allowed changes

- Normalize front matter keys/order
- Fix heading hierarchy
- Standardize section order
- Normalize Markdown spacing/list/code fences
- Update internal links and asset paths
- Add missing glossary headings when required by template

## Forbidden changes

- No bulk paraphrase of exploit steps
- No adding screenshots or secrets
- No changing retired/public/private publishing boundary
- No touching archived files unless explicitly requested

## Before finishing

Run:

- python scripts/render_tags_doc.py --check
- python -m unittest discover -s tests -p 'test_*.py'
- python scripts/check_placeholders.py `<changed files>`
- python scripts/check_markdown.py
- python -m pre_commit run --files `<changed files>`
