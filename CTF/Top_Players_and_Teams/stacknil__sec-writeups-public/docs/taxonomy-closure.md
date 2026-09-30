# Taxonomy Closure

Date: 2026-03-18

## Summary

The taxonomy governance track for the public repo is now closed in a converged state.

Current source of truth:

* canonical taxonomy source: `schemas/taxonomy.json`
* derived taxonomy reference: `TryHackMe/_meta/TAGS.md`
* enforcement path: `python scripts/check_markdown.py` plus `python scripts/render_tags_doc.py --check`

## Canonical Sources

* `schemas/taxonomy.json` is the canonical taxonomy source.
* `TryHackMe/_meta/TAGS.md` is derived from `schemas/taxonomy.json`.
* Active-note front matter is converged with the schema.

## Workflow For Future Changes

1. Update taxonomy decisions in `docs/taxonomy-decision-log.md`.
2. Update `schemas/taxonomy.json` if new canonical values or alias mappings are needed.
3. Regenerate and verify `TryHackMe/_meta/TAGS.md`.
4. Update active-note front matter to match the schema and canonical values.
5. Prune deprecated aliases once they have zero live consumers.
6. Run changed-files validation (schema, TAGS, and any edited notes).

## Cross-References

* `docs/taxonomy-decision-log.md`
* `docs/taxonomy-convergence-audit.md`
* `docs/taxonomy-execution-backlog.md`
