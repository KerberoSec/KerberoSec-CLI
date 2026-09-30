# Taxonomy Decision Log

Date: 2026-03-27

## Summary

This document is the decision source for taxonomy changes derived from earlier normalization review.

Use it together with:

* [docs/taxonomy-closure.md](taxonomy-closure.md) for the current converged state
* [docs/taxonomy-governance.md](taxonomy-governance.md) for the ongoing update rules

## Scope

* Source reviewed: `docs/taxonomy-normalization-plan.md`.
* Scope of this log: every value previously marked `review-needed` in that plan.
* These are proposed decisions only. No note bodies or front matter are changed by this document.
* Decision meanings: `merge-to-existing` collapses to an already-established canonical value, `promote-into-taxonomy` keeps the value as a first-class canonical term, and `drop-as-noise` removes it from future taxonomy use.

## Post-Closure Additions

Date: 2026-04-19

These additions were introduced while normalizing the new `notes/00-foundations/prompt-engineering.md` note.

Existing taxonomy could express the note's broad security-engineering context, but it could not capture the LLM-specific prompt-control concepts cleanly enough for precise retrieval.

| Field | Value | Decision | Canonical / Target | Rationale |
| --- | --- | --- | --- | --- |
| `domain` | `ai-security` | `promote-into-taxonomy` | `ai-security` | Needed as a reusable umbrella for AI and LLM security notes; `security-engineering` alone was too broad for retrieval. |
| `domain` | `llm-security` | `merge-to-existing` | `ai-security` | Keep the narrower historical phrasing available as an alias while converging on one canonical AI-security domain. |
| `skills` | `context-windows` | `promote-into-taxonomy` | `context-windows` | Distinct operating constraint in prompting, memory, and prompt-injection notes. |
| `skills` | `instruction-hierarchy` | `promote-into-taxonomy` | `instruction-hierarchy` | Stable concept for system-vs-user precedence and prompt-conflict analysis. |
| `skills` | `prompt-engineering` | `promote-into-taxonomy` | `prompt-engineering` | Broad but durable prompt-design workflow that will recur across AI security notes. |
| `skills` | `prompt-evaluation` | `promote-into-taxonomy` | `prompt-evaluation` | Needed for prompt-quality review, challenge scoring, and security-workflow evaluation notes. |
| `skills` | `prompt-templates` | `promote-into-taxonomy` | `prompt-templates` | Reusable prompt structures behave like pattern assets and deserve direct retrieval. |
| `skills` | `sampling-controls` | `promote-into-taxonomy` | `sampling-controls` | Covers temperature and top-p style output-control concepts more accurately than generic workflow tags. |
| `skills` | `tokenization` | `promote-into-taxonomy` | `tokenization` | Foundational LLM text-processing concept with direct impact on prompt design and truncation risk. |
| `artifacts` | `prompt-patterns` | `merge-to-existing` | `pattern-card` | Existing `pattern-card` already covers reusable prompt-pattern packs; add an alias instead of expanding the artifact family. |

## Family Summary

| Family | Review-needed values | Total occurrences | Promote | Merge | Drop |
| --- | ---: | ---: | ---: | ---: | ---: |
| `Networking Fundamentals` | 26 | 34 | 24 | 2 | 0 |
| `Identity, Crypto, And Passwords` | 25 | 28 | 21 | 4 | 0 |
| `Governance, Risk, And Security Engineering` | 21 | 21 | 18 | 2 | 1 |
| `Programming And Scripting` | 18 | 21 | 14 | 4 | 0 |
| `Blue Team, Detection, And DFIR` | 16 | 20 | 13 | 3 | 0 |
| `Web And Application Security` | 17 | 17 | 16 | 1 | 0 |
| `Systems And Platform Basics` | 13 | 16 | 12 | 1 | 0 |
| `Data Representation And Transformation` | 13 | 13 | 7 | 5 | 1 |
| `Web Recon And OSINT` | 12 | 13 | 9 | 3 | 0 |
| `Packet Capture And Traffic Analysis` | 10 | 12 | 6 | 4 | 0 |
| `Offensive Tooling And Exploitation` | 9 | 9 | 5 | 3 | 1 |
| `Cloud, IAM, And Containers` | 5 | 5 | 5 | 0 | 0 |
| `Research And Learning Meta` | 4 | 4 | 1 | 0 | 3 |

