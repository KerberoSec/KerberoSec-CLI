---
maturity: reviewed
last_reviewed: 2026-07-05
---

# SSH Brute-Force Triage

## Signal

What evidence appears?

Repeated SSH authentication failures against one or more accounts from the same
source, source range, or autonomous system within a short time window.

Common evidence:

* `Failed password` or equivalent SSH failure events
* many attempts against the same account
* many accounts tried from the same source
* occasional `Accepted` event after a failure burst
* repeated activity against port `22` or an alternate SSH port

## Why it matters

What risk does it suggest?

The pattern may indicate credential stuffing, password spraying, brute-force
guessing, or an attacker trying to confirm which accounts exist. A successful
login after the failure burst raises the priority because it may indicate
credential compromise.

## False-positive contexts

When can it be benign?

* a user mistypes a password several times
* a password manager or automation job has stale credentials
* a vulnerability scanner checks exposed SSH services
* a monitoring system tests service availability
* a known administrator reconnects repeatedly during maintenance

## Evidence limits

What must be present before making a claim?

At minimum, show the time window, source address or source identity, target
host, target account or account set, failed-attempt count, and whether any
successful login followed the failures.

Do not claim compromise from failures alone. Escalate the claim only when there
is evidence of successful authentication, post-login activity, or suspicious
session behaviour.

## Defensive next step

What should a defender check next?

Check whether any attempted account had a successful SSH login near the same
time, then review session commands, source reputation, MFA status, account age,
and whether the source has appeared in prior authentication alerts.

## Related implementation

[LogLens](https://github.com/stacknil/LogLens)

## Supporting notes

* [Logs Fundamentals](../../notes/80-blue-team/logs-fundamentals.md)
* [Incident Response Fundamentals](../../notes/80-blue-team/incident-response-fundamentals.md)
