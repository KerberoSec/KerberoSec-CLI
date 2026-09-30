# Maintenance Checkpoint

Date: 2026-03-27

## Current State

The markdownlint maintenance model is now fully converged around two lanes:

* normal day-to-day enforcement through changed-files validation on active notes
* manual repo-wide debt auditing through a dedicated helper script and matching GitHub Actions workflow

Current working state:

* active-note markdownlint is clean
* tracked Markdown repo-wide debt is clean
* the local helper and the remote workflow now use the same core audit path

## Operator Commands

Normal changed-files validation remains:

```text
python scripts/render_readme_snapshot.py --check
python scripts/check_markdown.py
python -m pre_commit run --files <changed files>
```

Manual repo-wide markdownlint debt auditing now uses:

```text
python scripts/generate_markdownlint_debt.py
```

Default output path:

* `reports/markdownlint-debt-current-local.txt`

GitHub Actions still exposes the manual artifact workflow through:

* workflow file: `.github/workflows/markdownlint-debt.yml`
* workflow name: `Markdownlint Debt Audit`
* trigger: `workflow_dispatch`
* artifact/report target: `reports/markdownlint-debt.txt`

## Current Baseline

Current local maintenance baseline on 2026-03-27:

* `python scripts/check_markdown.py` passed for `111` active-note Markdown files
* `python scripts/generate_markdownlint_debt.py` linted `137` tracked Markdown files
* tracked repo-wide result: `Summary: 0 error(s)`

This means the repo is currently clean in both of its intended modes:

* derived README snapshot checks
* active-note changed-files enforcement
* manual tracked-file repo-wide debt audit

## Decision

Effective operating mode:

* keep changed-files lint enforcement as the normal control plane
* perform markdownlint cleanup opportunistically when a file is already being touched
* reserve repo-wide debt auditing for manual checkpoints or maintenance verification

Rationale:

* changed-files enforcement is already in place and is the right default control plane
* the manual debt workflow now has a stable local entry point and matching CI path
* the derived README snapshot is now checked alongside ordinary note maintenance
* local generated debt reports stay out of version control
* repo-wide auditing stays available without turning every note edit into a whole-repo lint exercise

## Practical Notes

Operational details that now matter:

* local/generated debt snapshots are intentionally ignored through `.gitignore`
* the repo-wide helper reads tracked Markdown from `git ls-files`
* the helper works around Windows command-length and quoted-path edge cases automatically
* the helper also avoids the `markdownlint-cli2` config filename limitation by writing a temporary supported config name
* the root README snapshot can be refreshed from tracked-note counts instead of hand-editing note totals

## Follow-up

The intended maintenance loop is now:

1. refresh and verify `README.md` when tracked note inventory changes
2. use changed-files validation during normal editing
3. run `python scripts/generate_markdownlint_debt.py` when a manual repo-wide checkpoint is useful
4. use `Markdownlint Debt Audit` in GitHub Actions when an artifact-backed remote checkpoint is useful
