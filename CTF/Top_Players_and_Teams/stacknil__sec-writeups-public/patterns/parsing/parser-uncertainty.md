---
maturity: stable
last_reviewed: 2026-07-05
---

# Parser Uncertainty

## Signal

What evidence appears?

A parser reports unsupported, malformed, or unclassified input alongside the
records it successfully normalized.

Common evidence:

* non-zero unparsed or warning counts
* line-numbered parser warnings
* unknown-message categories or pattern buckets
* a parse-success rate below 100 percent
* source lines excluded from downstream detection input

## Why it matters

What risk does it suggest?

Silent parser gaps can make missing detections look like negative security
evidence. Visible uncertainty lets a reviewer distinguish "the rule did not
match" from "the parser did not understand the input."

## False-positive contexts

When can it be benign?

* a new but harmless log format appears after an upgrade
* blank, comment, or health-check lines are intentionally ignored
* a synthetic fixture includes malformed records for testing
* a supported program emits an irrelevant message variant
* mixed log sources are sent to a parser with a deliberately narrow scope

## Evidence limits

What must be present before making a claim?

Show total, parsed, skipped, and unparsed counts; representative source lines;
the parser category; and whether unsupported lines entered detector input.

Do not claim that an event was absent when relevant input remained unparsed.
Parser telemetry describes coverage boundaries, not attacker intent or system
compromise.

## Defensive next step

What should a defender check next?

Sample the unsupported records, decide whether they are relevant to the
investigation, and either add a tested parser case or document why the input
remains outside the supported contract.

## Related implementation

[LogLens parser uncertainty case study](https://github.com/stacknil/LogLens/blob/main/docs/case-study-parser-uncertainty-as-evidence.md)

## Supporting notes

* [Logs Fundamentals](../../notes/80-blue-team/logs-fundamentals.md)
* [AI Forensics](../../notes/80-blue-team/ai-forensics-public.md)
