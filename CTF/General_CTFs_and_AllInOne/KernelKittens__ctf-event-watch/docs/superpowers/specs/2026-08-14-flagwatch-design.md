# Flagwatch design

## Goal

Build a private personal dashboard that finds upcoming CTFs, reads their official rules, shows the useful facts in Central time, and alerts Moo only when an event satisfies his saved criteria.

Every discovered event stays visible. An event that prohibits meaningful AI-assisted solving must never trigger a match alert.

## Adopt, fork, or build

CTFtime provides the main event feed. Its official API already includes start and finish times, duration, format, online status, restrictions, descriptions, prizes, organizers, and event URLs.

The existing public projects checked during discovery cover narrow parts of the job:

- `Frigg1337/ctf-event-tracker` publishes a generated schedule from CTFtime.
- `KaiHT-Ladiant/ctftime-discord-webhook` posts newly discovered events to Discord but has no declared license.
- `marcoodistefano/CTFTimeBot` is a general Discord schedule bot and has no declared repository license.

None of them provides a private criteria editor, official rule-page analysis, cited AI-policy classification, division and team-limit extraction, alert suppression, or an evidence-first dashboard. Extending Moo's Cyber Apocalypse coordination bot would mix event discovery with team operations and touch infrastructure that was deliberately left paused.

Flagwatch will be a standalone private application. It will consume CTFtime at a conservative rate and will not present itself as a public CTFtime replacement.

## Product boundary

The first release will:

- Import upcoming events from CTFtime.
- Preserve all imported events in the dashboard, including poor matches.
- Convert every time through the `America/Chicago` time zone and display the correct CST or CDT abbreviation for the event date.
- Read the CTFtime description and the official event site's likely rules, FAQ, terms, registration, prize, and code-of-conduct pages.
- Extract team limits, divisions, eligibility, schedule mode, duration, prize facts, registration status, categories, and AI policy with source evidence.
- Let Moo save personal matching criteria.
- Queue Discord webhook or SMTP alerts only for eligible matches.
- Deduplicate alerts and record why an event did or did not alert.
- Provide an ICS calendar download for each event.

The first release will not:

- Crawl the open web looking for unlisted CTFs.
- Log into organizer sites or bypass bot protection.
- Run JavaScript-heavy pages in a browser crawler.
- Contact organizers.
- Send any outbound alert until Moo configures and enables a destination.
- Modify the existing Cyber Apocalypse bot, Discord server, or Azure deployment.

## AI-policy gate

AI compatibility is a mandatory alert gate, separate from the normal match score.

| Policy | Meaning | Dashboard | Match alert |
|---|---|---|---|
| `ai_native` | AI agents and automated solving are allowed | Visible | Allowed |
| `ai_assisted` | Interactive AI assistance is allowed, but autonomous or fully automated solvers are banned | Visible | Allowed |
| `human_only` | AI cannot analyze or solve challenge material, even if trivial IDE completion or general syntax help is allowed | Visible | Suppressed |
| `unknown` | The policy is missing, ambiguous, stale, or conflicting | Visible | Suppressed |

The classifier fails closed. Silence never means permission.

gaslightCTF is the reference `human_only` case. Its official rules permit LLM-assisted IDE completion but prohibit LLMs and AI assistants from solving challenges. Flagwatch will show the event and its prizes, but its alert status will be `Suppressed: AI-assisted solving prohibited`.

The event detail view will show:

- The normalized policy label.
- A short plain-language explanation.
- The official source URL.
- A short evidence excerpt.
- The extraction time and confidence.
- Whether a human override exists.

A manual override may change an `unknown` event after Moo reads the source. It cannot silently rewrite the captured evidence.

## Architecture

Flagwatch will use Python 3.13, FastAPI, server-rendered Jinja templates, SQLite, and a small amount of progressive JavaScript. The application will remain usable without client-side JavaScript for its core dashboard and settings workflows.

The code will be split into focused units:

- `sources`: adapters that return normalized source events. CTFtime is the first adapter.
- `fetching`: guarded HTTP retrieval with URL validation, timeouts, size limits, redirect checks, and caching.
- `analysis`: deterministic fact extraction, AI-policy classification, evidence capture, and an optional structured LLM fallback.
- `matching`: hard gates, saved criteria, match reasons, and rejection reasons.
- `notifications`: alert rendering, deduplication, Discord webhook delivery, SMTP delivery, and an outbox log.
- `storage`: SQLite schema and narrow repository functions.
- `web`: dashboard, event detail, criteria settings, alert history, health endpoint, and ICS downloads.
- `jobs`: one-shot synchronization and analysis commands. Scheduling will call the same tested command rather than duplicating job logic.

## Data flow

1. A sync requests a bounded upcoming window from CTFtime.
2. Source events are normalized and upserted by stable source ID.
3. New or changed events are queued for analysis.
4. The analyzer combines trusted CTFtime fields with guarded text fetched from official rule pages.
5. Deterministic extractors produce facts and evidence first.
6. If the AI policy remains unknown and an LLM provider is enabled, DeepSeek V4 Flash receives only the relevant untrusted text and returns schema-validated JSON.
7. The policy gate runs before ordinary criteria matching.
8. Matching events create deduplicated outbox records.
9. Delivery occurs only when a notification destination and the global send switch are enabled.
10. The dashboard reads stored data and never waits on live organizer sites.