## Networking Fundamentals

* Decision split: `24` promote, `2` merge, `0` drop.
* Values are ordered by frequency first, then alphabetically within the same frequency band.

| Field | Value | Count | Decision | Rationale |
| --- | --- | ---: | --- | --- |
| `skills` | `icmp` | 3 | `promote-into-taxonomy` | Protocol-specific and common enough to merit direct retrieval. |
| `skills` | `osi-model` | 3 | `promote-into-taxonomy` | Canonical networking foundation concept with repeated use across intro notes. |
| `skills` | `ports` | 2 | `promote-into-taxonomy` | Common service-mapping concept that appears across multiple networking notes. |
| `skills` | `tcp-udp` | 2 | `promote-into-taxonomy` | Transport-layer comparison is distinct enough from the broader TCP/IP model. |
| `skills` | `traceroute` | 2 | `promote-into-taxonomy` | Common path-analysis skill with direct troubleshooting value. |
| `skills` | `vpn` | 2 | `promote-into-taxonomy` | Remote-access and tunnel concepts recur often enough to stay explicit. |
| `domain` | `dns` | 1 | `promote-into-taxonomy` | Standalone protocol domain with enough note depth to justify first-class treatment. |
| `skills` | `addressing` | 1 | `promote-into-taxonomy` | Core addressing concept with high reuse in beginner networking notes. |
| `skills` | `caching` | 1 | `promote-into-taxonomy` | DNS/web caching is a durable concept and not just note-local detail. |
| `skills` | `dig` | 1 | `promote-into-taxonomy` | Stable DNS inspection tool/skill with strong retrieval value. |
| `skills` | `email` | 1 | `promote-into-taxonomy` | Protocol/service-level email handling is distinct from email-security as a domain. |
| `skills` | `encapsulation` | 1 | `promote-into-taxonomy` | Foundational packet-model concept worth keeping explicit. |
| `skills` | `firewalling` | 1 | `merge-to-existing` | Merge to `firewalls`; the gerund form does not add separate taxonomy value. |
| `skills` | `firewalls` | 1 | `promote-into-taxonomy` | Broad enough to cover dedicated firewall concepts and controls. |
| `skills` | `ftp` | 1 | `promote-into-taxonomy` | Legacy protocol knowledge still has retrieval value in foundational notes. |
| `skills` | `ip-subnetting` | 1 | `promote-into-taxonomy` | Widely-recognized networking skill that should stay searchable. |
| `skills` | `lan` | 1 | `promote-into-taxonomy` | Distinct local-networking concept used in dedicated fundamentals notes. |
| `skills` | `name-resolution` | 1 | `promote-into-taxonomy` | Specific DNS behavior worth preserving for precise retrieval. |
| `skills` | `nat` | 1 | `promote-into-taxonomy` | Common boundary/network design concept with independent search value. |
| `skills` | `ping` | 1 | `merge-to-existing` | Merge to `icmp`; ping is the common operation against the broader ICMP concept. |
| `skills` | `port-scanning` | 1 | `promote-into-taxonomy` | Specific recon action with better precision than a generic network tag. |
| `skills` | `switching` | 1 | `promote-into-taxonomy` | Distinct LAN concept that should remain first-class. |
| `skills` | `tcp-handshake` | 1 | `promote-into-taxonomy` | Handshake behavior is a distinct troubleshooting and analysis concept. |
| `skills` | `telnet` | 1 | `promote-into-taxonomy` | Legacy protocol/service handling is still a recognizable fundamentals skill. |
| `skills` | `topology` | 1 | `promote-into-taxonomy` | Useful network-design concept with retrieval value beyond one note. |
| `skills` | `vlan` | 1 | `promote-into-taxonomy` | Distinct LAN segmentation concept with durable retrieval value. |

## Identity, Crypto, And Passwords

* Decision split: `21` promote, `4` merge, `0` drop.
* Values are ordered by frequency first, then alphabetically within the same frequency band.

