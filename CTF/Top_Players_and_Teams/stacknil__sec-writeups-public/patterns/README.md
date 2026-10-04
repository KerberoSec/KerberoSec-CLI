# Pattern Library

This is the stable entry point for reusable security detection, triage, and
review patterns. Read these cards before browsing the larger source-note
archive when you need a compact, evidence-bounded defensive workflow.

Current extraction metric: **8 stable reusable security patterns extracted
from 10 distinct supporting notes**.

## Featured Stable Patterns

| Pattern | Primary implementation |
| --- | --- |
| [Parser uncertainty](parsing/parser-uncertainty.md) | LogLens |
| [Authentication burst triage](auth/authentication-burst-triage.md) | LogLens |
| [Multi-user probing](auth/multi-user-probing.md) | LogLens |
| [Alert deduplication](detection/alert-deduplication.md) | telemetry-lab |
| [Bounded correlation](detection/bounded-correlation.md) | telemetry-lab |
| [Repository baseline governance](repository/repository-baseline-governance.md) | repo-sentinel-lite |
| [SBOM policy warning](supply-chain/sbom-policy-warning.md) | sbom-diff-and-risk |
| [Human verification boundary](ai/human-verification-boundary.md) | telemetry-lab |

## Reviewed Patterns

These cards remain useful but are not part of the featured stable set:

* [SSH brute-force triage](auth/ssh-bruteforce-triage.md)
* [Sudo burst review](auth/sudo-burst-review.md)
* [Cooldown suppression](detection/cooldown-suppression.md)
* [IAM policy attachment review](cloud/iam-policy-attachment-review.md)
* [SBOM dependency diff review](supply-chain/sbom-dependency-diff-review.md)

## Maturity Model

| Maturity | Meaning |
| --- | --- |
| `draft` | Useful hypothesis; evidence or implementation bridge is still incomplete. |
| `reviewed` | Structurally reviewed and supported, but not yet promoted as a stable library entry. |
| `stable` | Evidence-bounded, linked to a core implementation, and supported by at least one source note. |

Every card records `maturity` and `last_reviewed` in front matter. The review
date is evaluated against the UTC calendar date
(`datetime.now(timezone.utc).date()`), so local timezone differences cannot
make a same-day review look like future provenance. Future provenance claims
fail validation, and the contract tests inject the clock rather than depending
on the machine's current date.

## Card Contract

Every card uses the same body fields:

1. **Signal**
2. **Why it matters**
3. **False-positive contexts**
4. **Evidence limits**
5. **Defensive next step**
6. **Related implementation**
7. **Supporting notes**

The evidence-limits field is the claim boundary: a card should guide an
investigation without turning a weak signal into an unsupported conclusion.

## Automated Contract

`python scripts/check_pattern_library.py` verifies that:

* every card has valid maturity metadata and the fixed section order
* every stable card links to an approved core implementation
* every stable card links to at least one source note under `notes/` or `TryHackMe/`
* the featured set contains between six and eight stable cards
* every configured flagship case study links back to at least one pattern
* the extraction metric matches the current stable-card provenance graph

## Flagship Case Studies

* [ContAInment](../notes/80-blue-team/containment-public.md)
* [AI Forensics](../notes/80-blue-team/ai-forensics-public.md)
* [Understanding AI Supply Chains](../notes/80-blue-team/understanding-ai-supply-chains-public.md)

## Project Bridges

| Pattern area | Related project |
| --- | --- |
| Parsing and authentication | [LogLens](https://github.com/stacknil/LogLens) |
| Detection and human review | [telemetry-lab](https://github.com/stacknil/telemetry-lab) |
| Repository governance | [repo-sentinel-lite](https://github.com/stacknil/repo-sentinel-lite) |
| Supply-chain review | [sbom-diff-and-risk](https://github.com/stacknil/scientific-computing-toolkit/tree/main/tools/sbom-diff-and-risk) |
