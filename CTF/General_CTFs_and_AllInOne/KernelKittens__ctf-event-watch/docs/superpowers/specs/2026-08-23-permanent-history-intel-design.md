# Flagwatch permanent availability, history, and event intelligence

Date: 2026-08-23
Status: Approved by direct implementation request

## Problem

The public Static Web App is healthy, but every useful screen depends on a separate Flex Consumption Function. That Function currently has no always-ready HTTP instance. A cold request can stall long enough that the calendar looks empty or down, and a first-time visitor has no last-good fallback. The current sweep also starts at the present moment, so finished events disappear instead of remaining available for review.

## Product contract

- `calendar.kernelkittens.team` stays available through the existing Azure Static Web App and direct custom-domain route.
- Azure keeps one 512 MiB HTTP Function instance always ready. Burst capacity remains bounded.
- The browser retries transient API failures and stores the last verified snapshot. If the API is temporarily unavailable, it shows that saved data with its original timestamp instead of an empty calendar.
- Each sweep imports at least the prior 31 days plus the next 90 days. The public snapshot omits anything older than that history window.
- Event details include sourced intelligence about eligibility, registration, format, schedule, prizes, conduct, flag sharing, platform, AI use, and other published restrictions.
- Every AI-derived claim includes the exact supporting quote and source URL. Claims without exact evidence are discarded.
- Source text is treated as untrusted input. It cannot alter model instructions or the alert gate.
- A content fingerprint prevents DeepSeek from reprocessing unchanged source pages on every six-hour sweep.
- A model error never removes the prior verified intelligence. Stale or partial data is labeled and the notification gate continues to fail closed.

## Architecture

The existing Static Web App, Function App, managed identity, and private Blob Storage remain in place. This avoids the patching and single-host maintenance burden of a permanent VM.

The Function receives three durability changes:

1. Azure always-ready HTTP capacity removes ordinary cold-start stalls.
2. The events endpoint caches the last successful blob in process and may serve it if a later Blob read fails.
3. The site retries short failures and keeps a browser-local last-good snapshot for honest degraded service.

The sync range becomes `now - 31 days` through `now + 90 days`. CTFtime requests are split into bounded windows and deduplicated by event key so the upstream 100-item limit cannot silently truncate the range.

## Intelligence schema

Each verified intelligence claim contains:

- `topic`: one of overview, eligibility, registration, format, schedule, prizes, conduct, flag_sharing, platform, ai_policy, or other
- `label`: a short human-readable field name
- `value`: the concise fact shown in the event dossier
- `source_url`: the page that supports it
- `evidence`: an exact quote from that page

The event also records the source fingerprint, model name, analysis timestamp, and status. The public payload never includes credentials, raw model responses, internal errors, or raw source documents.

## Model boundary

DeepSeek V4 Pro handles public event and rules text only. Temperature is zero and output uses a strict JSON schema. The validator normalizes punctuation, limits field sizes and claim counts, requires HTTP or HTTPS evidence URLs, and verifies each quote against the matching source document. Deterministic AI-policy detection remains authoritative when it already found a clear rule. Model results can enrich the dossier but cannot bypass stale-source or conflicting-rule checks.

## Interface

The existing dark technical calendar remains recognizable. Finished events are marked as completed. The details dialog gains an event intelligence section grouped by topic. Each item shows the concise fact, its exact evidence, and an official-source link. Unknown fields remain absent instead of being guessed.

The status line distinguishes live data from a saved fallback. Scan summary wording changes from upcoming-only language to the complete retained range.

## Rollback and verification

Before cutover, take Blob snapshots of the database and public JSON and retain the previous Function release. Apply infrastructure settings before deploying code, validate the Function and site directly, then validate the custom domain. If health or neighboring resources regress, restore the previous release and Blob snapshots.

Release requires the complete remote test suite, lint, type checking, browser screenshots, automated accessibility checks, direct API probes, repeat custom-domain loads, past-month event confirmation, and a verified always-ready setting.