| Field | Value | Count | Decision | Rationale |
| --- | --- | ---: | --- | --- |
| `skills` | `hash-cracking` | 2 | `promote-into-taxonomy` | Clear and recurring cracking workflow that should remain explicit. |
| `skills` | `hash-functions` | 2 | `promote-into-taxonomy` | Core primitive family with multiple supporting notes. |
| `skills` | `hash-recognition` | 2 | `promote-into-taxonomy` | Useful preprocessing skill before cracking or triage. |
| `domain` | `authentication` | 1 | `promote-into-taxonomy` | Broad identity and credential domain that recurs across hashing and auth notes. |
| `domain` | `integrity` | 1 | `merge-to-existing` | Merge to `crypto`; integrity is a security property, not a stable top-level domain in this repo. |
| `domain` | `password-security` | 1 | `merge-to-existing` | Merge to `authentication`; password handling is a credential/auth subdomain rather than a separate top-level bucket. |
| `skills` | `archive-cracking` | 1 | `promote-into-taxonomy` | Distinct cracking workflow with enough specificity to stay searchable. |
| `skills` | `asymmetric-crypto` | 1 | `merge-to-existing` | Merge to `public-key-crypto`; both labels describe the same concept and one wording is enough. |
| `skills` | `caesar-cipher` | 1 | `promote-into-taxonomy` | Named crypto primitive with direct educational retrieval value. |
| `skills` | `diffie-hellman` | 1 | `promote-into-taxonomy` | Named key-exchange concept should remain first-class. |
| `skills` | `file-integrity` | 1 | `promote-into-taxonomy` | Common cryptographic validation use case with direct practical value. |
| `skills` | `hash-identification` | 1 | `merge-to-existing` | Merge to `hash-recognition`; the two labels are near-duplicates in practice. |
| `skills` | `hmac` | 1 | `promote-into-taxonomy` | Named cryptographic construct merits direct retrieval. |
| `skills` | `jtr-workflows` | 1 | `promote-into-taxonomy` | Named cracking workflow provides better precision than a generic cracking tag. |
| `skills` | `password-cracking` | 1 | `promote-into-taxonomy` | Stable applied skill that should remain explicit. |
| `skills` | `password-hashing` | 1 | `promote-into-taxonomy` | Distinct from cracking and useful for auth/hashing notes. |
| `skills` | `pgp-gpg` | 1 | `promote-into-taxonomy` | Named tool/ecosystem tag with stable retrieval value. |
| `skills` | `public-key-crypto` | 1 | `promote-into-taxonomy` | Clearer canonical label for asymmetric/public-key topics. |
| `skills` | `rsa` | 1 | `promote-into-taxonomy` | Named algorithm with direct educational retrieval value. |
| `skills` | `ssh-key-cracking` | 1 | `promote-into-taxonomy` | Specific cracking workflow with enough precision to be useful on its own. |
| `skills` | `symmetric-crypto` | 1 | `promote-into-taxonomy` | Distinct primitive family worth keeping separate from public-key topics. |
| `skills` | `tls` | 1 | `promote-into-taxonomy` | Common secure transport concept with strong independent value. |
| `skills` | `tls-certs` | 1 | `promote-into-taxonomy` | Certificate handling is a distinct operational skill within TLS topics. |
| `skills` | `wordlists` | 1 | `promote-into-taxonomy` | Common cracking/recon input material with practical search value. |
| `skills` | `xor` | 1 | `promote-into-taxonomy` | Small but common transform primitive used across intro crypto and malware tasks. |

## Governance, Risk, And Security Engineering

* Decision split: `18` promote, `2` merge, `1` drop.
* Values are ordered by frequency first, then alphabetically within the same frequency band.

