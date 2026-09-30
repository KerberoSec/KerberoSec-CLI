# Sanitization Checklist

Use this checklist before publishing any public note or sanitized write-up.

## Quick Pass

Before you publish, confirm all of the following:

1. The source material is authorized for public release.
2. The note uses the public-safe structure from [templates/writeup_sanitized.md](templates/writeup_sanitized.md), or is brought close to that standard.
3. Live identifiers are replaced with canonical placeholders from [docs/placeholder-policy.md](docs/placeholder-policy.md).
4. Secrets, tokens, flags, session material, and nonessential sensitive evidence are removed or neutralized.
5. The note preserves technical meaning and defensive value without publishing a full exploit chain.
6. Front matter follows the taxonomy rules described in [docs/taxonomy-closure.md](docs/taxonomy-closure.md).
7. The note passes the required local validation checks.
8. A final human review finds no names, IPs, URLs, hostnames, screenshots, attachments, or pasted output that should remain private.

## Required Local Checks

```text
python scripts/render_tags_doc.py --check
python scripts/check_placeholders.py <changed files>
python scripts/check_markdown.py
python -m pre_commit run --files <changed files>
```

## Stop Conditions

Stop and resolve governance first if:

- you think a new placeholder is needed
- you are about to introduce a new taxonomy value
- the note still depends on private evidence to make sense
- the content only works as a step-by-step attack recipe

When that happens, use:

- [docs/placeholder-closure.md](docs/placeholder-closure.md)
- [docs/taxonomy-closure.md](docs/taxonomy-closure.md)
- [docs/publication-workflow.md](docs/publication-workflow.md)
