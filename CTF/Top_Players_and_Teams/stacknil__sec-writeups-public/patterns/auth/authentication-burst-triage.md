---
maturity: stable
last_reviewed: 2026-07-05
---

# Authentication Burst Triage

## Signal

What evidence appears?

Authentication failures cluster around one source, account, host, or service
inside a bounded time window.

Common evidence:

* repeated terminal authentication failures
* a threshold crossed inside a documented window
* failures concentrated on one source or target
* username spread within the same burst
* a later success event near the failure cluster

## Why it matters

What risk does it suggest?

The burst can indicate brute-force guessing, password spraying, stale
automation, or concentrated operator activity. It is a triage signal that
helps prioritize review; it is not a compromise verdict.

## False-positive contexts

When can it be benign?

* a user repeatedly enters an old password
* automation continues using rotated credentials
* an approved scanner tests authentication controls
* a shared proxy combines unrelated user failures
* a lab or replay fixture intentionally crosses the threshold

## Evidence limits

What must be present before making a claim?

Show the event type, source and target identities, failure count, threshold,
time window, username distribution, and nearby success outcomes.

Do not infer successful credential compromise from failures alone. A later
success must be joined by source, account, session, or other defensible context
before it is treated as related.

## Defensive next step

What should a defender check next?

Review nearby successes, MFA outcomes, account lockouts, session activity, and
known scanner or automation inventories. Preserve parser warnings that could
change the observed count.

## Related implementation

[LogLens Linux authentication case study](https://github.com/stacknil/LogLens/blob/main/docs/case-study-linux-auth-bruteforce.md)

## Supporting notes

* [Logs Fundamentals](../../notes/80-blue-team/logs-fundamentals.md)
* [Incident Response Fundamentals](../../notes/80-blue-team/incident-response-fundamentals.md)