| Field | Value | Count | Decision | Rationale |
| --- | --- | ---: | --- | --- |
| `domain` | `governance` | 1 | `merge-to-existing` | Merge to `grc`; the two labels overlap heavily and GRC is the clearer umbrella. |
| `domain` | `grc` | 1 | `promote-into-taxonomy` | Stable umbrella for governance, risk, and compliance notes. |
| `domain` | `security` | 1 | `drop-as-noise` | Too generic to improve retrieval, routing, or future normalization decisions. |
| `domain` | `security-engineering` | 1 | `promote-into-taxonomy` | Clear engineering-focused domain for controls, design, and risk-reduction work. |
| `skills` | `asset-inventory` | 1 | `promote-into-taxonomy` | Core governance and security-engineering practice with durable value. |
| `skills` | `change-management` | 1 | `promote-into-taxonomy` | Operational governance concept that stands on its own. |
| `skills` | `cia-triad` | 1 | `promote-into-taxonomy` | Canonical security-model concept that should remain explicit. |
| `skills` | `compliance` | 1 | `promote-into-taxonomy` | Distinct governance topic with direct search value. |
| `skills` | `policies` | 1 | `promote-into-taxonomy` | Broad enough to cover multiple policy-centered notes and examples. |
| `skills` | `policy-exceptions` | 1 | `promote-into-taxonomy` | Specific governance workflow worth keeping visible. |
| `skills` | `risk-basics` | 1 | `promote-into-taxonomy` | Useful umbrella for entry-level risk notes. |
| `skills` | `risk-communication` | 1 | `promote-into-taxonomy` | Communication of risk is different enough from generic reporting to stay explicit. |
| `skills` | `risk-management` | 1 | `promote-into-taxonomy` | Stable core practice in governance and engineering notes. |
| `skills` | `secure-by-design` | 1 | `promote-into-taxonomy` | Clearer canonical phrasing for design-oriented security thinking. |
| `skills` | `secure-design` | 1 | `merge-to-existing` | Merge to `secure-by-design`; the concepts overlap and the existing phrase is clearer. |
| `skills` | `security-models` | 1 | `promote-into-taxonomy` | Useful umbrella for conceptual security frameworks. |
| `skills` | `systems-thinking` | 1 | `promote-into-taxonomy` | Cross-cutting engineering mindset with reuse beyond one intro note. |
| `skills` | `tabletop-exercises` | 1 | `promote-into-taxonomy` | Distinct preparedness workflow with clear defensive search value. |
| `skills` | `user-risk` | 1 | `promote-into-taxonomy` | Human-risk framing is useful across awareness and governance notes. |
| `skills` | `vulnerability-management` | 1 | `promote-into-taxonomy` | Common defensive program area that deserves direct retrieval. |
| `skills` | `zero-trust` | 1 | `promote-into-taxonomy` | Named architectural/security model with independent value. |

## Programming And Scripting

* Decision split: `14` promote, `4` merge, `0` drop.
* Values are ordered by frequency first, then alphabetically within the same frequency band.

| Field | Value | Count | Decision | Rationale |
| --- | --- | ---: | --- | --- |
| `skills` | `bash-scripting` | 2 | `promote-into-taxonomy` | Practical scripting skill with repeated use in Linux notes. |
| `skills` | `control-flow` | 2 | `promote-into-taxonomy` | Fundamental language concept worth preserving as a reusable skill tag. |
| `skills` | `python-basics` | 2 | `promote-into-taxonomy` | Stable beginner language tag with repeated use in repo notes. |
| `domain` | `programming` | 1 | `promote-into-taxonomy` | The repo already contains language-basics notes that benefit from a dedicated programming domain. |
| `skills` | `borrowing` | 1 | `promote-into-taxonomy` | Rust-specific concept that materially changes program behavior and learning path. |
| `skills` | `control-flow-review` | 1 | `merge-to-existing` | Merge to `control-flow`; the review variant is too narrow for a separate skill. |
| `skills` | `dialog-functions` | 1 | `merge-to-existing` | Merge to `javascript-basics`; function-dialog usage is too narrow for its own lasting bucket. |
| `skills` | `error-handling` | 1 | `promote-into-taxonomy` | Core programming concept with reuse across multiple language notes. |
| `skills` | `file-io` | 1 | `promote-into-taxonomy` | Common coding skill that should remain directly searchable. |
| `skills` | `imports` | 1 | `promote-into-taxonomy` | Core beginner language concept with clear retrieval value. |
| `skills` | `javascript-basics` | 1 | `promote-into-taxonomy` | Clearer canonical wording for beginner JavaScript concepts. |
| `skills` | `js-basics` | 1 | `merge-to-existing` | Merge to `javascript-basics`; keep the clearer long-form wording as canonical. |
| `skills` | `loops` | 1 | `promote-into-taxonomy` | Fundamental programming concept with high educational reuse. |
| `skills` | `minification-obfuscation` | 1 | `promote-into-taxonomy` | Distinct code-analysis concept with value in JavaScript security notes. |
| `skills` | `ownership` | 1 | `promote-into-taxonomy` | Rust ownership is a first-class concept, not just note-local jargon. |
| `skills` | `rust-basics` | 1 | `promote-into-taxonomy` | Stable beginner language tag with clear retrieval value. |
| `skills` | `script-integration` | 1 | `merge-to-existing` | Merge to `javascript-basics`; current usage is too tied to one beginner JavaScript note. |
| `skills` | `variables` | 1 | `promote-into-taxonomy` | Fundamental language concept worth keeping explicit. |

