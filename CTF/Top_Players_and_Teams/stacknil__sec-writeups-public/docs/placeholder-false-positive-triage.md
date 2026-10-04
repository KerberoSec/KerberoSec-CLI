# Placeholder False-Positive Triage

Date: 2026-03-19

## Status

This document is now historical reference only for the active public-note corpus.

Its classifications and policy decisions were used to converge the checker and close the active-note placeholder backlog.

For the current placeholder operating surface, use:

* [docs/placeholder-closure.md](placeholder-closure.md)
* [docs/placeholder-policy.md](placeholder-policy.md)
* `scripts/check_placeholders.py`

## Summary

* Baseline from the 2026-03-18 grouped audit: `python scripts/check_placeholders.py` reported **107 issues across 23 active public notes** after collapsing paired placeholder hits into underlying cases.
* The raw checker output double-counts some cases because an angle-bracket token such as `<TOKEN>` is often reported twice:
  * once for the bracketed form
  * once for the inner uppercase token
* After grouping those paired reports into underlying cases, the remaining signal falls into three buckets:
  * a **small normalize-now set** with clear canonical replacements
  * a **policy-decision set** of genuinely ambiguous semantic placeholders
  * a **large exemption set** made up of instructional metavariables, literal search strings, diagram node IDs, env vars, and code variable identifiers
* Recommendation:
  * Normalize the clear generic placeholder debt first.
  * Add a small number of missing semantic families to policy only where the note meaning really depends on them.
  * Exempt instructional metavariables and literal identifiers in the checker rather than forcing note rewrites.
* Policy decisions completed on 2026-03-19:
  * Generic evidence redaction now lands on `VALUE_REDACTED`.
  * Same-digest sample output now lands on `SAME_HASH_VALUE`.
  * Admin/source-IP allowlist examples now land on `ADMIN_IP`.
  * Diagram-facing MAC placeholders now land on `MAC_A`, `MAC_B`, `MAC_C`, `MAC_R`, and `GATEWAY_MAC`.
* Checker exemption pass completed on 2026-03-19 for the currently triaged literal/metavariable set; remaining active checker findings are now primarily policy gaps rather than known false positives.

## Classification Guide

| Classification | Meaning | Recommended action |
| --- | --- | --- |
| real placeholder debt | Clear deprecated placeholder usage with a stable canonical landing spot already present in policy | Normalize |
| ambiguous semantic placeholder | Placeholder-like token that reflects real note meaning, but lacks a settled canonical family or needs a policy call first | Add to policy |
| false positive / exempt literal | Literal identifier, diagram ID, search marker, shell variable, code variable, filename artifact, or reserved instructional metavariable that should not drive body rewrites | Exempt in checker |

## Normalize

| File | Remaining hit(s) | Classification | Recommendation | Notes |
| --- | --- | --- | --- | --- |
| `TryHackMe/00-foundations/learning-meta/introductory-researching.md` | `user@host` | real placeholder debt | normalize | Use `USER_A@TARGET_HOST` in command syntax examples. |
| `TryHackMe/20-linux/linux-fundamentals/partII.md` | `IP_ADDRESS` | real placeholder debt | normalize | Canonical landing is `TARGET_IP`. |
| `TryHackMe/20-linux/linux-fundamentals/partIII.md` | `REMOTE_HOST` | real placeholder debt | normalize | In `scp` syntax this is best represented as `TARGET_HOST`. |
| `TryHackMe/40-networking/networking-core-protocols.md` | `DOMAIN` | real placeholder debt | normalize | Context strongly favors `TARGET_DOMAIN`. |
| `TryHackMe/50-crypto/public-key-cryptography-basics.md` | `USER`, `HOST`, `USER@HOST` | real placeholder debt | normalize | Use `USER_A`, `TARGET_HOST`, and `USER_A@TARGET_HOST`. |
| `TryHackMe/90-events/love-at-first-breach-2026/when-hearts-collide.md` | `APP_URL` | real placeholder debt | normalize | Canonical landing is `TARGET_URL`. |

## Add To Policy

No remaining active-note cases are currently classified as `add to policy`; the previously open `ADMIN_IP` and MAC-family gaps were resolved in the 2026-03-19 policy pass.

## Policy Decisions Completed

| Legacy token | Canonical landing | Next step | Notes |
| --- | --- | --- | --- |
| `<REDACTED>` | `VALUE_REDACTED` | normalize | Use a more specific `*_REDACTED` placeholder only when the hidden value family is clear. |
| `SAME_MD5_HASH` | `SAME_HASH_VALUE` | normalize | Keep the digest algorithm in the surrounding command or prose instead of the placeholder name. |

## Exempt In Checker

