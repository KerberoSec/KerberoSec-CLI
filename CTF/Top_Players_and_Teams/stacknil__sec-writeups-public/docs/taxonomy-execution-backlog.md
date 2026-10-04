# Taxonomy Execution Backlog

Date: 2026-03-27

## Status

This document is now historical reference only.

Its remaining-work model reflected an earlier transition state. The specific residual items described here are no longer present in the live schema, and the active-note corpus currently passes the taxonomy/front matter checks.

For the current taxonomy operating surface, use:

* [docs/taxonomy-closure.md](taxonomy-closure.md)
* [docs/taxonomy-decision-log.md](taxonomy-decision-log.md)
* [docs/taxonomy-governance.md](taxonomy-governance.md)

Keep the remainder of this file as backlog history, not as the current taxonomy execution queue.

## Summary

Based on the current repo state, **11 of 13 taxonomy families appear already executed or fully aligned** with `docs/taxonomy-decision-log.md`.

**Remaining backlog:** `2` families

* **Research And Learning Meta**: active-note front matter still contains drop-as-noise values, so this is the highest-value remaining pass.
* **Networking Fundamentals**: active-note front matter already looks clean, but deprecated aliases still remain in `schemas/taxonomy.json`, so this is a schema-prune cleanup pass.

**Recommended execution order**

1. **Research And Learning Meta**
2. **Networking Fundamentals**

## How This Backlog Was Determined

Each family was compared against the current repo state using three checks:

* whether all `promote-into-taxonomy` values already exist in `schemas/taxonomy.json`,
* whether active-note front matter in `TryHackMe/` and `notes/` still uses deprecated aliases or drop-as-noise values,
* whether deprecated aliases still remain in `schemas/taxonomy.json` after live consumers are removed.

## Already Executed / Aligned Families

These families appear to have no remaining execution work in active-note front matter or the live schema:

* `Identity, Crypto, And Passwords`
* `Governance, Risk, And Security Engineering`
* `Programming And Scripting`
* `Blue Team, Detection, And DFIR`
* `Web And Application Security`
* `Systems And Platform Basics`
* `Data Representation And Transformation`
* `Web Recon And OSINT`
* `Packet Capture And Traffic Analysis`
* `Offensive Tooling And Exploitation`
* `Cloud, IAM, And Containers`

## Remaining Families

| Family | Promote | Merge | Drop | Likely execution type | Why it remains |
| --- | ---: | ---: | ---: | --- | --- |
| `Research And Learning Meta` | 1 | 0 | 3 | `frontmatter-only` | The promoted value (`source-evaluation`) already exists, but drop-as-noise values are still live in active-note front matter and schema. |
| `Networking Fundamentals` | 24 | 2 | 0 | `prune-only` | Promoted values are already present and active-note front matter is already canonical, but deprecated merge aliases still remain in schema. |

## Family Details

### 1. Research And Learning Meta

**Decision-log counts**

* Promote: `1`
* Merge: `0`
* Drop: `3`

**Current state**

* `source-evaluation` is already present in `schemas/taxonomy.json`.
* Drop-as-noise values still appear in active-note front matter:
  * `TryHackMe/00-foundations/intro-cybersecurity/careers-in-cyber.md` uses `role-mapping` and `learning-roadmap`
  * `TryHackMe/00-foundations/intro-cybersecurity/search-skills.md` uses `research`
* Those same drop-as-noise values still remain in `schemas/taxonomy.json`:
  * `learning-roadmap`
  * `research`
  * `role-mapping`

**Expected execution**

* Remove the three drop-as-noise values from active-note front matter.
* Re-scan active notes, templates, scripts, and tests.
* If no live taxonomy consumers remain, prune the three values from `schemas/taxonomy.json`.
* Re-render and verify `TryHackMe/_meta/TAGS.md`.

**Why this should go first**

* It affects live front matter now.
* It removes noise tags that do not improve retrieval.
* The scope is small and likely quick to complete.

### 2. Networking Fundamentals

**Decision-log counts**

* Promote: `24`
* Merge: `2`
* Drop: `0`

**Current state**

* Promoted values already appear to be present in `schemas/taxonomy.json`.
* Active-note front matter already appears to use canonical values.
* The remaining work is schema hygiene around deprecated merge aliases:
  * `firewalling` -> `firewalls`
  * `ping` -> `icmp`
* Those aliases still remain in `schemas/taxonomy.json`, but no active-note front matter consumers were found.

**Expected execution**

* Reconfirm zero live taxonomy consumers for `firewalling` and `ping`.
* Remove those aliases from `schemas/taxonomy.json`.
* Re-render and verify `TryHackMe/_meta/TAGS.md`.

**Why this should go second**

* It does not appear to require active-note edits.
* The work is mainly cleanup of stale schema values.
* It is lower-impact than removing live noise tags from active-note front matter.

## Backlog Order Rationale

### Highest value: `Research And Learning Meta`

This family still has live front matter values that the decision log explicitly marks as noise. Cleaning those notes first improves retrieval quality immediately and should unlock a clean schema prune afterward.

### Lower value: `Networking Fundamentals`

This family looks operationally clean in notes already. The remaining work is important, but mostly schema maintenance rather than active-note correction.

## No Remaining Schema-Add Backlog

At the moment, the remaining families do **not** appear to need new canonical values added to `schemas/taxonomy.json`.

That means the outstanding backlog is now mostly:

* removing noisy front matter values,
* pruning stale aliases from the schema,
* re-verifying the derived tag documentation.