## Blue Team, Detection, And DFIR

* Decision split: `13` promote, `3` merge, `0` drop.
* Values are ordered by frequency first, then alphabetically within the same frequency band.

| Field | Value | Count | Decision | Rationale |
| --- | --- | ---: | --- | --- |
| `skills` | `awareness-training` | 3 | `promote-into-taxonomy` | Organization-facing defensive skill with repeated use across awareness notes. |
| `skills` | `malware-analysis` | 2 | `promote-into-taxonomy` | Stable analysis workflow with multiple dedicated notes. |
| `skills` | `phishing-analysis` | 2 | `promote-into-taxonomy` | More specific and useful than flattening it into generic triage. |
| `domain` | `email-security` | 1 | `promote-into-taxonomy` | Distinct defensive surface with clear retrieval value for phishing and client abuse notes. |
| `domain` | `malware` | 1 | `promote-into-taxonomy` | Malware is a durable subject area with better retrieval value than folding into a larger umbrella. |
| `domain` | `vuln-research` | 1 | `promote-into-taxonomy` | Distinct research workflow with reuse beyond a single detection note. |
| `skills` | `ntlm` | 1 | `promote-into-taxonomy` | Protocol/auth detail with strong retrieval value in Windows detection notes. |
| `skills` | `outlook-security` | 1 | `promote-into-taxonomy` | Product-specific but stable enough to justify direct retrieval for client-abuse notes. |
| `skills` | `patching` | 1 | `promote-into-taxonomy` | Common defensive control and remediation workflow. |
| `skills` | `pattern-matching` | 1 | `merge-to-existing` | Merge to `detection`; the generic matching idea is less useful than the outcome-oriented detection bucket. |
| `skills` | `phishing-awareness` | 1 | `merge-to-existing` | Merge to `awareness-training`; the topic-specific awareness label does not need its own bucket. |
| `skills` | `smb` | 1 | `promote-into-taxonomy` | Protocol-specific detection/Windows retrieval value is high enough to keep it explicit. |
| `skills` | `source-analysis` | 1 | `promote-into-taxonomy` | Directly useful for malware, scripting, and investigation notes. |
| `skills` | `source-review` | 1 | `merge-to-existing` | Merge to `source-analysis`; review is just one mode of source analysis here. |
| `skills` | `splunk` | 1 | `promote-into-taxonomy` | Named detection platform with strong workflow identity. |
| `skills` | `yara` | 1 | `promote-into-taxonomy` | Named detection language/tool with clear independent retrieval value. |

## Web And Application Security

* Decision split: `16` promote, `1` merge, `0` drop.
* Values are ordered by frequency first, then alphabetically within the same frequency band.