| File | Remaining hit(s) | Classification | Recommendation | Notes |
| --- | --- | --- | --- | --- |
| `TryHackMe/00-foundations/command-line/linux-shells.md` | `<EXPECTED_USER>`, `<EXPECTED_COMPANY>`, `<EXPECTED_PIN>` and paired inner-token reports | false positive / exempt literal | exempt in checker | Instructional shell-script metavariables; current repo instructions already treat at least `<EXPECTED_USER>` as reserved/untouched. |
| `TryHackMe/00-foundations/command-line/tor.md` | `TORSOCKS_CONF_FILE` | false positive / exempt literal | exempt in checker | Literal env-var syntax in a command example. |
| `TryHackMe/00-foundations/security-principles.md` | `<FILE>`, `<KNOWN_HASH>` and paired inner-token report | false positive / exempt literal | exempt in checker | Instructional checksum metavariables; `<FILE>` is already part of the reserved ambiguous set used in prior passes. |
| `TryHackMe/10-web/google-dorking.md` | `DATABASE_URL` | false positive / exempt literal | exempt in checker | Literal secret-marker string inside a dork, not a public-safe placeholder. |
| `TryHackMe/30-windows/windows-fundamentals/active-director-basic.md` | `OU_THM`, `OU_IT`, `THM_ROOT`, `THM_UK`, `THM_US`, `MHT_ROOT`, `MHT_EU`, `MHT_ASIA` | false positive / exempt literal | exempt in checker | Mermaid node IDs and diagram labels, not public-safe writeup placeholders. |
| `TryHackMe/40-networking/networking-essentials.md` | `CAP_DHCP`, `DHCP_CAPTURE`, `CAP_ARP`, `ARP_CAPTURE` | false positive / exempt literal | exempt in checker | Local shell variable names naming capture files, not note placeholders. |
| `TryHackMe/50-crypto/hashing-basics.md` | `<MODE>`, `<ATTACK>`, `<FILE>`, `<DOWNLOADED_FILE>`, `<HASH_STRING>` and paired inner-token reports | false positive / exempt literal | exempt in checker | Instructional CLI metavariables; they describe parameter slots rather than redacted public-safe values. |
| `TryHackMe/50-crypto/john-the-ripper-the-basics.md` | `<HASH>`, `<FORMAT>`, `<NAME>` | false positive / exempt literal | exempt in checker | Instructional CLI metavariables; these were intentionally left alone in the angle-bracket pass. |
| `TryHackMe/80-blue-team/30-detection/monikerlink-cve-2024-21413.md` | `<IFACE>` | false positive / exempt literal | exempt in checker | Reserved ambiguous interface metavariable used in command syntax. |
| `TryHackMe/80-blue-team/security-awareness/security-awareness.md` | `EXTERNAL_ACTORS` | false positive / exempt literal | exempt in checker | Mermaid subgraph ID, not reader-facing placeholder content. |
| `TryHackMe/90-events/love-at-first-breach-2026/valenfind.md` | `API_KEY` | false positive / exempt literal | exempt in checker | Literal search term in prose (“look for API_KEY / SECRET / TOKEN”), not a redacted value. |
| `TryHackMe/90-events/thm-aoc-2025/Day 03 - Splunk Basics: _Did you SIEM__.md` | `SIEM__` | false positive / exempt literal | exempt in checker | Filename/title artifact, not a writeup placeholder. |
| `TryHackMe/90-events/thm-aoc-2025/Day 16 - Forensics - Registry Furensics.md` | `<SID>` | false positive / exempt literal | exempt in checker | Reserved ambiguous registry metavariable explicitly deferred in earlier placeholder passes. |
| `TryHackMe/90-events/thm-aoc-2025/Day 19 -  ICS Modbus - Claus for Concern.md` | `PLC_IP`, `UNIT_ID` | false positive / exempt literal | exempt in checker | Literal code variable identifiers in example Python, not public-safe placeholder debt. |
| `TryHackMe/90-events/thm-aoc-2025/Day 23 - AWS Security - S3cret Santa.md` | `<POLICY_NAME>`, `<ACCOUNT_ID>` and paired inner-token reports | false positive / exempt literal | exempt in checker | Instructional AWS CLI metavariables; `<ACCOUNT_ID>` is also part of the reserved ambiguous set. |

## Implementation Notes

* Checker tuning should prefer **token-family exemptions** over file-by-file suppressions where the pattern is structural:
  * reserved instructional metavariables in angle brackets
  * Mermaid node identifiers
  * local shell/code variable identifiers used in examples
* The main normalize-now work is now small enough to run as a focused cleanup pass without mixing in policy design.
* There are no remaining active-corpus policy-gap findings after the 2026-03-19 admin/MAC placeholder decisions.
