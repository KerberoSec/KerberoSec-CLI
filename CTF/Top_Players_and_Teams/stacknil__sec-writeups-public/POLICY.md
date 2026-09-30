# Publication Policy

This repository is public.

Everything published here must be safe to share, compliant with platform rules, and non-actionable outside authorized lab contexts.

## License Scope

Unless a file or section states otherwise, the original written content and
pattern cards in this repository are licensed under [CC BY 4.0](LICENSE).
This license does not grant rights to third-party platform material,
quotations, or linked resources; those remain subject to their own terms.

## Publishing Standard

The default publishing standard in this repo is:

- sanitized by design
- methodology-first
- defensive where useful
- safe for public reading

The purpose of this repository is to document:

- reasoning
- methodology
- engineering lessons
- reusable security patterns

It is not intended to be a weaponized exploitation archive.

## Platform Scope

### TryHackMe

- Sanitized case studies are allowed.
- Notes should emphasize methodology, reasoning, and learning value.
- Defensive framing is preferred when it adds remediation or detection value.

### Hack The Box

- Retired content only, or content explicitly allowed by platform rules.
- Public notes must still be sanitized and report-like.
- Avoid publishing full exploit chains or copy-paste reproduction paths.

### pwn.college

- Meta-notes only.
- Concepts, tooling notes, and general lessons are in scope.
- Challenge write-ups, step-by-step solutions, and challenge-solving scripts are out of scope.

## Prohibited Content

Do not publish:

- live target identifiers tied to real systems
- credentials, tokens, cookies, API keys, SSH keys, or VPN material
- full exploit chains that materially lower the barrier to reproduction
- platform-restricted write-ups that are not allowed for public release
- raw evidence dumps that preserve private or secret-bearing details

## Sanitization Rules

Public write-ups must:

- replace live identifiers with canonical placeholders such as `TARGET_IP`, `TARGET_HOST`, `TARGET_URL`, and `USER_A`
- use the canonical placeholder and redaction policy from [docs/placeholder-policy.md](docs/placeholder-policy.md)
- remove or neutralize secrets and unnecessary raw evidence
- preserve technical meaning without preserving sensitive context

Where relevant, public notes should still retain:

- root cause
- impact
- remediation
- detection or defensive notes

## If You Are Unsure

If a note feels borderline:

- keep it private
- rewrite it as a higher-level pattern note
- or remove the sensitive sections and publish only the reusable lessons

When in doubt, do not publish the raw version.

## Related Docs

- [SANITIZATION_CHECKLIST.md](SANITIZATION_CHECKLIST.md)
- [docs/publication-workflow.md](docs/publication-workflow.md)
- [docs/placeholder-policy.md](docs/placeholder-policy.md)
- [templates/writeup_sanitized.md](templates/writeup_sanitized.md)
