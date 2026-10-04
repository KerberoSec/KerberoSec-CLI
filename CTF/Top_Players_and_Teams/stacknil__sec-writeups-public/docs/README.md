# Docs Hub

This folder contains the governance and maintenance documents that keep the public repository consistent over time.

## Use This Folder For

| If you want to... | Open |
| --- | --- |
| publish a sanitized public note | [publication-workflow.md](publication-workflow.md) |
| understand taxonomy rules | [taxonomy-closure.md](taxonomy-closure.md) |
| understand placeholder rules | [placeholder-closure.md](placeholder-closure.md) |
| check current maintenance mode and markdownlint audit commands | [maintenance-checkpoint.md](maintenance-checkpoint.md) |
| grab the shortest maintainer command list | [maintenance-quick-reference.md](maintenance-quick-reference.md) |

## Start Here

- [publication-workflow.md](publication-workflow.md): how to move from private/raw notes to public sanitized notes
- [taxonomy-closure.md](taxonomy-closure.md): canonical taxonomy state and future workflow
- [placeholder-closure.md](placeholder-closure.md): canonical placeholder state and checker workflow
- [repo-sentinel-baseline-review.md](repo-sentinel-baseline-review.md): redacted baseline classification and remote-gate decision record
- [maintenance-checkpoint.md](maintenance-checkpoint.md): current markdownlint maintenance mode, operator commands, and audit baseline
- [maintenance-quick-reference.md](maintenance-quick-reference.md): shortest-path maintainer commands by change type

## Document Types

Use these labels to decide whether a doc is a current operating surface or historical context:

| Type | Meaning |
| --- | --- |
| `Closure` | current converged state and the source-of-truth entry point for that governance track |
| `Policy` / `Governance` | rules that remain active over time |
| `Audit` | point-in-time validation or discovery snapshot |
| `Execution Backlog` / `Plan` / `Triage` | usually historical unless the document explicitly says it is still active |
| `Quick Reference` | shortest-path maintainer commands for recurring tasks |

## Derived Docs

These repository documents are generated or refreshed from other canonical sources:

| Derived doc | Canonical source | Refresh / check |
| --- | --- | --- |
| `TryHackMe/_meta/TAGS.md` | `schemas/taxonomy.json` | `python scripts/render_tags_doc.py` / `python scripts/render_tags_doc.py --check` |
| `README.md` snapshot sections | tracked Markdown files under `TryHackMe/` and `notes/` | `python scripts/render_readme_snapshot.py` / `python scripts/render_readme_snapshot.py --check` |

## Publication And Sanitization

| Document | Purpose |
| --- | --- |
| [placeholder-policy.md](placeholder-policy.md) | canonical placeholder set for public notes |
| [placeholder-convergence-audit.md](placeholder-convergence-audit.md) | audit of placeholder styles found in the repo |

## Taxonomy

| Document | Purpose |
| --- | --- |
| [taxonomy-closure.md](taxonomy-closure.md) | current canonical taxonomy state |
| [taxonomy-convergence-audit.md](taxonomy-convergence-audit.md) | alignment report for front matter, schema, and tags |
| [taxonomy-decision-log.md](taxonomy-decision-log.md) | decision source for taxonomy changes |
| [taxonomy-governance.md](taxonomy-governance.md) | ongoing taxonomy process rules |

## Maintenance

| Document | Purpose |
| --- | --- |
| [maintenance-checkpoint.md](maintenance-checkpoint.md) | current markdownlint maintenance mode, local debt command, and audit baseline |
| [maintenance-quick-reference.md](maintenance-quick-reference.md) | shortest maintainer command recipes for common repo changes |

## Historical Context

These documents are still useful as audit history, but they are not the current execution surface:

| Document | Purpose |
| --- | --- |
| [maintenance-debt-priority.md](maintenance-debt-priority.md) | historical batch-priority plan from the high-debt phase |
| [repo-normalization-audit.md](repo-normalization-audit.md) | early broad normalization audit before taxonomy and placeholder closure |
| [placeholder-execution-backlog.md](placeholder-execution-backlog.md) | historical pass sequencing and remaining-work notes from placeholder convergence |
| [placeholder-false-positive-triage.md](placeholder-false-positive-triage.md) | historical checker triage and exemption decisions used during placeholder closure |
| [placeholder-policy-expansion.md](placeholder-policy-expansion.md) | historical policy-gap review confirming no remaining active add-to-policy cases |
| [taxonomy-execution-backlog.md](taxonomy-execution-backlog.md) | earlier taxonomy backlog model from a now-resolved transition state |
| [taxonomy-normalization-plan.md](taxonomy-normalization-plan.md) | earlier taxonomy drift analysis and planning context before closure and decision-log convergence |
