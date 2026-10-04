# Flagwatch policy verification repair

## Problem

Flagwatch receives JavaScript-only event homepages whose initial HTML contains metadata but no
rendered rules. The current scanner strips scripts and follows only same-origin HTML or sitemap
links. BrunnerCTF exposes its policy and external rules URL inside a same-origin static bundle, so
the refresh correctly failed closed but could not verify a policy that was publicly available.

The deterministic classifier also misses exact wording such as "strict no-AI policy."

## Safety boundary

The scanner remains fail-closed. Only `ai_native` and `ai_assisted` policies with source evidence
can qualify for alerts. `human_only`, `unknown`, stale, or conflicting policies cannot qualify.

Static JavaScript is treated as text and never executed. The scanner will:

- inspect no more than three same-origin HTTP or HTTPS script assets declared by the official page;
- retain only bounded string literals containing AI-policy terms;
- follow no more than six rule-like links explicitly present in official HTML, sitemap data, or an
  inspected official script;
- require HTTPS for cross-origin rule links;
- retain the existing public-address, redirect, response-size, and content-type guards;
- prefer a readable rules page as evidence, with script text as a fallback;
- continue publishing unknown status when evidence is absent, conditional, or conflicting.

A headless browser is intentionally excluded. It would execute hostile site code and add a large
browser payload to the 512 MB Azure Function.

## Implementation

1. Add bounded script-source discovery, JavaScript string extraction, and embedded rule-link
   discovery to `rule_pages.py`.
2. Permit JavaScript MIME types in `GuardedFetcher` while preserving all existing network guards.
3. Scan official script assets in `SyncService`, fetch discovered rules first, and append extracted
   script evidence last so human-readable rule pages win source attribution.
4. Extend deterministic prohibition matching for affirmative no-AI-policy wording.
5. Add current verified and unverified policy counts to the internal sync report and emit an Azure
   warning when a completed refresh has zero current verified policies.

## Verification

- Brunner-like SPA fixture resolves to `human_only` from the linked rules page and queues no alert.
- Script-only policy evidence remains usable but cannot approve AI participation.
- Cross-origin HTTP, private addresses, oversized responses, and unsupported content remain blocked.
- Existing conflict, stale-evidence, deduplication, public snapshot, function bundle, and bot schema
  tests continue to pass.
