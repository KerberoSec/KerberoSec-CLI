# Taxonomy Normalization Plan

Date: 2026-03-27

## Status

This document is historical reference only.

It records the earlier drift-analysis and action-shaping work that fed into the later taxonomy decision log, execution backlog, and closure state.

For the current taxonomy operating surface, use:

* [docs/taxonomy-closure.md](taxonomy-closure.md)
* [docs/taxonomy-decision-log.md](taxonomy-decision-log.md)
* [docs/taxonomy-execution-backlog.md](taxonomy-execution-backlog.md)

Keep the remainder of this file as planning history, not as the current taxonomy baseline.

## Scope

* Compared active notes under `TryHackMe/` and `notes/`, excluding `_meta`, using the same root selection as `scripts/check_markdown.py`.
* Active notes scanned: `93` Markdown files with YAML front matter.
* Authority baseline for this report: `TryHackMe/_meta/TAGS.md`.
* Secondary reference: `schemas/taxonomy.json`, used only to separate documentation drift from truly invalid metadata.

## Headline Findings

* Relative to `TAGS.md`, there are `261` out-of-vocabulary tag occurrences across `225` unique values.
* Breakdown: `domain` = `46` occurrences / `37` unique, `skills` = `214` / `187`, `artifacts` = `1` / `1`.
* Every drifted value found in notes is already allowed by `schemas/taxonomy.json`: `domain` `37/37`, `skills` `187/187`, `artifacts` `1/1`.
* This means the current problem is primarily **taxonomy drift between `TAGS.md` and the enforced schema**, not invalid note metadata.
* Proposed action mix by unique value: `31` safe auto-fix, `189` review-needed, `5` reject/remove.

## Interpretation Of Actions

* `safe auto-fix`: the drifted value can be normalized directly to an existing `TAGS.md` value with low semantic risk.
* `review-needed`: either the value is useful enough to keep and add into `TAGS.md`, or it can collapse to a broader `TAGS.md` value only after a manual review.
* `reject/remove`: the value is too generic, duplicates another taxonomy signal, or fits better in another field than the current one.

## Recommended Order

1. Apply the `safe auto-fix` set first because those changes are low-risk and shrink the visible drift immediately.
2. Decide whether `TAGS.md` should stay intentionally narrow or be expanded to match `schemas/taxonomy.json` for the `review-needed` set.
3. Remove or re-home the `reject/remove` set only after confirming there is no search or workflow dependency on those values.

## Frequency Summary

| Field | Unique OOV values | Total OOV occurrences | Unique values also in schema |
| --- | ---: | ---: | ---: |
| `domain` | 37 | 46 | 37 |
| `skills` | 187 | 214 | 187 |
| `artifacts` | 1 | 1 | 1 |

## Domain Proposals