| Field | Value | Count | Decision | Rationale |
| --- | --- | ---: | --- | --- |
| `domain` | `access-control` | 1 | `promote-into-taxonomy` | Cross-cutting appsec domain that is broader than a single auth/session skill. |
| `skills` | `broken-access-control` | 1 | `promote-into-taxonomy` | Recognizable vulnerability class with stronger precision than a broad auth/session tag. |
| `skills` | `headers` | 1 | `promote-into-taxonomy` | General header handling is broader than security-only header tags. |
| `skills` | `html-basics` | 1 | `promote-into-taxonomy` | Useful retrieval tag for web-foundation notes. |
| `skills` | `http-traffic-inspection` | 1 | `promote-into-taxonomy` | Distinct inspection workflow beyond generic HTTP basics. |
| `skills` | `idor` | 1 | `promote-into-taxonomy` | Canonical vulnerability class that should remain first-class. |
| `skills` | `lfi-path-traversal` | 1 | `promote-into-taxonomy` | Distinct vuln family with clear retrieval value. |
| `skills` | `prompt-injection` | 1 | `promote-into-taxonomy` | Emerging but stable enough attack class to keep explicit. |
| `skills` | `race-conditions` | 1 | `promote-into-taxonomy` | Distinct vulnerability/concurrency class with direct retrieval value. |
| `skills` | `rce` | 1 | `promote-into-taxonomy` | Widely-recognized exploitation outcome with strong search value. |
| `skills` | `request-lifecycle` | 1 | `promote-into-taxonomy` | Useful application-flow concept that is not covered by HTTP basics alone. |
| `skills` | `response-analysis` | 1 | `promote-into-taxonomy` | Distinct analysis action worth preserving for web debugging and review notes. |
| `skills` | `security-headers` | 1 | `promote-into-taxonomy` | Common hardening topic with strong independent retrieval value. |
| `skills` | `sessions` | 1 | `merge-to-existing` | Merge to `auth-session`; the broader canonical session/auth bucket is already established. |
| `skills` | `url-anatomy` | 1 | `promote-into-taxonomy` | Specific foundational concept with clear beginner search value. |
| `skills` | `url-encoding` | 1 | `promote-into-taxonomy` | Frequently reused transformation skill in web notes. |
| `skills` | `weak-secrets` | 1 | `promote-into-taxonomy` | Useful security pattern tag that generalizes beyond a single room. |

## Systems And Platform Basics

* Decision split: `12` promote, `1` merge, `0` drop.
* Values are ordered by frequency first, then alphabetically within the same frequency band.

| Field | Value | Count | Decision | Rationale |
| --- | --- | ---: | --- | --- |
| `domain` | `hardware` | 2 | `promote-into-taxonomy` | Distinct subject area for computer architecture and system-internals notes. |
| `skills` | `hardware-basics` | 2 | `promote-into-taxonomy` | Useful entry-level systems concept with repeated use. |
| `skills` | `shell-basics` | 2 | `promote-into-taxonomy` | Core command-line operating skill with repeated beginner-note use. |
| `skills` | `bitlocker` | 1 | `promote-into-taxonomy` | Named platform feature with clear retrieval value. |
| `skills` | `boot-process` | 1 | `promote-into-taxonomy` | Distinct system lifecycle concept that is broader than a single vendor feature. |
| `skills` | `cmd-basics` | 1 | `promote-into-taxonomy` | Stable Windows fundamentals skill that should stay explicit. |
| `skills` | `defender` | 1 | `promote-into-taxonomy` | Named platform/security feature with direct practitioner search value. |
| `skills` | `firmware` | 1 | `promote-into-taxonomy` | Hardware-adjacent systems concept worth keeping explicit. |
| `skills` | `gui-basics` | 1 | `promote-into-taxonomy` | Beginner-facing platform skill with value in Windows fundamentals notes. |
| `skills` | `infra-basics` | 1 | `promote-into-taxonomy` | Useful umbrella for system and environment basics. |
| `skills` | `memory-hierarchy` | 1 | `promote-into-taxonomy` | Specific computer-systems concept with educational retrieval value. |
| `skills` | `package-management` | 1 | `promote-into-taxonomy` | Common admin skill worth keeping separate from generic shell work. |
| `skills` | `updates` | 1 | `merge-to-existing` | Merge to `patching`; update mechanics are already covered by the stronger canonical term. |

## Data Representation And Transformation

* Decision split: `7` promote, `5` merge, `1` drop.
* Values are ordered by frequency first, then alphabetically within the same frequency band.

