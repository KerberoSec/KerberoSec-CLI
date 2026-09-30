---
maturity: stable
last_reviewed: 2026-07-05
---

# SBOM Policy Warning

## Signal

What evidence appears?

A dependency diff matches a local policy rule and produces a warning without a
blocking decision.

Common evidence:

* an added, removed, or changed package
* a named policy rule matched to the component
* warning severity recorded in JSON, Markdown, or SARIF
* a non-blocking process exit
* an explanation linking the diff to the policy decision

## Why it matters

What risk does it suggest?

A warning identifies dependency change that requires human review. It makes
local policy visible without overstating the package as malicious, vulnerable,
or unsafe.

## False-positive contexts

When can it be benign?

* an approved package is added for a documented feature
* a lockfile refresh introduces expected transitive changes
* an offline policy lacks vulnerability or repository context
* a policy intentionally warns on every new package
* the changed component is development-only or platform-specific

## Evidence limits

What must be present before making a claim?

Show the before and after component state, matched policy rule, observed value,
severity source, decision reason, and whether the outcome blocks the build.

Do not convert an offline policy warning into a CVE, malware, package-safety,
or current repository-reputation verdict.

## Defensive next step

What should a defender check next?

Review why the dependency changed, its provenance and license, the intended
pull request, available vulnerability evidence, and whether local policy
should remain warning-only or become blocking.

## Related implementation

[sbom-diff-and-risk policy warning reviewer case](https://github.com/stacknil/scientific-computing-toolkit/blob/main/tools/sbom-diff-and-risk/docs/policy-warning-reviewer-case.md)

## Supporting notes

* [Understanding AI Supply Chains](../../notes/80-blue-team/understanding-ai-supply-chains-public.md)
* [Vulnerabilities 101](../../notes/10-web/foundations/vulnerabilities-101-public.md)
