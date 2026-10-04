---
type: resource-note
status: done
created: 2026-02-15
updated: 2026-03-12
tags: [security-writeup, tryhackme, event, idor, broken-access-control]
source: TryHackMe: Love at First Breach 2026: LoveLetterLocker
platform: tryhackme
room: Love at First Breach 2026: LoveLetterLocker
slug: lafb2026-loveletterlocker
path: TryHackMe/90-events/love-at-first-breach-2026/LoveLetterLocker.md
topic: 90-events
domain: [web, access-control]
skills: [idor, broken-access-control, web-enum]
artifacts: [lab-notes, pattern-card]
sanitized: true
---

# Love at First Breach 2026: LoveLetterLocker

## Executive Summary

- **Objective:** Assess a simple web application that allows authenticated users to create and read stored love letters.
- **Core finding:** The letter detail endpoint uses sequential numeric object identifiers without enforcing per-user authorization.
- **Security impact:** Any authenticated user can enumerate and read letters that belong to other users, resulting in a horizontal privilege escalation and confidentiality loss.
- **Primary remediation:** Enforce server-side object-level authorization on every letter retrieval request.

## Scope and Sanitization

- This note covers an authorized TryHackMe training target only.
- Live host details are replaced with placeholders such as `TARGET_IP`.
- The emphasis is on application logic, impact, and remediation rather than a step-by-step exploit chain.

## Attack Surface

Observed routes from the browser workflow:

- `GET /`
- `GET /register`
- `GET /login`
- `GET /letters`
- `GET /letters/new`
- `GET /letter/<id>`

Signals that made the letter endpoint high priority:

- The application explicitly states that each letter receives a unique archive number.
- The detail route exposes a predictable integer identifier.
- The workflow is stateful and user-specific, which makes authorization boundaries critical.

## Finding 1: Insecure Direct Object Reference in Letter Retrieval

- **Category:** Broken Access Control / IDOR
- **Affected component:** `GET /letter/<id>`
- **Root cause:** The application appears to trust the supplied object identifier without validating whether the active session owns the requested letter.
- **Exploitation logic:** After creating or opening a legitimate letter, the numeric identifier in the URL can be incremented or decremented to request other users' records.
- **Impact:** Private letter contents become readable across account boundaries, which is a direct confidentiality failure.
- **Remediation:** Bind every letter lookup to the authenticated owner, return `403` for unauthorized access, and treat untrusted object identifiers as input that must pass authorization checks.
- **Detection ideas:** Alert on sequential access to many nearby object IDs, repeated `GET /letter/<id>` requests across multiple IDs in a short interval, and mismatches between session identity and object ownership.
- **Generalizable lesson:** Predictable identifiers are not the vulnerability by themselves; the vulnerability is missing server-side authorization.

## Method and Decision Notes

High-level workflow used during the lab:

1. Register a test account.
2. Authenticate and access the letter list.
3. Create a letter to observe normal application behavior.
4. Open the saved letter and inspect the detail URL format.
5. Modify the numeric identifier and compare the returned content.

Why this path mattered:

- The route design exposed a classic object reference pattern.
- The UI hint about archive numbers suggested straightforward enumeration risk.
- No specialized tooling was required; the browser alone was sufficient to validate the finding.

## Evidence

Sanitized observations captured from the session:

- The application displays a total letter count in the archive, which can reinforce enumeration assumptions.
- The letter detail page resolves cleanly when the numeric identifier is changed.
- A flag was observed on one retrieved page: `THM{1_c4n_r3ad_4ll_l3tt3rs_w1th_th1s_1d0r}`.

Suggested supporting asset layout:

- `assets/screenshots/` for redacted screenshots
- `assets/evidence.md` for short sanitized evidence notes

## Detection and Defensive Notes

- **Preventive controls:** Enforce object-level authorization on read, update, and delete operations; use indirect or non-guessable identifiers as a secondary hardening measure, not a replacement for authorization.
- **Detective controls:** Log denied access attempts, monitor for sequential resource access, and correlate abnormal enumeration behavior to authenticated sessions.
- **Hardening opportunities:** Avoid exposing global record counts when they provide attackers with enumeration guidance.
- **Residual risk:** UUIDs reduce guessability but do not solve the issue if ownership checks are still missing.

## Takeaways

- IDOR is usually a business-logic failure, not a transport or cryptography problem.
- Any route shaped like `/resource/<int>` should trigger an immediate authorization review.
- Public-safe write-ups are stronger when they explain the reasoning path, not just the final flag.

## References

- OWASP Top 10: Broken Access Control
- OWASP: Insecure Direct Object Reference
