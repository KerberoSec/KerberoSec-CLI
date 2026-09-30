---
maturity: stable
last_reviewed: 2026-07-05
---

# Bounded Correlation

## Signal

What evidence appears?

Multiple event types become meaningful only when correlated within a defined
time window, entity scope, and sequence.

Common evidence:

* authentication event followed by privileged action
* file creation followed by process execution
* alert followed by network connection
* identity change followed by cloud API activity
* repeated low-severity events that form a higher-risk chain together

## Why it matters

What risk does it suggest?

Bounded correlation helps detect behaviour that individual rules miss. It also
keeps detection logic honest by requiring a specific relationship rather than
loosely connecting unrelated events.

## False-positive contexts

When can it be benign?

* maintenance workflows naturally create the same sequence
* automated deployment pipelines touch many systems quickly
* one user has legitimate access across all correlated entities
* the time window is too broad and catches unrelated events
* entity mapping is weak, such as shared IPs or reused hostnames

## Evidence limits

What must be present before making a claim?

At minimum, show the event sequence, correlation window, join key, affected
entities, event outcomes, and why the relationship is stronger than simple
co-occurrence.

Do not claim an attack chain if the events only share a vague time range. The
claim needs a bounded relationship that another analyst can reproduce.

## Defensive next step

What should a defender check next?

Validate the join key and time window against known benign workflows. Then
review whether the correlated sequence produces a clear investigation action,
such as session review, host isolation decision, or identity reset.

## Related implementation

[telemetry-lab](https://github.com/stacknil/telemetry-lab)

## Supporting notes

* [Logs Fundamentals](../../notes/80-blue-team/logs-fundamentals.md)
* [Incident Response Fundamentals](../../notes/80-blue-team/incident-response-fundamentals.md)
