# Repository Normalization Audit

Audit date: 2026-03-14

## Status

This document is historical reference only.

It records an early full-repo audit before the later taxonomy closure, placeholder closure, README snapshot automation, and markdownlint maintenance convergence work.

For current operating state, use:

* [docs/maintenance-checkpoint.md](maintenance-checkpoint.md)
* [docs/placeholder-closure.md](placeholder-closure.md)
* [docs/taxonomy-closure.md](taxonomy-closure.md)

Keep the remainder of this file as a point-in-time audit snapshot, not as the current repository baseline.

## Scope

This audit inventories every Markdown file in the repository, then evaluates the active knowledge-base note corpus for:

* front matter schema drift against `schemas/frontmatter.schema.json`
* controlled-vocabulary drift against `TryHackMe/_meta/TAGS.md`
* empty or redundant metadata fields
* safe-writing placeholder consistency

This report does not rewrite any note body prose.

## Method

* Inventory scope: every `*.md` file in the repository
* Active note corpus for metadata analysis: `TryHackMe/**/*.md` excluding `TryHackMe/_meta/**`, plus `notes/**/*.md`
* Front matter validator: `python scripts/check_markdown.py`
* Schema source: `schemas/frontmatter.schema.json`
* Controlled vocabulary source: `TryHackMe/_meta/TAGS.md`
* Placeholder scan: consistency-only regex scan for canonical placeholders and common alternates

Operational note:

* Placeholder consistency here means style consistency, not a full secret/leak audit.
* `reports/**` is inventoried because it is Markdown, but it is not treated as part of the active canonical note corpus.

## 1. Inventory

Snapshot counts before writing this report:

| Scope | Count |
|---|---:|
| All Markdown files in repo | 148 |
| Active note corpus | 93 |
| `TryHackMe/**` total | 96 |
| `notes/**` total | 1 |
| `reports/**` | 45 |
| `reports/quarantine/**` | 37 |
| `docs/**` | 1 |
| `templates/**` | 1 |
| Root standalone Markdown files (`AGENTS.md`, `README.md`, etc.) | 4 |

Active note corpus by topic:

| Topic | Count |
|---|---:|
| `00-foundations` | 26 |
| `10-web` | 7 |
| `20-linux` | 3 |
| `30-windows` | 4 |
| `40-networking` | 12 |
| `50-crypto` | 4 |
| `60-forensics` | 1 |
| `80-blue-team` | 4 |
| `90-events` | 31 |
| `notes/00-foundations` | 1 |

## 2. Front Matter Schema Drift

Current schema result for the active note corpus:

| Check | Result |
|---|---:|
| Files checked | 93 |
| Schema validation failures | 0 |
| Structural validation failures (`path/topic/H1/first H2`) | 0 |

Interpretation:

* The active note corpus currently passes the working schema and the repository structural checks.
* There is no active validator-level schema drift.

Observed front matter shapes:

| Shape | Count |
|---|---:|
| Standard TryHackMe note shape | 87 |
| TryHackMe note shape plus optional `description` | 5 |
| Lean `notes/**` shape with `date` and without `type/tags/source/sanitized` | 1 |

Field presence summary:

| Field | Present in files |
|---|---:|
| `status`, `created`, `updated`, `platform`, `room`, `slug`, `path`, `topic`, `domain`, `skills`, `artifacts` | 93 |
| `type`, `tags`, `source`, `sanitized` | 92 |
| `description` | 5 |
| `date` | 1 |

Assessment:

* The schema is stable at the validator level.
* The remaining schema question is not breakage; it is shape policy:
  one dominant TryHackMe schema, one sparse optional-description variant, and one lean `notes/**` variant.

## 3. Controlled-Vocabulary Drift Against `TAGS.md`

`TAGS.md` currently defines:

| Field | Allowed values |
|---|---:|
| `domain` | 9 |
| `skills` | 43 |
| `artifacts` | 4 |

Active note drift against that file:

| Field | Unique out-of-vocabulary values | Total occurrences |
|---|---:|---:|
| `domain` | 37 | 46 |
| `skills` | 187 | 214 |
| `artifacts` | 1 | 1 |

Top out-of-vocabulary `domain` values:

| Value | Occurrences | Files |
|---|---:|---:|
| `web-fundamentals` | 5 | 5 |
| `http` | 3 | 3 |
| `crypto-basics` | 3 | 3 |
| `hardware` | 2 | 2 |
| `encoding` | 1 | 1 |
| `binary` | 1 | 1 |
| `malware` | 1 | 1 |
| `programming` | 1 | 1 |
| `metasploit` | 1 | 1 |
| `exploitation-basics` | 1 | 1 |

Top out-of-vocabulary `skills` values:

| Value | Occurrences | Files |
|---|---:|---:|
| `osi-model` | 3 | 3 |
| `icmp` | 3 | 3 |
| `awareness-training` | 3 | 3 |
| `recipes` | 3 | 3 |
| `hardware-basics` | 2 | 2 |
| `traceroute` | 2 | 2 |
| `whois` | 2 | 2 |
| `request-methods` | 2 | 2 |
| `tcp-udp` | 2 | 2 |
| `http` | 2 | 2 |

Artifact drift:

| Value | Occurrences | Files |
|---|---:|---:|
| `room-notes` | 1 | 1 |

Highest-drift files against `TAGS.md`:

