---
maturity: reviewed
last_reviewed: 2026-07-05
---

# IAM Policy Attachment Review

## Signal

What evidence appears?

An IAM policy is attached to a user, group, role, service account, or workload
identity, especially when the policy grants broad access or appears outside a
normal change window.

Common evidence:

* policy attachment event in cloud audit logs
* newly attached administrator or wildcard permission policy
* attachment to a rarely used identity
* policy added shortly before suspicious API activity
* attachment performed by an unusual actor or automation principal

## Why it matters

What risk does it suggest?

Policy attachment can immediately expand what an identity can read, change, or
destroy. Suspicious attachments may indicate privilege escalation,
persistence, lateral movement preparation, or accidental over-permissioning.

## False-positive contexts

When can it be benign?

* approved access request or break-glass workflow
* infrastructure-as-code deployment
* role migration or permission refactor
* temporary incident response access
* managed service or cloud control plane updating expected permissions

## Evidence limits

What must be present before making a claim?

At minimum, show the actor, target identity, policy name or policy document,
timestamp, source system, approval or deployment context, and whether the
attached permissions materially changed effective access.

Do not claim privilege escalation from an attachment event alone. The claim
needs risky permissions, unusual actor context, missing approval, or suspicious
activity after the change.

## Defensive next step

What should a defender check next?

Compare the new effective permissions with the identity's baseline. Then review
recent API calls by the actor and target identity, associated change tickets,
infrastructure commits, and whether the policy should be rolled back or scoped
down.

## Related implementation

[telemetry-lab](https://github.com/stacknil/telemetry-lab)

## Supporting notes

* [Cloud Security Pitfalls](../../notes/80-blue-team/40-cloud/cloud-security-pitfalls.md)
