# Flagwatch connector and white-label design

Date: 2026-08-23
Status: Approved for implementation

## Outcome

Flagwatch becomes a public, MIT-licensed CTF intelligence service that can run continuously without depending on CTFtime or one AI vendor. Operators can combine feeds, official sites, and CTF platform APIs. Every published fact keeps its source URL, a short exact quote, collection time, and conflict state.

The current KernelKittens deployment remains one branded installation of the public core. Private team telemetry, Discord operations, credentials, and organizer-only CTFd data stay outside this repository.

## Adopt, fork, or build

The implementation extends the existing Flagwatch codebase. It already has the required guarded fetcher, official-rule discovery, exact-evidence validation, last-good snapshot behavior, public calendar, and Azure deployment.

No current project covers enough of this exact product to justify replacement. Feedparser and iCalendar libraries can handle standards parsing, but they do not provide the event identity, source conflicts, official-rule verification, model boundary, public API, or white-label deployment. The right choice is to keep Flagwatch and add small standards libraries only where they replace fragile parsers.

## Public and private split

The public repository contains:

- Event and evidence models.
- Pluggable source connectors.
- Official-page discovery and bounded crawling.
- Provider-neutral structured extraction.
- Source attribution and conflict warnings.
- Safe aggregate analytics.
- A public JSON API and ICS output.
- White-label UI configuration.
- Docker images and Compose deployment.
- Azure deployment support for the existing installation.

The public repository never contains:

- CTFd administrator tokens.
- Private team or user telemetry.
- Raw submissions, flags, secrets, or anti-cheat signals.
- Private Discord channel IDs or bot credentials.
- Boss-event strategy, hidden objectives, or private scoring logic.

KernelKittens private behavior belongs in the private Litterbox bot repository. The public API remains usable by any Discord bot or calendar client.

## Source connector contract

Every connector implements one read-only contract:

```python
class EventSource(Protocol):
    source_name: str

    def fetch_events(self, start: datetime, finish: datetime) -> EventBatch: ...
```

An event batch carries normalized events plus source-level failures. One broken connector cannot erase events from healthy connectors or the last-good snapshot.

Each normalized event includes:

- A stable source-qualified key.
- Title, start, finish, location mode, and official URL.
- Zero or more source references.
- Optional registration, platform, organizer, participant, weight, and format fields.
- Collection time and source type.
- Raw source data retained only in the private database, never copied wholesale into the public snapshot.

`ctftime_url` remains an optional compatibility field during the API transition. New clients use `source_refs` and `primary_source_url`.

## Connectors

### CTFtime

CTFtime ingestion is optional and disabled unless configured. The connector keeps the existing range-bound API behavior and identifies itself honestly. The project does not crawl CTFtime pages to bypass an API restriction. If an operator cannot meet CTFtime's current API policy, they use official calendars, event sites, CTFd, rCTF, ICS, or JSON instead.

### ICS

The ICS connector accepts configured HTTPS calendar URLs. It handles UTC, explicit offsets, date-only events, folded lines, stable UIDs, and recurring instances within a bounded window. It rejects events without a usable start, finish, title, or official link and reports a source warning instead of guessing.

### JSON feeds

The JSON connector supports a documented Flagwatch feed schema and a small field-mapping configuration for organizer feeds. Validation is strict, response size is bounded, and unknown fields are ignored only after the required event identity and timestamps validate.

### Official organizer calendars

Watch-page connectors start from configured official organizer pages such as Hack The Box events. They discover bounded event links from server-rendered HTML or linked public JSON. They do not execute arbitrary JavaScript, log in, solve challenges, or follow an unlimited site graph.

### Official event pages and rules

Each normalized event can trigger a bounded evidence scan of its official page, rules, FAQ, eligibility, prize, and schedule links. Existing SSRF, redirect, response-size, and content-type controls stay mandatory. Cross-origin links are fetched only when they are explicit official rule or registration destinations and still pass the public-address guard.

### CTFd

The public CTFd connector reads configured public API endpoints for event metadata, challenges, scoreboard summaries, and statistics when the installation exposes them without privileged access. Optional bearer credentials can be supplied privately by an operator, but raw tokens and raw responses never enter public output or logs. Administrator-only analytics remain in the private bot overlay.

### rCTF

The rCTF connector follows the same boundary. It reads public event and scoreboard data where exposed, uses an optional private token only from runtime secrets, and publishes normalized aggregates with source citations.

## Composite identity and conflicts

The composite source merges only high-confidence matches. Identity considers canonical official URL, platform URL, normalized title, organizers, and overlapping time range. It never merges solely because titles are similar.

Field precedence is:

1. The event's current official rules or event page.
2. The event platform API, such as CTFd or rCTF.
3. An official organizer calendar or feed.
4. CTFtime when enabled.

All contributing references remain attached after a merge. If two authoritative sources disagree about start time, finish time, team limit, eligibility, AI policy, prizes, or registration, Flagwatch keeps the preferred value and emits a public conflict record containing both values, both source URLs, and collection times. Conflicted safety-sensitive policy never qualifies for alerts.

