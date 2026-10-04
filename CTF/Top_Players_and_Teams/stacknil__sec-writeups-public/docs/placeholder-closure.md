# Placeholder Closure

Date: 2026-03-27

## Summary

The placeholder governance track for the public repo is now closed in a converged state.

Current source of truth:

* Canonical placeholder source: [docs/placeholder-policy.md](placeholder-policy.md)
* Enforcement checker: `scripts/check_placeholders.py`
* Triage / historical decision support:
* [docs/placeholder-convergence-audit.md](placeholder-convergence-audit.md)
* [docs/placeholder-execution-backlog.md](placeholder-execution-backlog.md)
* [docs/placeholder-false-positive-triage.md](placeholder-false-positive-triage.md)
* [docs/placeholder-policy-expansion.md](placeholder-policy-expansion.md)

## Canonical Placeholder Source

[docs/placeholder-policy.md](placeholder-policy.md)
is the canonical placeholder source for public writeups in this repository.

That document defines:

* the approved semantic placeholder set
* the approved neutral redaction set
* deprecated placeholder styles and preferred migrations
* literal identifiers that should stay literal

Templates and future public notes should use that policy directly instead of inventing local placeholder variants.

## Checker And Audit Workflow

Changed-files enforcement:

* Run `python scripts/check_placeholders.py <changed files>` for materially edited active public notes.

Full-repo audit:

* Run `python scripts/check_placeholders.py --report reports/placeholder-audit.txt`
* Review the generated audit report for any remaining noncanonical placeholders or newly surfaced false positives.

Supporting validation:

* Run `python scripts/check_markdown.py`
* Run `python scripts/render_tags_doc.py --check`
* Run `python -m pre_commit run --files <changed files>`

## Current Baseline

The current active-note baseline is converged.

As of the current closure state:

* the placeholder checker passes on the active public-note corpus
* the latest full audit reports: `All placeholder checks passed for 111 Markdown file(s).`
* the reusable sanitized template now points maintainers to the canonical policy and checker workflow

## Future Process For New Placeholders

If a future public note appears to need a placeholder that is not already covered:

1. Confirm the note cannot be expressed with the existing canonical placeholder set.
2. Record the case in the relevant audit/triage docs first.
3. Decide whether the token is:
   * a new canonical semantic placeholder
   * a neutral redaction placeholder
   * an explicit exempt literal that should stay literal
4. Update [docs/placeholder-policy.md](placeholder-policy.md) before editing notes to use the new form.
5. Update `scripts/check_placeholders.py` only if enforcement or exemptions must change.
6. Re-run changed-files validation and, when policy/checker behavior changes, re-run the full placeholder audit.

## Maintainer Note

Public writeups should not introduce:

* platform-branded placeholder aliases
* ad hoc story-themed placeholder names
* generic uppercase placeholder tokens when a semantic canonical token already exists

When in doubt, prefer the current policy over note-local creativity.
