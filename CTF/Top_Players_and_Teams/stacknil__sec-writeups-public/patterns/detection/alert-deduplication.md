---
maturity: stable
last_reviewed: 2026-07-05
---

# Alert Deduplication

## Signal

What evidence appears?

Many alerts share the same root event, entity, rule, or detection reason and
arrive close together.

Common evidence:

* repeated alerts for the same host, user, file hash, source, or destination
* identical rule IDs or alert names
* near-identical timestamps
* duplicate alerts across sensors that observe the same event
* repeated enrichments of an already-open incident

## Why it matters

What risk does it suggest?

Alert duplication can inflate severity, overwhelm analysts, and hide the real
shape of an incident. Deduplication helps preserve one investigation thread
without losing the supporting evidence.

## False-positive contexts

When can it be benign?

* a campaign hits many truly distinct hosts
* one source repeats the same action over time
* multiple controls detect different stages of the same attack
* alerts look similar but involve different users, assets, or outcomes
* a detection rule intentionally fires per affected entity

## Evidence limits

What must be present before making a claim?

At minimum, show the deduplication key, affected entities, time window, original
alert count, collapsed alert count, and the fields used to decide sameness.

Do not merge alerts only because their titles match. Preserve separate alerts
when the target, stage, result, or required response is materially different.

## Defensive next step

What should a defender check next?

Create or review the incident-level grouping key, then confirm that the
deduplicated alert still keeps representative timestamps, entities, evidence
links, and severity reasoning.

## Related implementation

[telemetry-lab](https://github.com/stacknil/telemetry-lab)

## Supporting notes

* [Logs Fundamentals](../../notes/80-blue-team/logs-fundamentals.md)
* [Report Writing for SOC L2](../../notes/80-blue-team/soc-l2-report-writing.md)
