---
maturity: stable
last_reviewed: 2026-07-05
---

# Repository Baseline Governance

## Signal

What evidence appears?

A committed baseline, allowlist, or suppression file changes the findings that
a repository quality or security check reports.

Common evidence:

* new suppression entries
* removed or stale baseline entries
* changed fingerprints or rule identifiers
* broad path or rule allowlists
* a clean CI result after the baseline changed

## Why it matters

What risk does it suggest?

Baselines preserve reviewed exceptions, but they can also hide new findings or
turn temporary debt into permanent policy. Baseline drift is security-adjacent
code and should remain explicit and reviewable.

## False-positive contexts

When can it be benign?

* a known fixture is intentionally retained
* a finding disappears after the underlying issue is fixed
* paths move without changing the reviewed evidence
* a rule version changes its fingerprint format
* a narrowly scoped exception documents expected generated content

## Evidence limits

What must be present before making a claim?

Show the baseline diff, affected rule, path or fingerprint, current scan
result, suppression scope, and reviewer rationale.

A baseline entry does not prove that a finding is safe. A green check after a
baseline update only proves that current findings were evaluated against the
new suppression state.

## Defensive next step

What should a defender check next?

Compare scans with and without the baseline, classify active, stale,
ambiguous, and unmatched entries, and require an explanation for every added
or broadened suppression.

## Related implementation

[repo-sentinel-lite baseline review guide](https://github.com/stacknil/repo-sentinel-lite/blob/main/docs/baseline-review.md)

## Supporting notes

* [Vulnerability Scanner Overview](../../notes/80-blue-team/vulnerability-scanner-overview.md)
* [Maintenance Checkpoint](../../docs/maintenance-checkpoint.md)
* [Publication Workflow](../../docs/publication-workflow.md)
