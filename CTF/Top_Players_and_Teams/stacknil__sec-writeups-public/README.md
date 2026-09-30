# sec-writeups-public

Public, sanitized security write-ups from authorized labs and training platforms.

> A local-first public knowledge base focused on methodology, reasoning, and reusable security patterns, not copy-paste exploitation.

Original written content and pattern cards are licensed under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/); see [LICENSE](LICENSE). This does not grant rights to third-party platform material, quotations, or linked resources.

## Featured Security Patterns

Current extraction metric: **8 stable reusable security patterns extracted
from 10 distinct supporting notes**.

| Pattern | Review focus |
| --- | --- |
| [Parser uncertainty](patterns/parsing/parser-uncertainty.md) | make unsupported input visible instead of treating it as negative evidence |
| [Authentication burst triage](patterns/auth/authentication-burst-triage.md) | bound failure clusters without claiming compromise |
| [Multi-user probing](patterns/auth/multi-user-probing.md) | distinguish username spread from ordinary repeated failure |
| [Alert deduplication](patterns/detection/alert-deduplication.md) | collapse duplicate alerts without erasing evidence |
| [Bounded correlation](patterns/detection/bounded-correlation.md) | require a reproducible join key, sequence, and window |
| [Repository baseline governance](patterns/repository/repository-baseline-governance.md) | review suppression drift as security-adjacent code |
| [SBOM policy warning](patterns/supply-chain/sbom-policy-warning.md) | explain a warning without inventing a package-safety verdict |
| [Human verification boundary](patterns/ai/human-verification-boundary.md) | keep AI assistance separate from the accountable finding |

The [Pattern Library](patterns/README.md) is the primary reusable output. The
larger note corpus remains its source archive and evidence base.

## At A Glance

Supporting source archive:

- `157` public notes retained as source material
- `100` TryHackMe source notes
- `57` topic-organized source notes under `notes/`
- `9` organized TryHackMe learning tracks
- public governance for taxonomy, placeholders, publication, and maintenance

Best fit for readers who want:

- structured security notes instead of transcript dumps
- reusable concepts rather than challenge spoilers
- a public-safe reference set for web, networking, crypto, forensics, and blue-team basics

## Why This Repo Exists

This repository is built to make security notes easier to:

- read in public
- publish safely
- reuse as patterns
- maintain over time

The emphasis is on:

- **methodology over one-liners**
- **defensive takeaways alongside findings**
- **sanitized publishing by default**
- **structured, reviewable notes instead of raw dump logs**

## What You Will Find

The supporting source corpus is centered on **TryHackMe** and supplemented by a topic-organized `notes/` tree.

| Track | Notes | Focus |
| --- | --- | --- |
| [TryHackMe/00-foundations](TryHackMe/00-foundations) | `29` | intro security, research workflow, tooling basics |
| [TryHackMe/10-web](TryHackMe/10-web) | `8` | web fundamentals, HTTP, JavaScript, app testing basics |
| [TryHackMe/20-linux](TryHackMe/20-linux) | `3` | Linux fundamentals |
| [TryHackMe/30-windows](TryHackMe/30-windows) | `4` | Windows fundamentals |
| [TryHackMe/40-networking](TryHackMe/40-networking) | `13` | networking, protocols, packet analysis |
| [TryHackMe/50-crypto](TryHackMe/50-crypto) | `4` | hashing, public-key crypto, cracking basics |
| [TryHackMe/60-forensics](TryHackMe/60-forensics) | `1` | introductory forensic tooling |
| [TryHackMe/80-blue-team](TryHackMe/80-blue-team) | `6` | SIEM, detection, analyst notes |
| [TryHackMe/90-events](TryHackMe/90-events) | `32` | event and challenge write-ups, sanitized for publication |

Additional source notes outside the TryHackMe tree:

- `notes/` currently contains `57` active public notes

## Start Here

If you are browsing this repo for the first time:

| Goal | Start with |
| --- | --- |
| read reusable security patterns first | [patterns/README.md](patterns/README.md) |
| understand the repo publishing boundary | [POLICY.md](POLICY.md) |
| publish a new public-safe write-up | [SANITIZATION_CHECKLIST.md](SANITIZATION_CHECKLIST.md) |
| understand the full publication flow | [docs/publication-workflow.md](docs/publication-workflow.md) |
| browse governance and maintenance docs | [docs/README.md](docs/README.md) |
| read foundational security notes first | [TryHackMe/00-foundations](TryHackMe/00-foundations) |
| jump straight into web content | [TryHackMe/10-web](TryHackMe/10-web) |
| browse networking notes | [TryHackMe/40-networking](TryHackMe/40-networking) |
| browse blue-team notes | [TryHackMe/80-blue-team](TryHackMe/80-blue-team) |

