# Maintenance Debt Priority

Date: 2026-03-27

## Status

This document is now historical reference only.

It records the earlier batch-priority plan from the high-debt phase and is superseded by:

* [docs/maintenance-checkpoint.md](maintenance-checkpoint.md)

Current state on 2026-03-27:

* active-note markdownlint is clean
* tracked repo-wide markdownlint debt is clean
* the prioritized cleanup batches described below are no longer an active backlog

Keep the remainder of this file as historical maintenance context, not as the current execution plan.

## Historical Audit Inputs

This priority list was based on the then-current audit outputs:

* historical markdownlint debt snapshot
* historical placeholder audit snapshot

Historical baseline at planning time:

* the markdownlint debt snapshot showed **1579 markdownlint findings across 84 files** in full-repo debt scope
* The active-note subset accounts for **52 files with findings**.
* The markdownlint debt is dominated by mechanical issues:
  * `MD012` multiple consecutive blank lines
  * `MD007` unordered list indentation
  * `MD022` blanks around headings
  * `MD031` blanks around fenced code blocks
  * `MD032` blanks around lists
* the placeholder audit snapshot was already clean:
  * `All placeholder checks passed for 109 Markdown file(s).`

At that point, the highest-friction maintenance debt was **markdownlint-only**, not placeholder debt.

## Prioritization Logic

The first cleanup batch is intentionally small and operational.

Selection criteria:

1. active notes only
2. currently hot in the working tree
3. high markdownlint finding counts
4. likely to block ordinary changed-files maintenance work
5. mostly mechanical fixes that are low-risk to apply without rewriting meaning

## Proposed First Cleanup Batch

| Rank | File | Why It Is Prioritized | Current debt profile |
| --- | --- | --- | --- |
| 1 | `TryHackMe/10-web/how-the-web-works/02-HTTP-in-detailed.md` | Highest active-note debt count in the repo and already hot in the tree. Likely to keep blocking routine edits until normalized. | 218 findings: `MD012` x208, `MD022` x6, `MD031` x4 |
| 2 | `TryHackMe/00-foundations/intro-cybersecurity/search-skills.md` | Very high debt count, actively touched, and part of a beginner/core path that is likely to be revisited. | 154 findings: `MD012` x147, `MD028` x5, `MD022` x2 |
| 3 | `TryHackMe/30-windows/windows-fundamentals/1.md` | High-count active-note debt in a foundational track that is already hot in the working tree. | 71 findings: `MD012` x69, `MD022` x2 |
| 4 | `TryHackMe/00-foundations/learning-meta/introductory-researching.md` | Frequently touched learning-meta note with concentrated mechanical debt. Also already intersected earlier maintenance work. | 65 findings: `MD012` x63, `MD022` x2 |
| 5 | `TryHackMe/00-foundations/learning-meta/become-a-hacker.md` | Same maintenance cluster as the file above; batching them together reduces context switching. | 55 findings: `MD012` x53, `MD022` x2 |
| 6 | `TryHackMe/40-networking/network-fundamentals/01-what-is-networking.md` | Networking fundamentals are heavily touched, and this file has broader rule variety that can destabilize small edits. | 53 findings: `MD007` x41, `MD031` x4, `MD009` x3, `MD022` x2, `MD032` x2, `MD012` x1 |
| 7 | `TryHackMe/00-foundations/intro-cybersecurity/offensive-security-intro.md` | Lower count than the top six, but still hot and in the same frequently maintained foundations cluster. Good batch efficiency. | 21 findings: `MD007` x15, `MD022` x2, `MD012` x2, `MD031` x1, `MD032` x1 |

## Why These Files First

This batch was chosen because it gives the best mix of:

* highest current lint friction
* overlap with files already being edited
* low-risk mechanical cleanup
* folder-level batching in foundations, intro-cybersecurity, learning-meta, web basics, and networking fundamentals

Just as important, none of these files currently have placeholder debt according to the latest placeholder audit. That keeps the first cleanup batch narrowly focused on markdownlint normalization.

## Debt Shape By File

### Mostly blank-line debt

These are good early wins because the fixes are repetitive and low-risk:

* `TryHackMe/10-web/how-the-web-works/02-HTTP-in-detailed.md`
* `TryHackMe/00-foundations/intro-cybersecurity/search-skills.md`
* `TryHackMe/30-windows/windows-fundamentals/1.md`
* `TryHackMe/00-foundations/learning-meta/introductory-researching.md`
* `TryHackMe/00-foundations/learning-meta/become-a-hacker.md`

Primary rules:

* `MD012`
* `MD022`

### Mixed structural list/fence debt

These need slightly more careful cleanup because the rule mix is broader:

* `TryHackMe/40-networking/network-fundamentals/01-what-is-networking.md`
* `TryHackMe/00-foundations/intro-cybersecurity/offensive-security-intro.md`

Primary rules:

* `MD007`
* `MD031`
* `MD032`
* plus smaller `MD012` / `MD022` cleanup

## Next-Up Candidates After Batch 1

Once the first batch is cleared, the next likely candidates are:

* `TryHackMe/30-windows/windows-fundamentals/2.md`
* `TryHackMe/00-foundations/intro-cybersecurity/defensive-security-intro.md`
* `TryHackMe/10-web/how-the-web-works/01-DNS-in-detail.md`
* `TryHackMe/80-blue-team/jr-analyst-intro/jr-analyst-intro.md`

These are smaller but still hot and would continue the same maintenance lanes with low context-switch cost.
