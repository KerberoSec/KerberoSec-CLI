---
maturity: stable
last_reviewed: 2026-07-05
---

# Human Verification Boundary

## Signal

What evidence appears?

An AI-assisted workflow produces a classification, summary, recovered clue, or
draft finding that could influence an investigation or response decision.

Common evidence:

* model-generated triage labels or case summaries
* AI-selected anomalies or suspicious artefacts
* a proposed timeline assembled from multiple sources
* a decoded or reconstructed candidate result
* an AI output queued for analyst approval

## Why it matters

What risk does it suggest?

AI can reduce review time, but non-determinism, weak source data, prompt
injection, and plausible false conclusions can move uncertainty into the final
case record. Human verification is the boundary between assistance and verdict.

## False-positive contexts

When can it be benign?

* the output is clearly labeled as a draft
* deterministic rules already selected the bounded evidence
* the model only reformats analyst-approved facts
* a human independently checks every cited artefact
* rejected outputs remain visible in an audit trail

## Evidence limits

What must be present before making a claim?

Preserve the source artefacts, deterministic pre-model selection, model input
boundary, output schema, validation result, and human decision.

Do not treat fluent model output as evidence. The final claim must be traceable
to independently reviewable artefacts, and the accountable decision must remain
human-owned.

## Defensive next step

What should a defender check next?

Reproduce the finding from original evidence, inspect rejected or alternate
outputs, check for prompt-injection exposure, and record the analyst's approval,
correction, or rejection.

## Related implementation

[telemetry-lab AI-assisted detection reviewer pack](https://github.com/stacknil/telemetry-lab/blob/main/docs/ai-assisted-detection-reviewer-pack.md)

## Supporting notes

* [AI Forensics](../../notes/80-blue-team/ai-forensics-public.md)
* [ContAInment](../../notes/80-blue-team/containment-public.md)
* [Prompt Defence](../../notes/80-blue-team/prompt-defence-public.md)
