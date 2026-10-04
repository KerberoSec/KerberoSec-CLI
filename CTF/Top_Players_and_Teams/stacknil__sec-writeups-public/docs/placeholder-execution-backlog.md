# Placeholder Execution Backlog

Date: 2026-03-19

## Status

This document is now historical reference only for the active public-note corpus.

The placeholder checker is clean on active notes, and the pass sequencing captured here is retained mainly for auditability of how closure was reached.

For the current placeholder operating surface, use:

* [docs/placeholder-closure.md](placeholder-closure.md)
* [docs/placeholder-policy.md](placeholder-policy.md)
* `scripts/check_placeholders.py`

## Summary

* Current status: after the 2026-03-19 admin/MAC add-to-policy pass, `python scripts/check_placeholders.py` is clean for the active public-note corpus.
* Baseline from the 2026-03-18 raw checker audit: `python scripts/check_placeholders.py` reported **123 issues across 23 active public notes** before later policy and checker tuning.
* Completed passes:
  * **Pass 2: platform-branded alias cleanup** is complete. No active notes currently contain `MACHINE_IP`, `THM_IP`, `ATTACKBOX_IP`, `YOUR_DOMAIN`, or `USERNAME_A`.
  * **Pass 3: story-specific secret placeholder cleanup** is complete for the targeted legacy set (`TOKEN_SOCMAS`, `CUPID_MASTER_KEY_2024_XOXO`, `FLAG_FINAL`, `FLAG_RED`).
* Historical remaining-work notes below are retained for auditability; they do not describe the current active-note state.
* No **platform-branded alias leftovers** remain in active public notes.

## Pass Status

| Pass | Scope | Status | Notes |
| --- | --- | --- | --- |
| Pass 1 | Legacy angle-bracket placeholders and obvious generic placeholder convergence | Complete for active public notes | Low-ambiguity rewrites landed; reserved instructional metavariables are now documented as exemptions where appropriate. |
| Pass 2 | Platform-branded aliases (`MACHINE_IP`, `THM_IP`, `ATTACKBOX_IP`, `YOUR_DOMAIN`, `USERNAME_A`) | Complete | Verified by a fresh active-note scan. |
| Pass 3 | Story-specific / challenge-branded secret placeholders | Complete for targeted set | The named legacy challenge tokens are gone; only generic redaction-style follow-up remains. |
| Pass 4 | False positive / exempt literal triage and checker tuning | Complete for active public notes | Current triaged exemption set is implemented and the active corpus now passes the checker. |

## Recommended Execution Order

1. **Low-ambiguity generic mappings**
   * Clear the easiest remaining obvious replacements first: `DOMAIN`, `USER`, `HOST`, `user@host`, `IP_ADDRESS`, `REMOTE_HOST`.
   * Target files: `networking-core-protocols.md`, `public-key-cryptography-basics.md`, `introductory-researching.md`, `linux-fundamentals/partII.md`, `linux-fundamentals/partIII.md`.
2. **Angle-bracket leftovers with clear canonical targets**
   * Focus next on notes where the bracket style is the main debt and the canonical target is predictable enough to convert safely.
   * Highest-value examples: crypto/how-to notes such as `hashing-basics.md` and `john-the-ripper-the-basics.md`.
3. **Policy-backed redaction / digest cleanup**
   * Normalize the newly-settled policy items:
     * `<REDACTED>` -> `VALUE_REDACTED` where no more specific `*_REDACTED` family fits
     * `SAME_MD5_HASH` -> `SAME_HASH_VALUE`
   * Target files: `valenfind.md`, `when-hearts-collide.md`, and any remaining prose references that still quote the old room token.
4. **Ambiguous semantic placeholder review**
   * Triage note-local semantic tokens that may need either a context-specific mapping or a policy addition before safe normalization.
   * Target files: `firewall-fundamentals.md`, `02-intro-to-LAN.md`, `networking-essentials.md`, `when-hearts-collide.md`, `Day 19 - ICS Modbus - Claus for Concern.md`.