## Repository Map

```text
sec-writeups-public/
├── patterns/
│   ├── ai/
│   ├── auth/
│   ├── cloud/
│   ├── detection/
│   ├── parsing/
│   ├── repository/
│   └── supply-chain/
├── TryHackMe/
│   ├── 00-foundations/
│   ├── 10-web/
│   ├── 20-linux/
│   ├── 30-windows/
│   ├── 40-networking/
│   ├── 50-crypto/
│   ├── 60-forensics/
│   ├── 80-blue-team/
│   ├── 90-events/
│   └── _meta/
├── docs/
├── reports/
├── schemas/
├── scripts/
└── templates/
```

## How Notes Are Written

Most public notes aim for the same reading experience:

1. **Summary first**: what matters, quickly.
2. **Core concepts next**: enough structure to reuse the idea later.
3. **Lab-safe examples only**: placeholders, no sensitive live details.
4. **Takeaways and references**: remediation, detection, or broader lessons where relevant.

This is intentionally not a “press button, get shell” repository.

## Reading Style

These notes are optimized for fast scanning and later reuse:

- summary-first structure
- consistent headings and glossary sections where useful
- placeholders instead of live identifiers
- emphasis on concepts, workflow, and defensive value

That makes the repo work better as a reference shelf than as a challenge-by-challenge transcript archive.

## Publication Guardrails

Public write-ups in this repo are expected to be:

- sanitized
- authorization-safe
- placeholder-driven
- taxonomy-controlled
- markdownlint-clean on changed files

Short version:

- no real target identifiers
- no secrets, tokens, cookies, or VPN configs
- no weaponized exploit chains
- no raw private evidence dumps
- prefer remediation and detection framing where it helps

Start here before publishing:

- [SANITIZATION_CHECKLIST.md](SANITIZATION_CHECKLIST.md)
- [docs/publication-workflow.md](docs/publication-workflow.md)
- [templates/writeup_sanitized.md](templates/writeup_sanitized.md)

## Maintainer Quick Links

- Docs hub: [docs/README.md](docs/README.md)
- Maintenance quick reference: [docs/maintenance-quick-reference.md](docs/maintenance-quick-reference.md)
- Canonical taxonomy source: [`schemas/taxonomy.json`](schemas/taxonomy.json)
- Derived tag document: [`TryHackMe/_meta/TAGS.md`](TryHackMe/_meta/TAGS.md)
- Taxonomy closure/state: [docs/taxonomy-closure.md](docs/taxonomy-closure.md)
- Canonical placeholder source: [docs/placeholder-policy.md](docs/placeholder-policy.md)
- Placeholder closure/state: [docs/placeholder-closure.md](docs/placeholder-closure.md)
- Publication workflow: [docs/publication-workflow.md](docs/publication-workflow.md)
- Maintenance checkpoint: [docs/maintenance-checkpoint.md](docs/maintenance-checkpoint.md)

## Governance Layers

The public repo is kept coherent by four lightweight layers:

| Layer | Source of truth |
| --- | --- |
| taxonomy | [`schemas/taxonomy.json`](schemas/taxonomy.json) |
| derived tags | [`TryHackMe/_meta/TAGS.md`](TryHackMe/_meta/TAGS.md) |
| placeholders | [docs/placeholder-policy.md](docs/placeholder-policy.md) |
| publication process | [docs/publication-workflow.md](docs/publication-workflow.md) |

## Required Local Checks

Run these before publishing or merging materially edited public notes:

```text
python scripts/render_tags_doc.py --check
python scripts/render_readme_snapshot.py --check
python -m unittest discover -s tests -p 'test_*.py'
python scripts/check_placeholders.py <changed files>
python scripts/check_markdown.py
python -m pre_commit run --files <changed files>
```

Manual audit helpers:

- Full-repo placeholder audit:
  `python scripts/check_placeholders.py --report reports/placeholder-audit.txt`
- Local tracked-file markdownlint debt audit:
  `python scripts/generate_markdownlint_debt.py`
- Artifact-backed remote markdownlint debt audit:
  GitHub Actions -> `Markdownlint Debt Audit`

## Scope Boundary

This public repository is for:

- authorized training platforms
- lab environments
- explicitly permitted targets
- sanitized notes safe to publish

If you want raw command logs, full exploit chains, unsanitized evidence, or private working notes, those stay outside this public repo.

## Legal And Ethical Use

Do not use any of this against systems you do not own or do not have written permission to test.

You are responsible for complying with platform rules, local law, and the publication boundary defined in this repository.
