# Security Policy

`hackingtool` is a launcher and guidance layer for **authorized** security testing.
This policy covers vulnerabilities **in hackingtool itself**: not in the third-party
tools it can install or run.

## Supported versions

Only the latest released version receives security fixes. Please reproduce on the
current `master` / latest PyPI release before reporting.

| Version | Supported |
|---------|-----------|
| latest release | ✅ |
| older          | ❌ |

## Reporting a vulnerability

**Please do not open a public issue for a security bug.**

Report privately through GitHub's private advisory flow:

➡ **https://github.com/Z4nzu/hackingtool/security/advisories/new**

Include:

- what the vulnerability is and where (file / function / command),
- steps to reproduce (a minimal PoC is ideal),
- the impact you think it has, and
- the version / commit you tested.

We aim to acknowledge within **5 business days** and to ship a fix or a mitigation
plan within **30 days** for a confirmed, in-scope report. We'll credit you in the
release notes unless you ask us not to.

## What's in scope

Vulnerabilities in **hackingtool's own code**, for example:

- **Command / argument injection** in the launcher, orchestrator, or any place user
  or catalog input reaches a subprocess.
- **Unsafe downloads**: a fetch that isn't pinned + SHA-256 verified, or a path that
  reintroduces `curl | bash`.
- **Prompt injection in the AI layer** (recommend / command / summary / report) that
  makes the model fabricate, exfiltrate, or drive an action outside its guardrails: see [OWASP LLM01: Prompt Injection](https://owasp.org/www-project-top-10-for-large-language-model-applications/).
- **Privilege / path issues**: unexpected `sudo`, writing outside the user's
  `~/.hackingtool/` workspace, world-writable files, symlink traversal.
- **Catalog integrity**: a catalog/overlay entry that ships an unsafe command, an
  unpinned installer, or a fabricated invocation.

## What's out of scope

- **The third-party tools themselves.** A bug in nmap, sqlmap, hashcat, etc. belongs
  to that project: report it upstream. hackingtool only launches them.
- **"This software can be used to attack things."** That is the nature of an
  ethical-hacking toolkit. Misuse by an operator against systems they are not
  authorized to test is not a vulnerability in hackingtool. See
  [Authorized use](#authorized-use).
- Findings that require an already-compromised host or physical access.
- Reports from automated scanners with no demonstrated impact.

## Verifying a release

Release artifacts are signed with SLSA build provenance and ship a CycloneDX SBOM,
both attested via Sigstore. Verify what you install:

```bash
# PyPI wheel/sdist and the GitHub release .deb carry build-provenance attestations
gh attestation verify <artifact> --repo Z4nzu/hackingtool

# The SBOM (attached to each GitHub release as hackingtool.cdx.json) is attested too
gh attestation verify dist/hackingtool-*.whl --repo Z4nzu/hackingtool --predicate-type https://cyclonedx.org/bom
```

PyPI uploads additionally carry [PEP 740](https://peps.python.org/pep-0740/) digital
attestations, generated automatically via Trusted Publishing.

## Authorized use

hackingtool is for security testing you are **legally authorized** to perform: your own systems, an engagement with written scope, a lab, or a CTF. Using it against
systems you do not own or have explicit permission to test is illegal and is not a
use we support. Every feature assumes authorized-targets-only, no blanket root, and no
fabricated results.