| File | Drift count |
|---|---:|
| `notes/00-foundations/security-engineer-intro.md` | 11 |
| `TryHackMe/00-foundations/introductory-networking.md` | 9 |
| `TryHackMe/50-crypto/hashing-basics.md` | 9 |
| `TryHackMe/50-crypto/john-the-ripper-the-basics.md` | 9 |
| `TryHackMe/60-forensics/00-tooling/cyberchef-the-basics.md` | 9 |
| `TryHackMe/80-blue-team/30-detection/monikerlink-cve-2024-21413.md` | 9 |
| `TryHackMe/10-web/javascript-essentials.md` | 8 |
| `TryHackMe/10-web/web-application-basics.md` | 8 |

Interpretation:

* Vocabulary drift is now a taxonomy policy issue, not a typo-only issue.
* `TAGS.md` is significantly narrower than the vocabulary already used across active notes.

## 4. Empty or Redundant Metadata Fields

### Empty fields

Present-but-empty front matter fields in the active note corpus:

| Field | Empty count |
|---|---:|
| none | 0 |

Interpretation:

* The earlier empty-field backlog has already been cleaned up.
* There is no active empty-field repair work left in the note corpus.

### Redundant or low-signal metadata candidates

Current redundant or highly derivable patterns:

| Field / pattern | Files | Observation |
|---|---:|---|
| `path` matches filesystem path exactly | 93 | Fully derivable from file location |
| `topic` matches the second path segment exactly | 93 | Fully derivable from file location |
| `platform: tryhackme` | 93 | Constant across the active corpus |
| `sanitized: true` | 92 | Constant across all files where present |
| `type: resource-note` | 92 | Constant across all files where present |
| `date == created` | 1 | Duplicate timestamp signal on the lean `notes/**` file |
| `description` only present on 5 files | 5 | Sparse optional field, not yet normalized |

Interpretation:

* There is no empty-field drift now.
* The main metadata cleanup question has shifted from “remove empty fields” to “decide which derivable or constant fields are still worth carrying.”

## 5. Safe-Writing Placeholder Consistency

Canonical placeholders explicitly aligned with repository guidance:

| Placeholder | Files using it |
|---|---:|
| `TARGET_IP` | 9 |
| `example.com` | 13 |
| `USER_A` | 0 |

Common alternate placeholder styles currently in active notes:

| Alternate style | Files using it |
|---|---:|
| `MACHINE_IP` | 8 |
| `ATTACKER_IP` | 3 |
| `ATTACKBOX_IP` | 2 |
| `USER` / `<USER>` / `USER_ID` | 6 |
| `HOST` / `<HOST>` / `TARGET_DOMAIN` / `INTERNAL_HOST` | 5 |

Notes mixing multiple placeholder families:

| File | Mixed styles observed |
|---|---|
| `TryHackMe/00-foundations/metasploit-introduction.md` | `TARGET_IP`, `ATTACKBOX_IP` |
| `TryHackMe/50-crypto/john-the-ripper-the-basics.md` | `TARGET_IP`, `USER`, `HOST` |
| `TryHackMe/50-crypto/public-key-cryptography-basics.md` | `example.com`, `USER`, `HOST` |
| `TryHackMe/20-linux/linux-fundamentals/partIII.md` | `MACHINE_IP`, `ATTACKER_IP`, `example.com`, `USER`, `HOST` |
| `TryHackMe/10-web/google-dorking.md` | `example.com`, `HOST` / `TARGET_DOMAIN` |

Interpretation:

* Placeholder usage is safe-style oriented, but not yet canonicalized.
* The clearest inconsistency is user placeholder policy:
  `USER_A` is the documented exemplar, but the active corpus currently uses generic `USER` / `USER_ID` variants instead.

## 6. Findings Grouped by Risk

### Safe auto-fix

* No active front matter fields are currently present-but-empty.
* No active note fails the current front matter schema or structural validator.
* There is no high-confidence metadata-only cleanup backlog left that can be applied blindly without a policy decision.

### Review-needed

* `TAGS.md` is materially out of sync with active usage:
  37 out-of-vocabulary `domain` values, 187 out-of-vocabulary `skills`, and 1 out-of-vocabulary `artifact`.
* The repository still carries three valid front matter shapes:
  standard TryHackMe, TryHackMe plus `description`, and the lean `notes/**` variant.
* Several metadata fields look redundant or derivable (`path`, `topic`, `platform`, `sanitized`, `type`), but removing them would affect downstream tooling and should not be done without an explicit schema decision.
* Placeholder conventions are inconsistent across note bodies.
  Normalizing `MACHINE_IP` / `ATTACKER_IP` / `ATTACKBOX_IP` / `USER` / `HOST` into one canonical set would require prose and example edits.
* `room-notes` appears once in `TryHackMe/90-events/love-at-first-breach-2026/speed-chatter.md` and needs an explicit artifact-policy decision.
* `date` appears only once and duplicates `created` on `notes/00-foundations/security-engineer-intro.md`; whether it survives depends on the `notes/**` schema decision.

### Do-not-touch

* `reports/**`, especially `reports/quarantine/**`, because those files are archive or staging material rather than active canonical notes.
* Active note bodies for placeholder canonicalization until the repository agrees on the canonical placeholder set.
* Public/private publishing boundary material (`POLICY.md`, `SANITIZATION_CHECKLIST.md`, and related policy docs) unless a separate policy review is requested.

## Recommended Next Step

The highest-value next normalization decision is:

1. Freeze the canonical vocabulary policy:
   either expand `TAGS.md` to match active usage, or compress active tags back toward the older narrower set.
2. Freeze the placeholder policy:
   decide whether `TARGET_IP` / `example.com` / `USER_A` is the mandatory public style, or whether alternate families remain acceptable.
3. Only after those two decisions, consider any note-body normalization.

Until those policies are frozen, the repository is structurally healthy, but taxonomy and placeholder consistency should remain in the review-needed bucket.