| Drift value | Count | Proposed canonical | Action |
| --- | ---: | --- | --- |
| `web-fundamentals` | 5 | `web` | `safe auto-fix` |
| `crypto-basics` | 3 | `crypto` | `safe auto-fix` |
| `http` | 3 | `web` | `safe auto-fix` |
| `hardware` | 2 | `foundations` | `review-needed` |
| `access-control` | 1 | `web` | `review-needed` |
| `authentication` | 1 | `crypto` | `review-needed` |
| `binary` | 1 | `foundations` | `review-needed` |
| `client-side-security` | 1 | `web` | `safe auto-fix` |
| `data-transformation` | 1 | `forensics` | `review-needed` |
| `detection-engineering` | 1 | `blueteam` | `safe auto-fix` |
| `dfir` | 1 | `forensics` | `safe auto-fix` |
| `dfir-tooling` | 1 | `forensics` | `safe auto-fix` |
| `dns` | 1 | `networking` | `review-needed` |
| `email-security` | 1 | `blueteam` | `review-needed` |
| `encoding` | 1 | `foundations` | `review-needed` |
| `exploitation-basics` | 1 | `foundations` | `review-needed` |
| `governance` | 1 | `blueteam` | `review-needed` |
| `grc` | 1 | `blueteam` | `review-needed` |
| `integrity` | 1 | `crypto` | `review-needed` |
| `javascript` | 1 | `web` | `safe auto-fix` |
| `malware` | 1 | `foundations` | `review-needed` |
| `math-fundamentals` | 1 | `foundations` | `review-needed` |
| `metasploit` | 1 | `foundations` | `review-needed` |
| `network-scanning` | 1 | `networking` | `safe auto-fix` |
| `network-security` | 1 | `networking` | `safe auto-fix` |
| `osint` | 1 | `web` | `review-needed` |
| `osint-utilities` | 1 | `forensics` | `review-needed` |
| `password-security` | 1 | `crypto` | `review-needed` |
| `programming` | 1 | `foundations` | `review-needed` |
| `security` | 1 | `networking` | `review-needed` |
| `security-engineering` | 1 | `blueteam` | `review-needed` |
| `security-labs` | 1 | `crypto` | `review-needed` |
| `security-operations` | 1 | `blueteam` | `safe auto-fix` |
| `vuln-research` | 1 | `blueteam` | `review-needed` |
| `web-app-security` | 1 | `web` | `safe auto-fix` |
| `web-recon` | 1 | `web` | `safe auto-fix` |
| `windows-auth` | 1 | `windows` | `safe auto-fix` |

## Skills Proposals

