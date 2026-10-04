---
maturity: stable
last_reviewed: 2026-07-05
---

# Multi-User Probing

## Signal

What evidence appears?

One source, host, token, or session attempts authentication against many
different user accounts within a bounded time window.

Common evidence:

* many distinct usernames from one source
* low attempt count per user
* attempts ordered alphabetically or by common account names
* failures across disabled, nonexistent, and valid accounts
* activity spread across SSH, VPN, SSO, or application login events

## Why it matters

What risk does it suggest?

The pattern may indicate username enumeration, password spraying, credential
stuffing, or preparation for a later targeted login attempt. It is often quieter
than single-account brute force because each account may see only a few
failures.

## False-positive contexts

When can it be benign?

* a corporate scanner tests authentication controls
* an identity migration or audit tool validates many accounts
* an application bug retries login against the wrong identity field
* a shared NAT or proxy groups unrelated users behind one source
* a helpdesk workflow checks multiple locked or disabled accounts

## Evidence limits

What must be present before making a claim?

At minimum, show the source identity, distinct account count, attempt count,
time window, target service, and outcome distribution. Include whether the
attempts reached real accounts or only invalid usernames when that data exists.

Do not claim password spraying unless the attempt pattern shows low-volume,
multi-account guessing rather than ordinary repeated failure by one user.

## Defensive next step

What should a defender check next?

Group the attempts by source, username, and service. Then check for later
successful logins, lockouts, MFA challenges, impossible travel, and whether the
same source probed other exposed services.

## Related implementation

[LogLens](https://github.com/stacknil/LogLens)

## Supporting notes

* [Logs Fundamentals](../../notes/80-blue-team/logs-fundamentals.md)
* [SOC Fundamentals](../../notes/80-blue-team/soc-fundamentals.md)