5. **False positive / exempt literal review**
   * Audit checker hits that are likely not placeholders at all, then decide whether to document exemptions or adjust the checker.
   * Target files: `tor.md`, `google-dorking.md`, `active-director-basic.md`, `security-awareness.md`, `Day 03 - Splunk Basics - Did you SIEM?.md`.
6. **Reserved ambiguous tokens explicitly deferred in earlier passes**
   * Keep these for last unless policy changes first.
   * Examples: `<EXPECTED_USER>`, `<FILE>`, `<IFACE>`, `<SID>`, `<ACCOUNT_ID>`, `<FORMAT>`, `<HASH>`.

## Remaining File Backlog

| File | Checker examples | Categories | Next step |
| --- | --- | --- | --- |
| `TryHackMe/00-foundations/command-line/linux-shells.md` | `<EXPECTED_USER>`, `<EXPECTED_COMPANY>`, `<EXPECTED_PIN>` | angle-bracket leftovers; ambiguous semantic placeholders; secret-adjacent placeholders | Defer until reserved-token policy is clarified; `EXPECTED_PIN` also needs a secret-redaction decision. |
| `TryHackMe/00-foundations/command-line/tor.md` | `TORSOCKS_CONF_FILE` | false positive / exempt literal | Likely literal env-var style syntax; prefer checker exemption over note rewrite. |
| `TryHackMe/00-foundations/learning-meta/introductory-researching.md` | `user@host` | ambiguous semantic placeholders | Low ambiguity; likely migrate to `USER_A@TARGET_HOST` or `user@example.com`. |
| `TryHackMe/00-foundations/security-principles.md` | `<FILE>`, `<KNOWN_HASH>` | angle-bracket leftovers; ambiguous semantic placeholders | Needs a decision on whether `<FILE>` stays reserved/exempt or becomes `/path/to/file.txt`; `KNOWN_HASH` needs a neutral example strategy. |
| `TryHackMe/10-web/google-dorking.md` | `DATABASE_URL` | false positive / exempt literal | Literal secret-marker string inside a dork query, not obviously a placeholder. |
| `TryHackMe/20-linux/linux-fundamentals/partII.md` | `IP_ADDRESS` | ambiguous semantic placeholders | Low ambiguity; likely map to `TARGET_IP`. |
| `TryHackMe/20-linux/linux-fundamentals/partIII.md` | `REMOTE_HOST` | ambiguous semantic placeholders | Needs a context choice between `TARGET_HOST` and `TARGET_IP`. |
| `TryHackMe/30-windows/windows-fundamentals/active-director-basic.md` | `OU_THM`, `THM_ROOT`, `MHT_ROOT` | false positive / exempt literal | Mermaid node IDs and diagram labels are likely checker false positives. |
| `TryHackMe/40-networking/firewall-fundamentals.md` | `ADMIN_IP` | ambiguous semantic placeholders | Needs a policy/context decision; not currently in the canonical set. |
| `TryHackMe/40-networking/network-fundamentals/02-intro-to-LAN.md` | `MAC_A`, `MAC_B`, `MAC_C`, `MAC_R` | ambiguous semantic placeholders | Requires a MAC-address placeholder strategy or a documented exemption. |
| `TryHackMe/40-networking/networking-core-protocols.md` | `DOMAIN` | ambiguous semantic placeholders | Low ambiguity; likely migrate to `TARGET_DOMAIN`. |
| `TryHackMe/40-networking/networking-essentials.md` | `GATEWAY_MAC`, `CAP_DHCP`, `ARP_CAPTURE` | ambiguous semantic placeholders; false positive / exempt literal | `GATEWAY_MAC` likely needs policy support; `CAP_*` and capture variable names may be local shell vars rather than placeholders. |
| `TryHackMe/50-crypto/hashing-basics.md` | `<MODE>`, `<ATTACK>`, `<HASHFILE>`, `<WORDLIST>`, `<FILE>`, `<DOWNLOADED_FILE>`, `<HASH_STRING>` | angle-bracket leftovers; ambiguous semantic placeholders | High-value cleanup file; several tokens are clear migrations, others are reserved/ambiguous. |
| `TryHackMe/50-crypto/john-the-ripper-the-basics.md` | `<HASH>`, `<TARGET_IP>`, `<USER>`, `<HASHFILE>`, `<FORMAT>`, `<NAME>` | angle-bracket leftovers; ambiguous semantic placeholders | Another high-value cleanup file; split obvious migrations from reserved ambiguous tokens. |
| `TryHackMe/50-crypto/public-key-cryptography-basics.md` | `USER`, `HOST`, `USER@HOST` | ambiguous semantic placeholders | Low ambiguity; likely migrate to `USER_A`, `TARGET_HOST`, and `USER_A@TARGET_HOST`. |
| `TryHackMe/80-blue-team/30-detection/monikerlink-cve-2024-21413.md` | `<IFACE>` | angle-bracket leftovers; ambiguous semantic placeholders | Reserved ambiguous token; likely needs exemption or a policy-approved replacement. |
| `TryHackMe/80-blue-team/security-awareness/security-awareness.md` | `EXTERNAL_ACTORS` | false positive / exempt literal | Mermaid subgraph ID, not clearly reader-facing placeholder content. |
| `TryHackMe/90-events/love-at-first-breach-2026/valenfind.md` | `<REDACTED>`, `API_KEY` | angle-bracket leftovers; secret-adjacent placeholders; false positive / exempt literal | `<REDACTED>` now maps to `VALUE_REDACTED`; `API_KEY` appears to be a literal search term and likely exempt. |
| `TryHackMe/90-events/love-at-first-breach-2026/when-hearts-collide.md` | `APP_URL`, `SAME_MD5_HASH` | ambiguous semantic placeholders | `APP_URL` is likely `TARGET_URL`; `SAME_MD5_HASH` now maps to `SAME_HASH_VALUE`. |
| `TryHackMe/90-events/thm-aoc-2025/Day 03 - Splunk Basics: _Did you SIEM__.md` | `<REDACTED>`, `SIEM__` | angle-bracket leftovers; secret-adjacent placeholders; false positive / exempt literal | The filename token is a checker false positive; prose references to `<REDACTED>` can now normalize to `VALUE_REDACTED` when appropriate. |
| `TryHackMe/90-events/thm-aoc-2025/Day 16 - Forensics - Registry Furensics.md` | `<SID>` | angle-bracket leftovers; ambiguous semantic placeholders | Explicitly reserved ambiguous placeholder; keep for a policy/exemption pass. |
| `TryHackMe/90-events/thm-aoc-2025/Day 19 -  ICS Modbus - Claus for Concern.md` | `PLC_IP`, `UNIT_ID` | ambiguous semantic placeholders | Needs OT-specific placeholder decisions or a checker exemption for note-local code variables. |
| `TryHackMe/90-events/thm-aoc-2025/Day 23 - AWS Security - S3cret Santa.md` | `<POLICY_NAME>`, `<ACCOUNT_ID>` | angle-bracket leftovers; ambiguous semantic placeholders | `<ACCOUNT_ID>` was previously reserved as ambiguous; `POLICY_NAME` may be convertible once policy is clarified. |

## Notes For The Next Pass

* The remaining backlog is no longer dominated by platform or story-themed drift. It is now mostly a mix of:
  * low-ambiguity generic cleanups,
  * reserved ambiguous placeholder decisions,
  * and checker false-positive triage.
* Before editing the highest-ambiguity files, decide whether the canonical policy should grow to include:
  * MAC-address example placeholders,
  * OT/ICS note-local variable conventions,
  * and whether bracketed placeholders on the reserved do-not-touch list should become explicit checker exemptions.
