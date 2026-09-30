# Placeholder Convergence Audit

Date: 2026-03-18

## Status

This document is a point-in-time audit snapshot.

For the current placeholder operating surface, use:

* [docs/placeholder-closure.md](placeholder-closure.md)
* [docs/placeholder-policy.md](placeholder-policy.md)
* `scripts/check_placeholders.py`

## Summary

This audit reviewed active-note bodies and front matter under `TryHackMe/` and `notes/` to identify the placeholder styles currently used in public-safe writing.

Current state:

* Front matter is effectively clean: no live placeholder-style values were found in active-note front matter fields.
* Bodies are mostly converged on uppercase semantic placeholders such as `TARGET_IP`, `TARGET_HOST`, and `USER_A`.
* Placeholder drift still exists in three older styles:
  * angle-bracket placeholders such as `<TARGET_IP>` and `<HASHFILE>`
  * bare uppercase generic placeholders such as `DOMAIN`, `HOST`, and `USER`
  * story-specific or challenge-specific placeholder values such as `TOKEN_SOCMAS` and `CUPID_MASTER_KEY_2024_XOXO`

## Audit Scope

The audit covered:

* active notes in `TryHackMe/`
* active notes in `notes/`
* both body content and YAML front matter

Excluded:

* `TryHackMe/_meta/`
* generated taxonomy documents
* templates, scripts, and tests for this pass

## Observed Placeholder Styles

| Style | Approximate count | Files hit | Assessment |
| --- | ---: | ---: | --- |
| Uppercase snake case, e.g. `TARGET_IP` | 329 | 45 | Dominant and suitable as the canonical style |
| Angle-bracket uppercase, e.g. `<TARGET_IP>` | 71 | 19 | Legacy style; should be merged into canonical placeholders |
| Bare uppercase generic tokens, e.g. `DOMAIN` | 55 | 12 | Too vague; should be replaced with more specific canonical placeholders |
| Reserved public examples, e.g. `example.com`, `user@example.com`, `/path/to/file.txt` | 41 | 16 | Useful and should remain canonical |

## Canonical Placeholder Candidates

These are the strongest candidates for the canonical public-safe placeholder set because they already recur across notes and carry clear meaning.

### Keep

#### Network and target placeholders

* `TARGET_IP`
* `TARGET_HOST`
* `TARGET_DOMAIN`
* `TARGET_URL`
* `TARGET_SUBNET`
* `TARGET_RANGE`
* `CLIENT_IP`
* `SERVER_IP`
* `GATEWAY_IP`
* `PUBLIC_IP`
* `INTERNAL_IP`
* `DNS_IP`
* `WEB_SERVER_IP`
* `ATTACKER_IP`
* `ATTACKER_HOST`

#### Listener and tooling placeholders

* `LHOST`
* `LPORT`
* `RHOSTS`
* `RPORT`
* `LISTEN_PORT`
* `WORKSPACE_NAME`
* `MODULE_NAME`
* `SESSION_ID`
* `SESSION_TOKEN`
* `PARAM_NAME`
* `RULE_NUMBER`
* `TARGET_PID`

#### Identity and auth placeholders

* `USER_A`
* `USER_B`
* `CANDIDATE_PASSWORD`
* `FAIL_MESSAGE`

#### Safe public literals

* `example.com`
* `example.org`
* `example.net`
* `user@example.com`
* `/path/to/file.txt`
* `/path/to/wordlist.txt`
* `/path/to/passwords.txt`

#### Neutral redaction placeholders

* `PASSWORD_REDACTED`
* `TOKEN_REDACTED`
* `API_KEY_REDACTED`
* `SECRET_REDACTED`
* `FLAG_REDACTED`

## Deprecated Placeholder Styles

### Merge to canonical

| Deprecated style | Examples seen | Likely decision |
| --- | --- | --- |
| Angle-bracket wrappers | `<TARGET_IP>`, `<HASHFILE>`, `<USER>`, `<PASSWORD>`, `<FORMAT>`, `<ATTACKBOX_IP>` | Merge to the same placeholder without brackets or to a more specific canonical token |
| Bare uppercase generics | `DOMAIN`, `HOST`, `USER`, `PASSWORD`, `HASHFILE`, `NAME` | Merge to semantic placeholders such as `TARGET_DOMAIN`, `TARGET_HOST`, `USER_A`, `CANDIDATE_PASSWORD`, or `/path/to/file.txt` |
| Platform-branded aliases | `MACHINE_IP`, `THM_IP`, `ATTACKBOX_IP`, `YOUR_DOMAIN`, `USERNAME_A` | Merge to repo-wide generic forms such as `TARGET_IP`, `ATTACKER_IP`, `TARGET_DOMAIN`, and `USER_A` |

### Drop and replace

| Deprecated style | Examples seen | Likely decision |
| --- | --- | --- |
| Story-specific secrets and tokens | `CUPID_MASTER_KEY_2024_XOXO`, `TOKEN_SOCMAS` | Drop; replace with neutral placeholders such as `API_KEY_REDACTED`, `TOKEN_REDACTED`, or `SECRET_REDACTED` |
| Story-specific flag labels | `FLAG_FINAL`, `FLAG_RED` | Drop; replace with `FLAG_REDACTED` or a neutral note-local label when the distinction matters |

## Keep Literal, Do Not Normalize As Placeholders

Not every all-caps token is a placeholder. The following categories should remain literal when they refer to real technologies, fields, or artifact names:

* environment variable names such as `AWS_ACCESS_KEY_ID`
* operating-system identifiers such as `LD_PRELOAD` and `HKEY_LOCAL_MACHINE`
* exact product or artifact names such as `NTUSER.DAT`
* real protocol, HTTP method, or registry tokens when they are being taught as literals

## Front Matter Findings

Active-note front matter is already aligned with the public-safe writing goal:

* no placeholder-style values were found in taxonomy fields
* no front matter migration is needed for this governance track

This is a body-level normalization problem, not a front-matter problem.

## Likely Decision Summary

* Keep: uppercase semantic snake-case placeholders, reserved example domains, reserved example email addresses, and reserved example paths
* Merge: angle-bracket forms, bare uppercase generic forms, and platform-branded aliases
* Drop: story-specific token names, secret names, and flag labels that leak challenge flavor into the public-safe layer

## Recommended Execution Order

1. Normalize legacy angle-bracket placeholders to canonical uppercase snake-case or reserved example literals.
2. Collapse platform-branded aliases such as `MACHINE_IP`, `THM_IP`, `ATTACKBOX_IP`, `YOUR_DOMAIN`, and `USERNAME_A`.
3. Replace themed or challenge-specific secret placeholders with neutral redaction placeholders.
4. Re-run changed-files validation after each batch.
