# Placeholder Policy

Date: 2026-03-19

## Purpose

This policy defines the canonical placeholder set for public writeups in this repository.

Use these placeholders when a note needs to stay reproducible without publishing real targets, secrets, accounts, URLs, or other live identifiers.

## Core Rules

1. Use the canonical placeholder set in this document for public writeups.
2. Prefer uppercase semantic snake-case placeholders such as `TARGET_IP` and `USER_A`.
3. Use reserved public example literals for domains, email addresses, and file paths.
4. Use neutral redaction placeholders for secrets, recovered values, and intentionally omitted evidence values.
5. Do not introduce ad hoc story-themed placeholders or challenge-branded placeholder names.
6. Do not rewrite real technology identifiers as placeholders when the note is teaching the literal identifier.

## Canonical Placeholder Set

### Network and target placeholders

* `TARGET_IP`
* `TARGET_HOST`
* `TARGET_DOMAIN`
* `TARGET_URL`
* `TARGET_SUBNET`
* `TARGET_RANGE`
* `TARGET_PORT`
* `CLIENT_IP`
* `SERVER_IP`
* `GATEWAY_IP`
* `PUBLIC_IP`
* `INTERNAL_IP`
* `DNS_IP`
* `WEB_SERVER_IP`
* `ATTACKER_IP`
* `ATTACKER_HOST`

### Administrative and link-layer placeholders

* `ADMIN_IP`
* `GATEWAY_MAC`
* `MAC_A`
* `MAC_B`
* `MAC_C`
* `MAC_R`

### Listener and tooling placeholders

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

### Identity and auth placeholders

* `USER_A`
* `USER_B`
* `CANDIDATE_PASSWORD`
* `FAIL_MESSAGE`

### Neutral redaction placeholders

* `PASSWORD_REDACTED`
* `TOKEN_REDACTED`
* `API_KEY_REDACTED`
* `SECRET_REDACTED`
* `FLAG_REDACTED`
* `VALUE_REDACTED`

### Evidence and derived-value placeholders

* `HASH_VALUE`
* `SAME_HASH_VALUE`

### Reserved public example literals

* `example.com`
* `example.org`
* `example.net`
* `user@example.com`
* `/path/to/file.txt`
* `/path/to/wordlist.txt`
* `/path/to/passwords.txt`

## Deprecated Styles

Do not introduce these styles in new or edited public notes:

* angle-bracket placeholders such as `<TARGET_IP>` or `<HASHFILE>`
* bare uppercase generic placeholders such as `DOMAIN`, `HOST`, `USER`, or `PASSWORD`
* platform-branded variants such as `MACHINE_IP`, `THM_IP`, `ATTACKBOX_IP`, `YOUR_DOMAIN`, or `USERNAME_A`
* story-specific placeholders such as `TOKEN_SOCMAS`, `CUPID_MASTER_KEY_2024_XOXO`, `FLAG_FINAL`, or `FLAG_RED`

## Preferred Migrations

| Old style | Canonical replacement |
| --- | --- |
| `<TARGET_IP>` | `TARGET_IP` |
| `<USER>` | `USER_A` |
| `<PASSWORD>` | `CANDIDATE_PASSWORD` or `PASSWORD_REDACTED`, depending on meaning |
| `<HASHFILE>` | `/path/to/file.txt` or another explicit path placeholder |
| `DOMAIN` | `TARGET_DOMAIN` or `example.com`, depending on context |
| `HOST` | `TARGET_HOST` |
| `USER` | `USER_A` |
| `MACHINE_IP` | `TARGET_IP` |
| `THM_IP` | `TARGET_IP` |
| `ATTACKBOX_IP` | `ATTACKER_IP` |
| `YOUR_DOMAIN` | `TARGET_DOMAIN` or `example.com`, depending on context |
| `USERNAME_A` | `USER_A` |
| `TOKEN_SOCMAS` | `TOKEN_REDACTED` |
| `CUPID_MASTER_KEY_2024_XOXO` | `API_KEY_REDACTED` or `SECRET_REDACTED`, depending on context |
| `FLAG_FINAL` | `FLAG_REDACTED` |
| `FLAG_RED` | `FLAG_REDACTED` |
| `<REDACTED>` | `VALUE_REDACTED` unless a more specific `*_REDACTED` placeholder fits |
| `SAME_MD5_HASH` | `SAME_HASH_VALUE` |

## Selection Notes

* Prefer the most specific `*_REDACTED` placeholder when the hidden value is clearly a password, token, API key, secret, or flag.
* Use `VALUE_REDACTED` when the value is intentionally omitted but the surrounding field already provides the needed meaning, such as `User-Agent: VALUE_REDACTED`.
* Use `HASH_VALUE` and `SAME_HASH_VALUE` for sample digest output. Keep the algorithm itself in the surrounding command or prose, such as `md5sum`, `sha256sum`, or “MD5 digest”.
* Use `ADMIN_IP` when the example is specifically about a trusted administrative source address in a firewall or allowlist rule; otherwise prefer `CLIENT_IP`.
* Use `GATEWAY_MAC` for ARP/gateway explanations, and use `MAC_A` / `MAC_B` / `MAC_C` / `MAC_R` only for small LAN diagram slots where distinct layer-2 endpoints need to stay visually paired with labeled ports or hosts.

## Literal Identifiers That Should Stay Literal

Do not normalize these into placeholders when they are the real subject of the note:

* environment variables such as `AWS_ACCESS_KEY_ID`
* framework environment variables such as `FLASK_APP`
* literal search markers such as `API_KEY` when the note is teaching what string to search for in source code or logs
* env-var style config names such as `TORSOCKS_CONF_FILE` or `DATABASE_URL` when the literal identifier is the thing being searched for or explained
* operating-system or registry identifiers such as `LD_PRELOAD` and `HKEY_LOCAL_MACHINE`
* Windows library or import identifiers such as `WS2_32` when the note is explaining literal API or import-table names
* artifact names such as `NTUSER.DAT`
* room/title artifacts such as `SIEM__` when they are part of a challenge or file title
* challenge literals such as `MI_SAMPLE_BRAVO` and `MEMORY_POISONED` when they are fixed room/task identifiers rather than redacted values
* instructional metavariables such as `<EXPECTED_USER>`, `<EXPECTED_COMPANY>`, `<EXPECTED_PIN>`, `<FILE>`, `<KNOWN_HASH>`, `<MODE>`, `<ATTACK>`, `<DOWNLOADED_FILE>`, `<HASH_STRING>`, `<HASH>`, `<FORMAT>`, `<NAME>`, `<IFACE>`, `<SID>`, `<POLICY_NAME>`, and `<ACCOUNT_ID>` when the note is documenting a command or data-shape slot rather than a redacted real value
* diagram/node identifiers such as `OU_THM`, `OU_IT`, `THM_ROOT`, `THM_UK`, `THM_US`, `MHT_ROOT`, `MHT_EU`, `MHT_ASIA`, and `EXTERNAL_ACTORS`
* local capture or code variable identifiers such as `CAP_DHCP`, `DHCP_CAPTURE`, `CAP_ARP`, `ARP_CAPTURE`, `PLC_IP`, and `UNIT_ID`
* IDS or rule-engine variable identifiers such as `HOME_NET` when the note is explaining the literal rule syntax
* exact commands, methods, or protocol terms when the note is explaining those literals

## Enforcement

Public writeups should converge toward this policy during normal editing and cleanup passes. New notes and materially edited notes should use the canonical placeholder set immediately.