| Field | Value | Count | Decision | Rationale |
| --- | --- | ---: | --- | --- |
| `domain` | `binary` | 1 | `merge-to-existing` | Merge to `foundations`; current usage is binary representation, not binary exploitation. |
| `domain` | `data-transformation` | 1 | `promote-into-taxonomy` | Useful umbrella for CyberChef-style transform, decode, and normalize workflows. |
| `domain` | `encoding` | 1 | `merge-to-existing` | Merge to `data-transformation`; the narrower encoding slice does not need its own domain. |
| `domain` | `math-fundamentals` | 1 | `merge-to-existing` | Merge to `foundations`; the current use is supportive theory, not a standalone write-up domain. |
| `skills` | `ascii` | 1 | `promote-into-taxonomy` | Canonical encoding concept with direct educational retrieval value. |
| `skills` | `base-encodings` | 1 | `promote-into-taxonomy` | Useful umbrella for base64 and related encoding workflows. |
| `skills` | `binary` | 1 | `merge-to-existing` | Merge to `number-systems`; binary representation is part of that broader canonical bucket. |
| `skills` | `hexadecimal` | 1 | `promote-into-taxonomy` | Stable representation concept that appears in multiple beginner notes. |
| `skills` | `modulo` | 1 | `promote-into-taxonomy` | Specific arithmetic concept that supports crypto/math notes. |
| `skills` | `number-systems` | 1 | `promote-into-taxonomy` | Clear umbrella for representation-focused fundamentals. |
| `skills` | `rgb-color` | 1 | `drop-as-noise` | Too narrow and display-specific to earn a lasting taxonomy slot. |
| `skills` | `unicode` | 1 | `promote-into-taxonomy` | Encoding family with durable reuse across text-processing notes. |
| `skills` | `utf` | 1 | `merge-to-existing` | Merge to `unicode`; UTF is a subtype of the broader Unicode family. |

## Web Recon And OSINT

* Decision split: `9` promote, `3` merge, `0` drop.
* Values are ordered by frequency first, then alphabetically within the same frequency band.

| Field | Value | Count | Decision | Rationale |
| --- | --- | ---: | --- | --- |
| `skills` | `whois` | 2 | `promote-into-taxonomy` | Widely-recognized recon step with direct retrieval value. |
| `domain` | `osint` | 1 | `promote-into-taxonomy` | Stable domain for search-source and public-data collection notes. |
| `domain` | `osint-utilities` | 1 | `merge-to-existing` | Merge to `osint`; tooling subtype is better handled as skills than as a separate domain. |
| `skills` | `burp-suite` | 1 | `promote-into-taxonomy` | Tool-specific tag is useful because Burp appears as a stable workflow boundary. |
| `skills` | `crawling-indexing` | 1 | `promote-into-taxonomy` | Search-engine mechanics are distinct enough from simple recon execution. |
| `skills` | `google-dorking` | 1 | `promote-into-taxonomy` | Named technique with strong retrieval value. |
| `skills` | `host-discovery` | 1 | `promote-into-taxonomy` | Common recon subtask that benefits from being explicit. |
| `skills` | `search-engines` | 1 | `promote-into-taxonomy` | Broader conceptual bucket that complements named search techniques. |
| `skills` | `seo-basics` | 1 | `merge-to-existing` | Merge to `search-engines`; SEO context is supportive rather than a primary security skill bucket. |
| `skills` | `service-fingerprinting` | 1 | `promote-into-taxonomy` | Distinct reconnaissance action with value beyond generic enumeration. |
| `skills` | `tech-fingerprinting` | 1 | `merge-to-existing` | Merge to `service-fingerprinting`; the broader fingerprinting label is clearer and already sufficient. |
| `skills` | `web-recon` | 1 | `promote-into-taxonomy` | Useful web-specific recon umbrella that is narrower than generic recon. |

## Packet Capture And Traffic Analysis

* Decision split: `6` promote, `4` merge, `0` drop.
* Values are ordered by frequency first, then alphabetically within the same frequency band.

