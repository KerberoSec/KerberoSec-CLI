# Flagwatch README refresh design

Date: 2026-08-23
Status: Approved

## Outcome

The Flagwatch repository gets a useful public front door for operators, contributors, and CTF teams. The README should explain the product quickly, prove its source-trust model, make Docker setup easy, and show that the model provider is replaceable.

The sanitized Kernel Kittens open-source banner appears at the top. A current public month-calendar screenshot stays close to the live demo link so readers see the product before the setup details.

## Public boundary

The README may describe public event collection, official rules, aggregate platform facts, optional model enrichment, white labeling, Docker, the public API, accessibility, and contribution expectations.

It must not expose private Discord IDs, private CTFd telemetry, Azure resource coordinates, tokens, webhooks, operator-only channels, team membership, player identities, or Litterbox recovery details. Those belong in the private Litterbox repository.

## Opening block

The first screen contains:

1. The sanitized Kernel Kittens banner.
2. The Flagwatch name and a plain one-sentence description.
3. Modest badges for the MIT license, Python requirement, Docker Compose, and the verified live calendar.
4. A direct live-demo link.
5. A current public month-calendar screenshot with useful alternative text.

There is no CI badge because the repository does not currently have a public workflow that can support the claim.

## Information architecture

The README uses this order:

1. What Flagwatch does.
2. A compact collection and trust-flow diagram.
3. Docker quick start.
4. Connector precedence and crawler limits.
5. Model replacement and LiteLLM.
6. White-label configuration.
7. Public API and data boundary.
8. Native development and checks.
9. Documentation, contribution, security, and license.

A reader should reach a working local calendar before they need to understand every connector.

## Evidence standard

Every technical statement must be supported by the repository, the live deployment, or a checked command. Important examples are the 31-day history window, 90-day forward window, two-container Docker stack, connector precedence, evidence-quote validation, last-good snapshot behavior, non-root containers, provider routes, API paths, and accessibility checks.

The README does not call the project production-ready, secure, free, maintained, or highly available without a direct basis for that wording.

## Model explanation

The README states plainly that DeepSeek is replaceable. The enrichment boundary supports direct OpenAI, Azure OpenAI, Anthropic, DeepSeek, LiteLLM, and local OpenAI-compatible endpoints. PydanticAI is not a runtime dependency.

Models receive bounded public text without tools, credentials, private CTF data, or write access. Model output does not become public data unless the cited evidence quote appears in the fetched source text.

## Visual and accessibility rules

The README uses the supplied 1280 by 400 PNG without altering its message. The image path is stable and relative to the repository. Alternative text includes the visible Kernel Kittens text and contribution invitation.

Tables remain small enough to scan on a narrow screen. The Mermaid diagram has a complete prose explanation immediately after it, so the architecture does not depend on vision or Mermaid support.

## Security reporting

GitHub private vulnerability reporting must be enabled before the README links to the private advisory form. Public issues must never contain credentials, private CTF data, live flags, or exploit details.

## Acceptance criteria

- The banner renders from a repository-owned relative path.
- The live calendar and current public month-calendar screenshot appear above setup details.
- Docker quick start matches the checked deployment guide.
- Connector and model claims match the checked docs and configuration.
- Public and private data boundaries are explicit.
- All local links resolve on the branch.
- Markdown lint, external link checks, character scans, and `git diff --check` pass.
- The merged GitHub README and banner URLs return successfully.
- No private Litterbox coordinates appear in the public change.