## AI provider connector

PydanticAI is not part of this design. It is a Python agent framework and provider adapter. Flagwatch needs a smaller boundary: send bounded inert evidence, receive strict JSON, validate it, and discard anything unsupported by an exact source quote.

Provider connectors are:

- OpenAI-compatible chat completions for OpenAI, DeepSeek, LiteLLM, vLLM, Ollama, and other compatible endpoints.
- Anthropic Messages for Anthropic models.
- Disabled mode for deterministic extraction only.

LiteLLM is a connector target, not a mandatory dependency. An operator can point Flagwatch at a LiteLLM proxy or sidecar by setting its base URL, model name, and secret. Direct OpenAI, Anthropic, DeepSeek, Ollama, and vLLM configurations remain valid.

The provider receives only:

- The event title and time window.
- Bounded plain text from approved evidence pages.
- Source identifiers that map back to approved URLs.
- A strict output schema and the house writing rules.

The provider gets no browser, shell, fetch, database, Discord, or CTF platform tool. Page text is data, never instructions. Output is normalized to plain ASCII punctuation for public copy. A claim is retained only when its exact quote occurs in the approved source document. Invalid, missing, conflicting, or uncited output fails closed and preserves the prior verified result as stale.

## Crawl safety

The crawler has these fixed controls:

- HTTPS or public HTTP only.
- DNS resolution before every request and redirect.
- No loopback, private, link-local, multicast, metadata, or reserved destinations.
- No URL credentials.
- Bounded redirects, bytes, pages per event, and total crawl time.
- Explicit text, HTML, JSON, XML, RSS, and calendar content types only.
- No arbitrary JavaScript execution.
- No login automation, challenge interaction, or form submission.
- Per-host pacing, cache validators, and an operator-defined user agent.
- A denylist for sources whose terms or robots policy prohibit collection.

## Public API compatibility

The existing `/api/events` response remains readable by the current Litterbox client during migration. New additive fields include:

- `primary_source_url`
- `source_refs`
- `conflicts`
- `registration_url`
- `platform`
- `analytics`

The old required `ctftime_url` becomes nullable only after the bot accepts the new fields. During the compatibility release, events without CTFtime use `primary_source_url` in the compatibility slot and include a source type so old clients do not break.

Safe public analytics include event counts, source health, freshness, event duration, participant totals when officially public, challenge category totals, public solve counts, and public scoreboard snapshots. No user-level or team-private record is published.

## White-label configuration

Branding is runtime configuration, not a source fork. Supported settings include:

- Product name and short description.
- Organization name.
- Public base URL.
- Logo and favicon paths.
- Accent and surface colors with contrast validation.
- Default timezone.
- Footer links and source-policy link.

KernelKittens values are deployment configuration. Repository defaults remain neutral and usable without editing source.

## Docker deployment

The public Compose stack contains:

- `web`: static public calendar and read-only API.
- `sync`: scheduled ingestion and evidence analysis.
- `litellm`: an optional profile for operators who want a local proxy.

The default setup does not require a model or API key. Containers run as non-root, expose health checks, use restart policies, keep data in named volumes, and read secrets from environment variables or mounted secret files. The sync container writes a candidate snapshot, validates it, and atomically promotes it. The web container serves the last-good snapshot while a sync fails.

The existing Azure Static Web App and Function deployment stays supported. Docker becomes the easiest portable path, not a forced production migration.

## Accessibility and interface

The public page stays light by default. Every page has an obvious home route, semantic headings, keyboard operation, visible focus, skip links, reduced-motion support, sufficient contrast, descriptive link text, and a text equivalent for charts. The release gate is WCAG 2.2 AA plus the Kitsune accessibility checks, with no critical or serious findings.

## Deployment and rollback

Implementation is additive. The current Azure API and site remain live while the new schema and clients are tested. The release sequence is:

1. Deploy an API that accepts old data and emits additive fields.
2. Verify the current and new bot parsers against the same snapshot.
3. Deploy the new bot client with analytics publication disabled.
4. Run a read-only CTFd analytics dry run.
5. Promote the public UI and enable the private analytics schedule only after live checks pass.

Rollback restores the previous Function and static-site artifacts. The database and snapshot formats retain backward-readable fields, so rollback does not require destructive migration.

## Acceptance criteria

- CTFtime can be disabled with a healthy calendar still produced from other connectors.
- ICS, JSON, official watch pages, official rules, CTFd, and rCTF have fixture-backed tests.
- OpenAI-compatible, Anthropic, LiteLLM, and local endpoints have contract tests with no live secret.
- Every AI-derived public claim has an exact quote and source URL.
- Conflicting policy cannot trigger an alert.
- Existing Litterbox fixtures still parse the public response.
- Docker Compose reaches healthy state and serves a last-good snapshot after a forced sync failure.
- White-label settings change the visible brand without changing source.
- Public accessibility tests pass with no critical or serious findings.
- No secret, private telemetry, raw flag, or private Discord identifier appears in the public repository or build artifacts.
