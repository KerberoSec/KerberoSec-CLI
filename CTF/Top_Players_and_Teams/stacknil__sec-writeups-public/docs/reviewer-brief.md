# Reviewer brief

## Problem

Security notes are often hard to publish safely: they either leak too much, collapse into transcript dumps, or become too inconsistent to reuse as a real knowledge base.

## What it does

`sec-writeups-public` is a public, sanitized pattern library backed by a
security source-note repository with:

- a stable pattern library extracted from supporting source notes
- evidence-bounded links from patterns to related implementations
- a larger TryHackMe-centered source-note corpus
- taxonomy, placeholder, and publication governance
- local checks that keep the public corpus maintainable

## Reviewer Evidence

- Reproducible command: `python scripts/check_pattern_library.py`
- Deterministic outputs: pattern maturity, provenance counts, project links, case-study backlinks, rendered README snapshots, and generated tag docs.
- Provenance boundary: `last_reviewed` is compared with the UTC calendar date and tested with an injected clock.
- Tests / CI: pattern-contract validation, publication checks, placeholder checks, markdown checks, pre-commit hooks, and GitHub Actions workflows.
- Release evidence: stable pattern index, source-note links, governance docs, sanitization checklist, and maintenance checkpoints.
- Non-goals: raw exploit logs, private evidence dumps, live target identifiers, weaponized exploit chains, or unsanitized challenge transcripts.

## Quick run

```bash
python scripts/render_tags_doc.py --check
python scripts/render_readme_snapshot.py --check
python scripts/check_pattern_library.py
python scripts/check_placeholders.py notes/80-blue-team/soc-fundamentals.md
python scripts/check_markdown.py
python -m pre_commit run --files notes/80-blue-team/soc-fundamentals.md
```

## Sample output

The current reviewer-facing metric is:

- `8` stable reusable security patterns
- `10` distinct supporting notes behind those stable patterns
- `13` total cards across stable and reviewed maturity levels

A representative stable card is
`patterns/detection/bounded-correlation.md`, which makes the signal,
false-positive contexts, evidence limits, implementation bridge, and source
notes independently reviewable.

## What this proves

- security writing can be structured like an engineered artifact
- publication safety can be enforced with explicit governance
- source notes can be distilled into stable, reusable security patterns
- pattern maturity and evidence links can be enforced in CI
- reviewer-facing documentation discipline extends beyond code repos

## Safety / boundaries

- authorized labs and training platforms only
- sanitized by default
- no raw private evidence dumps, live identifiers, or weaponized exploit chains
- this is a public knowledge base, not a private red-team notebook

## Limitations

- note quality and depth vary with topic maturity
- this repo is about reusable public artifacts, not raw working logs
- publication safety rules intentionally limit technical detail in some writeups

## Next milestone

Promote reviewed cards only when new evidence or implementation work increases
their decision value; avoid growing the source archive as an end in itself.
The next governance case is the reviewed `repo-sentinel` baseline; its audit
evidence is recorded separately before any remote gate becomes blocking.