## Event facts

Each event record can include:

- Source name and source event ID.
- Official event URL and CTFtime URL.
- Title, organizer, format, categories, weight, and participant count.
- Start, finish, duration, and Central-time display values.
- Fixed, rolling, staggered, multi-stage, or unknown schedule mode.
- Online, onsite, or hybrid attendance mode.
- Team minimum, team maximum, and solo eligibility.
- Divisions and prize eligibility by division.
- Geographic, age, student, employer, or invitation restrictions.
- Registration URL, deadline, fee, and open or closed state.
- Prize summary and cash-value facts when stated.
- AI-policy classification, confidence, source, evidence, and override.
- Last source refresh, last analysis, and material-change fingerprint.

Unknown facts remain explicitly unknown. Flagwatch will not invent a team limit, prize value, or policy from weak wording.

## Matching criteria

The settings page will support:

- Require online participation.
- Allow or reject onsite and hybrid events.
- Maximum team size.
- Minimum and maximum duration.
- Required or preferred divisions.
- Required prize and optional minimum stated cash value.
- Preferred formats or challenge categories.
- Allowed weekdays and weekend preference.
- Registration must still be open.
- Schedule modes to include.
- Minimum CTFtime weight.

AI compatibility is always evaluated first. `human_only` and `unknown` events cannot alert, regardless of their ordinary score.

Every event will show exact match reasons and rejection reasons. A percentage may summarize compatible preferences, but it cannot hide a failed hard gate.

## Notifications

Discord will use a webhook rather than a full bot. SMTP email will be optional.

An alert contains:

- Event name and official link.
- Start and finish in Central time.
- Duration, team maximum, division, and schedule mode.
- Prize summary.
- AI-policy label and source link.
- Exact reasons the event matched.

The outbox key will include the event, criteria version, and material event fingerprint. Repeated syncs cannot send duplicate alerts. A material change may create a new outbox item only when the event remains compatible and the changed fact matters to eligibility.

Delivery is disabled by default. Previewing, queueing, and testing an alert must not send it.

## Interface

Flagwatch is a private operator board, not a marketing page. It will use a dark, low-glare interface with a dense event dossier layout and strong text hierarchy.

The dashboard starts with filters and a compact status line. Each event shows the match state, AI-policy badge, Central start time, duration, attendance mode, team maximum, divisions, prize status, and schedule mode. Expanding an event reveals the evidence and rejection reasons without leaving the list.

The signature element is the evidence rail: extracted facts line up beside their official sources so Moo can audit the classifier without digging through organizer sites.

Important states use text and icons together. Color is never the only signal.

## Accessibility

Every page will include:

- A skip link and clear landmarks.
- Complete keyboard operation with visible focus.
- At least 24-pixel pointer targets.
- Proper labels, descriptions, and error summaries for forms.
- Semantic tables or lists instead of clickable generic containers.
- Reduced-motion and increased-contrast support.
- No hover-only information.
- A text equivalent for every status graphic.
- Responsive layouts down to 320 CSS pixels without horizontal page scrolling.

## Security and trust boundaries

Organizer pages and model output are untrusted.

- Only HTTP and HTTPS source URLs are accepted, with HTTPS preferred.
- Loopback, link-local, private, multicast, and reserved destination addresses are blocked.
- Every redirect target is revalidated.
- Responses use strict time and byte limits.
- Fetched HTML is converted to plain text and never injected into templates as trusted markup.
- The rules crawler follows a small bounded set of relevant links and respects cache intervals.
- Model prompts state that page text is data, not instructions.
- Model output must match the exact JSON schema before storage.
- Discord, SMTP, and model credentials stay in ignored environment files or the deployment secret store.
- The private deployment will sit behind the established Authentik pattern if Moo later approves hosting.

## Failure behavior

One broken event site cannot fail the overall sync. The event remains visible with stale or unknown analysis and a specific source error.

Source failures retain the last known event data. The dashboard shows the age of that data and the latest job error. Notification delivery failures remain in the outbox with an attempt count and readable error, but no automatic rapid retry loop.

An AI extraction failure leaves the deterministic result unchanged. It cannot downgrade a clear prohibition into an allowed policy.

## Testing

Automated coverage will include:

- CTFtime normalization and material-change detection.
- Central-time conversion across CST, CDT, and daylight-saving transitions.
- Team limit, division, prize, registration, and schedule extraction.
- AI-native, AI-assisted, human-only, conflicting, and missing-policy fixtures.
- The gaslightCTF reference policy.
- Fail-closed alert gating.
- Criteria matching and readable reasons.
- SSRF protection, redirect validation, response limits, and unsafe HTML handling.
- Alert deduplication and disabled-delivery behavior.
- Dashboard, settings, event detail, ICS, health, empty, stale, and error states.
- Keyboard navigation, accessible names, contrast, reduced motion, and 320-pixel layout.

The release check will run unit and integration tests, type checks, a production server smoke test, browser tests, an accessibility audit, and visual inspection of desktop and narrow screenshots.

## Deployment boundary

The first completed handoff is a verified local application using live CTFtime data. It will not send messages, create scheduled tasks, alter Caddy, configure Authentik, deploy to an LXC, or spend model tokens automatically.

Hosting and outbound notification activation require a separate shared-infrastructure check and Moo's approval of the exact destination.