| Drift value | Count | Proposed canonical | Action |
| --- | ---: | --- | --- |
| `awareness-training` | 3 | `awareness-training` | `review-needed` |
| `icmp` | 3 | `tcp-ip` | `review-needed` |
| `osi-model` | 3 | `osi-model` | `review-needed` |
| `recipes` | 3 | `cookbook` | `reject/remove` |
| `bash-scripting` | 2 | `bash-scripting` | `review-needed` |
| `control-flow` | 2 | `control-flow` | `review-needed` |
| `extractors` | 2 | `extractors` | `review-needed` |
| `hardware-basics` | 2 | `hardware-basics` | `review-needed` |
| `hash-cracking` | 2 | `hash-cracking` | `review-needed` |
| `hash-functions` | 2 | `hash-functions` | `review-needed` |
| `hash-recognition` | 2 | `hash-recognition` | `review-needed` |
| `http` | 2 | `http-basics` | `safe auto-fix` |
| `malware-analysis` | 2 | `malware-analysis` | `review-needed` |
| `phishing-analysis` | 2 | `triage` | `review-needed` |
| `ports` | 2 | `ports` | `review-needed` |
| `python-basics` | 2 | `python-basics` | `review-needed` |
| `request-methods` | 2 | `http-basics` | `safe auto-fix` |
| `shell-basics` | 2 | `shell-basics` | `review-needed` |
| `tcp-udp` | 2 | `tcp-ip` | `review-needed` |
| `traceroute` | 2 | `tcp-ip` | `review-needed` |
| `vpn` | 2 | `vpn` | `review-needed` |
| `whois` | 2 | `recon` | `review-needed` |
| `wireshark` | 2 | `pcap` | `review-needed` |
| `addressing` | 1 | `addressing` | `review-needed` |
| `archive-cracking` | 1 | `archive-cracking` | `review-needed` |
| `ascii` | 1 | `ascii` | `review-needed` |
| `asset-inventory` | 1 | `asset-inventory` | `review-needed` |
| `asymmetric-crypto` | 1 | `asymmetric-crypto` | `review-needed` |
| `base-encodings` | 1 | `base-encodings` | `review-needed` |
| `basic-listener` | 1 | `basic-listener` | `review-needed` |
| `binary` | 1 | `binary` | `review-needed` |
| `bitlocker` | 1 | `bitlocker` | `review-needed` |
| `boot-process` | 1 | `boot-process` | `review-needed` |
| `borrowing` | 1 | `borrowing` | `review-needed` |
| `broken-access-control` | 1 | `auth-session` | `review-needed` |
| `burp-suite` | 1 | `web-enum` | `review-needed` |
| `caching` | 1 | `dns` | `review-needed` |
| `caesar-cipher` | 1 | `caesar-cipher` | `review-needed` |
| `change-management` | 1 | `change-management` | `review-needed` |
| `cia-triad` | 1 | `cia-triad` | `review-needed` |
| `cmd-basics` | 1 | `cmd-basics` | `review-needed` |
| `compliance` | 1 | `compliance` | `review-needed` |
| `containers` | 1 | `containers` | `review-needed` |
| `control-flow-review` | 1 | `control-flow-review` | `review-needed` |
| `cookies` | 1 | `headers-cookies` | `safe auto-fix` |
| `crawling-indexing` | 1 | `recon` | `review-needed` |
| `datastore-management` | 1 | `datastore-management` | `review-needed` |
| `defender` | 1 | `defender` | `review-needed` |
| `detection-engineering` | 1 | `detection` | `safe auto-fix` |
| `dialog-functions` | 1 | `dialog-functions` | `review-needed` |
| `diffie-hellman` | 1 | `diffie-hellman` | `review-needed` |
| `dig` | 1 | `dns` | `review-needed` |
| `directory-discovery` | 1 | `web-enum` | `safe auto-fix` |
| `display-filters` | 1 | `pcap` | `review-needed` |
| `docker-tooling` | 1 | `docker-tooling` | `review-needed` |
| `email` | 1 | `email` | `review-needed` |
| `encapsulation` | 1 | `encapsulation` | `review-needed` |
| `error-handling` | 1 | `error-handling` | `review-needed` |
| `evidence-logging` | 1 | `logging` | `safe auto-fix` |
| `file-integrity` | 1 | `file-integrity` | `review-needed` |
| `file-io` | 1 | `file-io` | `review-needed` |
| `firewalling` | 1 | `firewalling` | `review-needed` |
| `firewalls` | 1 | `firewalls` | `review-needed` |
| `firmware` | 1 | `firmware` | `review-needed` |
| `ftp` | 1 | `ftp` | `review-needed` |
| `fundamentals` | 1 | `remove` | `reject/remove` |
| `google-dorking` | 1 | `recon` | `review-needed` |
| `gui-basics` | 1 | `gui-basics` | `review-needed` |
| `hash-identification` | 1 | `hash-identification` | `review-needed` |
| `headers` | 1 | `headers-cookies` | `review-needed` |
| `hexadecimal` | 1 | `hexadecimal` | `review-needed` |
| `hmac` | 1 | `hmac` | `review-needed` |
| `host-discovery` | 1 | `recon` | `review-needed` |
| `html-basics` | 1 | `html-basics` | `review-needed` |
| `http-messages` | 1 | `http-basics` | `safe auto-fix` |
| `http-traffic-inspection` | 1 | `http-traffic-inspection` | `review-needed` |
| `iam` | 1 | `iam` | `review-needed` |
| `idor` | 1 | `auth-session` | `review-needed` |
| `imports` | 1 | `imports` | `review-needed` |
| `incident-response` | 1 | `ir-basics` | `safe auto-fix` |
| `infra-basics` | 1 | `infra-basics` | `review-needed` |
| `ip-subnetting` | 1 | `tcp-ip` | `review-needed` |
| `javascript-basics` | 1 | `javascript-basics` | `review-needed` |
| `js-basics` | 1 | `js-basics` | `review-needed` |
| `jtr-workflows` | 1 | `jtr-workflows` | `review-needed` |
| `lan` | 1 | `lan` | `review-needed` |
| `learning-roadmap` | 1 | `learning-roadmap` | `review-needed` |
| `lfi-path-traversal` | 1 | `input-validation` | `review-needed` |
| `libpcap` | 1 | `pcap` | `review-needed` |
| `loops` | 1 | `loops` | `review-needed` |
| `malware-history` | 1 | `remove` | `reject/remove` |
| `memory-hierarchy` | 1 | `memory-hierarchy` | `review-needed` |
| `minification-obfuscation` | 1 | `minification-obfuscation` | `review-needed` |
| `module-discovery` | 1 | `module-discovery` | `review-needed` |
| `modulo` | 1 | `modulo` | `review-needed` |
| `msfconsole` | 1 | `msfconsole` | `review-needed` |
| `name-resolution` | 1 | `dns` | `review-needed` |
| `nat` | 1 | `nat` | `review-needed` |
| `network-triage` | 1 | `triage` | `safe auto-fix` |
| `networking-history` | 1 | `remove` | `reject/remove` |
| `ntlm` | 1 | `ntlm` | `review-needed` |
| `number-systems` | 1 | `number-systems` | `review-needed` |
| `outlook-security` | 1 | `outlook-security` | `review-needed` |
| `ownership` | 1 | `ownership` | `review-needed` |
| `package-management` | 1 | `package-management` | `review-needed` |
| `packet-analysis` | 1 | `pcap` | `review-needed` |
| `packet-capture` | 1 | `pcap` | `review-needed` |
| `password-cracking` | 1 | `password-cracking` | `review-needed` |
| `password-hashing` | 1 | `password-hashing` | `review-needed` |
| `patching` | 1 | `patching` | `review-needed` |
| `pattern-matching` | 1 | `detection` | `review-needed` |
| `payload-selection` | 1 | `payload-selection` | `review-needed` |
| `pcap-analysis` | 1 | `pcap` | `review-needed` |
| `pcap-filters` | 1 | `pcap` | `review-needed` |
| `pgp-gpg` | 1 | `pgp-gpg` | `review-needed` |
| `phishing-awareness` | 1 | `phishing-awareness` | `review-needed` |
| `ping` | 1 | `tcp-ip` | `review-needed` |
| `policies` | 1 | `policies` | `review-needed` |
| `policy-exceptions` | 1 | `policy-exceptions` | `review-needed` |
| `port-scanning` | 1 | `port-scanning` | `review-needed` |
| `process-triage` | 1 | `triage` | `safe auto-fix` |
| `prompt-injection` | 1 | `input-validation` | `review-needed` |
| `public-key-crypto` | 1 | `public-key-crypto` | `review-needed` |
| `race-conditions` | 1 | `race-conditions` | `review-needed` |
| `rce` | 1 | `input-validation` | `review-needed` |
| `record-types` | 1 | `dns` | `safe auto-fix` |
| `request-lifecycle` | 1 | `request-lifecycle` | `review-needed` |
| `research` | 1 | `research` | `review-needed` |
| `response-analysis` | 1 | `response-analysis` | `review-needed` |
| `response-codes` | 1 | `http-basics` | `safe auto-fix` |
| `reverse-shell` | 1 | `reverse-shell` | `review-needed` |
| `rgb-color` | 1 | `rgb-color` | `review-needed` |
| `risk-basics` | 1 | `risk-basics` | `review-needed` |
| `risk-communication` | 1 | `reporting` | `review-needed` |
| `risk-management` | 1 | `risk-management` | `review-needed` |
| `robots-sitemaps` | 1 | `web-enum` | `safe auto-fix` |
| `robots-txt` | 1 | `web-enum` | `safe auto-fix` |
| `role-mapping` | 1 | `role-mapping` | `review-needed` |
| `rsa` | 1 | `rsa` | `review-needed` |
| `rust-basics` | 1 | `rust-basics` | `review-needed` |
| `s3` | 1 | `s3` | `review-needed` |
| `script-integration` | 1 | `script-integration` | `review-needed` |
| `search-engines` | 1 | `recon` | `review-needed` |
| `secure-by-design` | 1 | `secure-by-design` | `review-needed` |
| `secure-design` | 1 | `secure-design` | `review-needed` |
| `security-headers` | 1 | `headers-cookies` | `review-needed` |
| `security-models` | 1 | `security-models` | `review-needed` |
| `seo-basics` | 1 | `seo-basics` | `review-needed` |
| `service-fingerprinting` | 1 | `enum` | `review-needed` |
| `sessions` | 1 | `sessions` | `review-needed` |
| `smb` | 1 | `smb` | `review-needed` |
| `source-analysis` | 1 | `source-analysis` | `review-needed` |
| `source-evaluation` | 1 | `source-evaluation` | `review-needed` |
| `source-review` | 1 | `reporting` | `review-needed` |
| `splunk` | 1 | `logging` | `review-needed` |
| `ssh-key-cracking` | 1 | `ssh-key-cracking` | `review-needed` |
| `sts` | 1 | `sts` | `review-needed` |
| `switching` | 1 | `switching` | `review-needed` |
| `symmetric-crypto` | 1 | `symmetric-crypto` | `review-needed` |
| `systems-thinking` | 1 | `systems-thinking` | `review-needed` |
| `tabletop-exercises` | 1 | `tabletop-exercises` | `review-needed` |
| `tcp-handshake` | 1 | `tcp-ip` | `review-needed` |
| `tcpdump` | 1 | `pcap` | `review-needed` |
| `tcpip-model` | 1 | `tcp-ip` | `safe auto-fix` |
| `tech-fingerprinting` | 1 | `web-enum` | `review-needed` |
| `telnet` | 1 | `telnet` | `review-needed` |
| `timestamps` | 1 | `timestamps` | `review-needed` |
| `tls` | 1 | `tls` | `review-needed` |
| `tls-certs` | 1 | `tls-certs` | `review-needed` |
| `topology` | 1 | `topology` | `review-needed` |
| `unicode` | 1 | `unicode` | `review-needed` |
| `updates` | 1 | `updates` | `review-needed` |
| `url-anatomy` | 1 | `url-anatomy` | `review-needed` |
| `url-encoding` | 1 | `url-encoding` | `review-needed` |
| `user-risk` | 1 | `user-risk` | `review-needed` |
| `utf` | 1 | `utf` | `review-needed` |
| `variables` | 1 | `variables` | `review-needed` |
| `vlan` | 1 | `vlan` | `review-needed` |
| `vulnerability-management` | 1 | `vulnerability-management` | `review-needed` |
| `weak-secrets` | 1 | `weak-secrets` | `review-needed` |
| `web-enumeration` | 1 | `web-enum` | `safe auto-fix` |
| `web-recon` | 1 | `web-enum` | `review-needed` |
| `wordlists` | 1 | `wordlists` | `review-needed` |
| `workflow` | 1 | `reporting` | `reject/remove` |
| `xor` | 1 | `xor` | `review-needed` |
| `yara` | 1 | `detection` | `review-needed` |
| `zero-trust` | 1 | `zero-trust` | `review-needed` |

## Artifacts Proposals

| Drift value | Count | Proposed canonical | Action |
| --- | ---: | --- | --- |
| `room-notes` | 1 | `lab-notes` | `safe auto-fix` |

## Notes

* `domain` drift is mostly coarse-category mismatch. Those values usually compress cleanly back to the smaller public domain list in `TAGS.md`.
* `skills` drift is mostly **schema-approved specialization**. If you want to preserve retrieval quality, many of those values should be documented in `TAGS.md` instead of flattened away.
* The only artifact drift found was `room-notes`, which is a strong candidate to normalize to `lab-notes`.
* `TAGS.md` currently functions as a public-facing subset, while `schemas/taxonomy.json` functions as the actual enforced vocabulary. Long-term, those two sources should either be merged or explicitly documented as `core` vs `extended` taxonomy.
