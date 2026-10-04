# Maintenance Quick Reference

Date: 2026-03-27

Use this page when you want the shortest path from a repo change to the right validation commands.

## Common Cases

### I edited one or more public notes

Run:

```text
python scripts/render_readme_snapshot.py --check
python scripts/render_tags_doc.py --check
python scripts/check_placeholders.py <changed files>
python scripts/check_markdown.py
python -m pre_commit run --files <changed files>
```

Use this for ordinary note edits under `TryHackMe/` or `notes/`.

### I added or removed a tracked note

Refresh the derived repository snapshot first:

```text
python scripts/render_readme_snapshot.py
python scripts/render_readme_snapshot.py --check
```

Then run the ordinary changed-files validation:

```text
python scripts/render_tags_doc.py --check
python scripts/check_placeholders.py <changed files>
python scripts/check_markdown.py
python -m pre_commit run --files <changed files>
```

### I changed taxonomy values or aliases

Regenerate the derived taxonomy doc first:

```text
python scripts/render_tags_doc.py
python scripts/render_tags_doc.py --check
```

Then validate any affected notes:

```text
python scripts/check_markdown.py
python -m pre_commit run --files <changed files>
```

### I want a repo-wide markdownlint checkpoint

Run:

```text
python scripts/generate_markdownlint_debt.py
```

Default local output:

* `reports/markdownlint-debt-current-local.txt`

Tracked-report refresh:

```text
python scripts/generate_markdownlint_debt.py --output reports/markdownlint-debt.txt
```

### I want a repo-wide placeholder audit snapshot

Run:

```text
python scripts/check_placeholders.py --report reports/placeholder-audit.txt
```

## Derived Docs

These files are maintained from other repo state and should not be hand-kept by memory:

| Derived doc | Refresh | Check |
| --- | --- | --- |
| `README.md` snapshot sections | `python scripts/render_readme_snapshot.py` | `python scripts/render_readme_snapshot.py --check` |
| `TryHackMe/_meta/TAGS.md` | `python scripts/render_tags_doc.py` | `python scripts/render_tags_doc.py --check` |

## Rule Of Thumb

If you changed note inventory, taxonomy, or tracked reports, refresh the derived file first and then run the normal validation chain.
