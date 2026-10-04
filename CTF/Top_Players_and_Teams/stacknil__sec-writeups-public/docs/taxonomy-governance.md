# Taxonomy Governance

Date: 2026-03-27

## Summary

This document defines the ongoing update rules for taxonomy changes after closure.

Use it together with:

* [docs/taxonomy-closure.md](taxonomy-closure.md) for the current converged state
* [docs/taxonomy-decision-log.md](taxonomy-decision-log.md) for the decisions that shaped the current taxonomy

## Canonical Source

* `schemas/taxonomy.json` is the canonical taxonomy source for `domain`, `skills`, and `artifacts`.
* `TryHackMe/_meta/TAGS.md` is a derived reference document generated from `schemas/taxonomy.json`.
* Do not edit `TryHackMe/_meta/TAGS.md` by hand. Manual edits will be overwritten the next time the renderer runs.

## Why This Split Exists

* `taxonomy.json` is the machine-readable source used by validation and automation.
* `TAGS.md` is the human-readable reference for maintainers who want to browse the available vocabulary quickly.
* Keeping `taxonomy.json` canonical removes drift between the documented tag list and the enforced schema.

## Safe Update Workflow

1. Edit `schemas/taxonomy.json`.
2. Keep values lowercase, stable, and hyphenated.
3. Prefer adding an alias when renaming a value that may already exist in notes.
4. Run `python scripts/render_tags_doc.py` to regenerate `TryHackMe/_meta/TAGS.md`.
5. Run `python scripts/render_tags_doc.py --check` if you want a quick freshness check in automation or CI.
6. Run `python scripts/check_markdown.py` to confirm existing notes still validate against the updated taxonomy.
7. If the taxonomy change is meant to normalize existing notes, update notes in a separate change so taxonomy governance stays easy to review.

## Update Guidelines

* Add a new canonical value only when an existing value cannot describe the note accurately enough.
* Avoid introducing near-duplicates such as singular/plural variants or broad/narrow pairs without a clear reason.
* Use aliases for backwards compatibility when migrating from an older value to a newer canonical value.
* Remove a canonical value only after checking whether notes still depend on it and whether an alias is needed for a transition period.

## Review Checklist

* Does the new value improve retrieval or analysis enough to justify expanding the vocabulary?
* Is the value the right field: `domain`, `skills`, or `artifacts`?
* Can an existing canonical value express the same meaning?
* If this is a rename, did you add an alias and regenerate `TAGS.md`?
* Did you re-run validation after the change?
