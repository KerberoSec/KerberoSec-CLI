---
maturity: reviewed
last_reviewed: 2026-07-05
---

# Cooldown Suppression

## Signal

What evidence appears?

A detection rule fires repeatedly for the same entity or condition, then
suppresses additional alerts for a defined cooldown window.

Common evidence:

* first alert is emitted normally
* later matching events are recorded but not promoted to new alerts
* suppression reason includes a rule ID, entity key, and expiry time
* alert volume drops while raw events continue
* cooldown state resets after the window expires

## Why it matters

What risk does it suggest?

Cooldown suppression reduces alert fatigue, but it can also hide repeated
activity if the suppression key is too broad or the cooldown window is too long.
The control should reduce noise without erasing escalation signals.

## False-positive contexts

When can it be benign?

* noisy but low-risk health checks
* repeated scanner traffic already under investigation
* known lab or test traffic
* one benign automation job retriggering the same condition
* expected retry behaviour from a monitored service

## Evidence limits

What must be present before making a claim?

At minimum, show the original alert, suppression key, cooldown duration,
suppressed event count, affected entities, and whether any suppressed event had
a different outcome or severity.

Do not call suppression safe unless raw events remain queryable and the
suppression logic preserves escalation criteria.

## Defensive next step

What should a defender check next?

Review suppressed events for changes in user, host, destination, success state,
or command behaviour. Tune the cooldown key so repeated identical noise is
suppressed while meaningful changes still create a new alert.

## Related implementation

[telemetry-lab](https://github.com/stacknil/telemetry-lab)

## Supporting notes

* [Logs Fundamentals](../../notes/80-blue-team/logs-fundamentals.md)
* [SOC Fundamentals](../../notes/80-blue-team/soc-fundamentals.md)