| Field | Value | Count | Decision | Rationale |
| --- | --- | ---: | --- | --- |
| `skills` | `extractors` | 2 | `promote-into-taxonomy` | Action-oriented transformation skill that appears in multiple tooling notes. |
| `skills` | `wireshark` | 2 | `promote-into-taxonomy` | Widely-used tool tag with strong retrieval value. |
| `skills` | `display-filters` | 1 | `promote-into-taxonomy` | Distinct filtering concept that is more specific than generic pcap handling. |
| `skills` | `libpcap` | 1 | `merge-to-existing` | Merge to `pcap`; the library detail is narrower than the broader capture family. |
| `skills` | `packet-analysis` | 1 | `merge-to-existing` | Merge to `pcap`; current usage overlaps heavily with the existing pcap bucket. |
| `skills` | `packet-capture` | 1 | `merge-to-existing` | Merge to `pcap`; retrieval is still strong at the broader packet-capture family level. |
| `skills` | `pcap-analysis` | 1 | `merge-to-existing` | Merge to `pcap`; near-duplicate of the broader packet-capture/analysis bucket. |
| `skills` | `pcap-filters` | 1 | `promote-into-taxonomy` | Filter syntax and filter strategy are distinct enough to keep explicit. |
| `skills` | `tcpdump` | 1 | `promote-into-taxonomy` | Widely-used CLI tool tag with clear retrieval value. |
| `skills` | `timestamps` | 1 | `promote-into-taxonomy` | Timestamp handling is a real analysis skill across packet, log, and DFIR notes. |

## Offensive Tooling And Exploitation

* Decision split: `5` promote, `3` merge, `1` drop.
* Values are ordered by frequency first, then alphabetically within the same frequency band.

| Field | Value | Count | Decision | Rationale |
| --- | --- | ---: | --- | --- |
| `domain` | `exploitation-basics` | 1 | `promote-into-taxonomy` | Useful offensive umbrella for non-web, non-platform-specific lab notes. |
| `domain` | `metasploit` | 1 | `merge-to-existing` | Merge to `exploitation-basics`; tool-specific domains are narrower than the surrounding offensive topic. |
| `domain` | `security-labs` | 1 | `drop-as-noise` | Lab-ness belongs in artifact/type metadata, not in the subject taxonomy. |
| `skills` | `basic-listener` | 1 | `merge-to-existing` | Merge to `reverse-shell`; listener setup is subordinate to the broader shell workflow. |
| `skills` | `datastore-management` | 1 | `merge-to-existing` | Merge to `msfconsole`; the subfeature is too narrow for a separate lasting tag. |
| `skills` | `module-discovery` | 1 | `promote-into-taxonomy` | Common Metasploit workflow step with direct retrieval value. |
| `skills` | `msfconsole` | 1 | `promote-into-taxonomy` | Named offensive tool with strong workflow identity. |
| `skills` | `payload-selection` | 1 | `promote-into-taxonomy` | Distinct exploitation decision step that merits its own tag. |
| `skills` | `reverse-shell` | 1 | `promote-into-taxonomy` | Widely-recognized lab and exploitation workflow. |

## Cloud, IAM, And Containers

* Decision split: `5` promote, `0` merge, `0` drop.
* Values are ordered by frequency first, then alphabetically within the same frequency band.

| Field | Value | Count | Decision | Rationale |
| --- | --- | ---: | --- | --- |
| `skills` | `containers` | 1 | `promote-into-taxonomy` | Stable platform concept with clear retrieval value. |
| `skills` | `docker-tooling` | 1 | `promote-into-taxonomy` | Named container-tooling workflow deserves direct searchability. |
| `skills` | `iam` | 1 | `promote-into-taxonomy` | Identity and access management is a durable cloud/security concept. |
| `skills` | `s3` | 1 | `promote-into-taxonomy` | Named cloud service with direct practitioner retrieval value. |
| `skills` | `sts` | 1 | `promote-into-taxonomy` | Named identity-token service that is useful to search directly. |

## Research And Learning Meta

* Decision split: `1` promote, `0` merge, `3` drop.
* Values are ordered by frequency first, then alphabetically within the same frequency band.

| Field | Value | Count | Decision | Rationale |
| --- | --- | ---: | --- | --- |
| `skills` | `learning-roadmap` | 1 | `drop-as-noise` | Useful in prose, but too meta to function as stable front matter taxonomy. |
| `skills` | `research` | 1 | `drop-as-noise` | Too generic to separate one note from another in a helpful way. |
| `skills` | `role-mapping` | 1 | `drop-as-noise` | Career/learning framing is better kept in prose than as taxonomy. |
| `skills` | `source-evaluation` | 1 | `promote-into-taxonomy` | Quality-evaluation of sources is a distinct research skill worth preserving. |
