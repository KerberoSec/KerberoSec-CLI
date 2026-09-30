# Flagwatch Connectors and White-Label Implementation Plan

> Execution note: run each task in order in the isolated Azure worktree. Use test-driven development for every behavior change and commit each green logical slice.

**Goal:** Turn Flagwatch into a provider-neutral, multi-source, white-label CTF intelligence service with Docker deployment while preserving the current Azure API and last-good behavior.

**Architecture:** A composite source normalizes independent connectors into one provenance-rich event model. Guarded network clients collect official data. Provider adapters receive inert bounded evidence and return schema-validated JSON. The public snapshot exposes safe aggregates and exact citations. Runtime branding and source configuration remove KernelKittens assumptions from the public core.

**Tech stack:** Python 3.13, Pydantic 2, httpx, iCalendar 7.3, SQLite, FastAPI, Azure Functions, static HTML/CSS/JavaScript, Docker Compose, pytest, Ruff, MyPy, Playwright, axe-core.

---

### Task 1: Add provenance, conflicts, and generic event compatibility

**Files:**

- Modify: `src/flagwatch/domain.py`
- Modify: `src/flagwatch/public_snapshot.py`
- Modify: `tests/test_public_snapshot.py`
- Create: `tests/test_provenance.py`

**Steps:**

1. Add failing model tests for nullable `ctftime_url`, `primary_source_url`, `SourceRef`, `SourceConflict`, registration URL, platform, and safe aggregate analytics.
2. Run `uv run pytest tests/test_provenance.py tests/test_public_snapshot.py -q` and confirm the new cases fail for missing fields.
3. Add strict Pydantic models with bounded strings, timezone-aware collection timestamps, and `extra="forbid"` on public records.
4. Keep current CTFtime-shaped fixtures valid without modification.
5. Emit additive public fields and serialize nullable CTFtime URLs.
6. Re-run the focused tests, Ruff, and MyPy.
7. Commit with `feat: add event provenance and conflict records`.

### Task 2: Build deterministic composite identity and conflict handling

**Files:**

- Create: `src/flagwatch/sources/composite.py`
- Create: `tests/test_composite_source.py`
- Modify: `src/flagwatch/sources/__init__.py`

**Steps:**

1. Add failing tests for exact official URL matches, exact platform URL matches, normalized title plus organizer plus overlapping time, non-merge of title-only matches, precedence, duplicate suppression, and safety-sensitive conflicts.
2. Run `uv run pytest tests/test_composite_source.py -q` and confirm import and behavior failures.
3. Implement a `CompositeSource` that calls sources independently, carries every failure, merges only high-confidence identities, retains every `SourceRef`, and emits conflict records.
4. Make official event pages outrank platform APIs, organizer feeds, and CTFtime.
5. Mark time, team, eligibility, registration, prize, and AI-rule disagreements as alert-suppressing conflicts.
6. Re-run focused tests and commit with `feat: merge source events with provenance`.

### Task 3: Extend the guarded fetcher for feeds and platform APIs

**Files:**

- Modify: `src/flagwatch/fetching.py`
- Modify: `tests/test_fetching.py`
- Create: `src/flagwatch/sources/http.py`
- Create: `tests/test_source_http.py`

**Steps:**

1. Add failing tests for JSON and calendar media types, per-redirect public-address checks, bearer token redaction, bounded streaming bodies, and non-JSON error bodies.
2. Run the tests and verify the new cases fail.
3. Add `application/json`, `application/*+json`, `text/calendar`, and `application/ics` support without weakening the existing SSRF controls.
4. Add a read-only JSON client that restricts the base origin, applies optional runtime authorization, caps pages and bytes, and raises typed errors that contain no body or secret.
5. Re-run focused security tests and commit with `feat: guard feed and platform API reads`.

### Task 4: Add ICS and JSON feed connectors

**Files:**

- Modify: `pyproject.toml`
- Modify: `uv.lock`
- Create: `src/flagwatch/sources/ics.py`
- Create: `src/flagwatch/sources/json_feed.py`
- Create: `tests/fixtures/sources/events.ics`
- Create: `tests/fixtures/sources/events.json`
- Create: `tests/test_ics_source.py`
- Create: `tests/test_json_feed_source.py`

**Steps:**

1. Add iCalendar 7.3 through `uv add 'icalendar>=7.3,<8'`. Record its BSD-2-Clause license in the dependency notes.
2. Write failing fixtures for UTC, offset, timezone ID, all-day, duration-based, folded-line, recurring, malformed, and out-of-window ICS events.
3. Write failing JSON tests for the native schema, field mapping, missing identity, bad timestamps, duplicate IDs, and partial record failure.
4. Implement bounded range normalization and stable source-qualified keys.
5. Require a usable official URL. Do not invent a finish time except for an explicit date-only event, which receives a documented one-day finish.
6. Return valid records and per-record failures together.
7. Re-run focused tests and commit with `feat: ingest ICS and JSON event feeds`.

### Task 5: Add CTFd and rCTF public enrichment connectors

**Files:**

- Create: `src/flagwatch/sources/platform.py`
- Create: `src/flagwatch/sources/ctfd.py`
- Create: `src/flagwatch/sources/rctf.py`
- Create: `tests/test_ctfd_source.py`
- Create: `tests/test_rctf_source.py`

**Steps:**

1. Add failing CTFd tests for `/api/v1/challenges`, `/api/v1/scoreboard`, optional authorization, hidden capability, invalid envelope, partial endpoint failure, and public aggregate output.
2. Add failing rCTF tests for `/api/v2/challs`, current leaderboard, optional bearer authorization, `badNotStarted`, pagination, and aggregate output.
3. Run both files and confirm failures.
4. Implement read-only platform source configuration with explicit event metadata, base origin, token secret, page limits, and a capability summary.
5. Normalize challenge counts, categories, visible solve totals, participant totals, and scoreboard size. Never retain flags, solution text, emails, IP data, or full response bodies.
6. Treat unavailable endpoints as a partial capability warning while retaining verified event metadata.
7. Re-run focused tests and commit with `feat: enrich events from CTFd and rCTF`.

### Task 6: Add official organizer watch pages and AI discovery

**Files:**

- Create: `src/flagwatch/sources/watch_page.py`
- Create: `src/flagwatch/analysis/discovery.py`
- Create: `tests/fixtures/sources/watch-page.html`
- Create: `tests/test_watch_page_source.py`
- Create: `tests/test_ai_discovery.py`
- Modify: `src/flagwatch/rule_pages.py`

**Steps:**

1. Add failing tests for JSON-LD Event objects, linked event cards, duplicate links, cross-origin rejection, maximum link count, model output with exact quotes, hallucinated quotes, and prompt injection inside page text.
2. Run focused tests and confirm failures.
3. Parse schema.org Event JSON-LD deterministically before invoking a model.
4. Let the optional discovery extractor receive bounded page text and source IDs only. It has no fetch or tool access.
5. Validate every discovered title, timestamp, URL, and supporting quote against fetched documents. Reject unsupported records.
6. Add host pacing and a fixed page budget. Never crawl CTFtime.
7. Re-run focused tests and commit with `feat: discover official organizer events safely`.

### Task 7: Replace the single DeepSeek client with provider connectors

**Files:**

- Create: `src/flagwatch/analysis/providers.py`
- Modify: `src/flagwatch/analysis/llm.py`
- Modify: `src/flagwatch/config.py`
- Modify: `src/flagwatch/cli.py`
- Create: `tests/test_ai_providers.py`
- Modify: `tests/test_ai_policy.py`
- Modify: `tests/test_llm_validation.py`

**Steps:**

1. Add failing contract tests for OpenAI-compatible bearer auth, Azure-style `api-key`, no-auth local endpoints, Anthropic Messages, LiteLLM base URLs, malformed provider replies, timeouts, and missing secrets.
2. Run focused tests and confirm the old single-header client fails them.
3. Implement `StructuredModelProvider`, `OpenAiCompatibleProvider`, and `AnthropicProvider`.
4. Keep `LlmPolicyExtractor` responsible for the schema and evidence prompt. Keep the provider responsible only for wire format and response extraction.
5. Add settings for provider type, endpoint, model, auth mode, API version, and optional secret file. Require an explicit provider and endpoint when AI is enabled.
6. Route LiteLLM, OpenAI, DeepSeek, vLLM, and Ollama through the OpenAI-compatible connector. Do not add PydanticAI.
7. Re-run focused tests and commit with `feat: support interchangeable AI providers`.

### Task 8: Load source configuration and preserve the legacy production path

**Files:**

- Create: `src/flagwatch/source_config.py`
- Create: `src/flagwatch/sources/factory.py`
- Modify: `src/flagwatch/config.py`
- Modify: `src/flagwatch/cli.py`
- Modify: `.env.example`
- Create: `examples/sources.example.json`
- Create: `tests/test_source_config.py`

**Steps:**

1. Add failing tests for each connector type, disabled entries, duplicate names, secret environment references, bad URLs, and an empty configuration.
2. Add a legacy test proving explicit `FLAGWATCH_CTFTIME_ENABLED=true` builds the existing source.
3. Implement strict JSON source configuration and the source factory.
4. Make CTFtime disabled by neutral default. Set it explicitly only in the existing KernelKittens deployment configuration.
5. Build a composite source when more than one connector is enabled and fail startup when none are enabled for a sync command.
6. Re-run focused tests and commit with `feat: configure independent event sources`.

### Task 9: Add white-label branding and safe analytics to the public UI

**Files:**

- Create: `src/flagwatch/branding.py`
- Modify: `src/flagwatch/config.py`
- Modify: `src/flagwatch/public_snapshot.py`
- Modify: `site/config.js`
- Modify: `site/index.html`
- Modify: `site/app.js`
- Modify: `site/app.css`
- Modify: `site/accessibility/index.html`
- Create: `tests/test_branding.py`
- Modify: `tests/browser/test_public_calendar.py`

**Steps:**

1. Add failing configuration and browser tests for neutral defaults, KernelKittens runtime values, home navigation, source lists, conflict warnings, safe analytics, keyboard use, reduced motion, and text equivalents.
2. Run focused Python and browser tests and confirm failures.
3. Generate a small public runtime config from validated environment values. Restrict logo and footer links to approved public URLs.
4. Render generic source links and keep CTFtime-specific UI conditional.
5. Add accessible source-health and event-analytics summaries without exposing private data.
6. Run axe-core and fix every critical or serious result.
7. Commit with `feat: add white-label calendar and source analytics`.

### Task 10: Package the public stack with Docker Compose

**Files:**

- Create: `Dockerfile`
- Create: `docker-compose.yml`
- Create: `docker/entrypoint.sh`
- Create: `docker/healthcheck.py`
- Create: `docker/Caddyfile`
- Modify: `.dockerignore`
- Modify: `.env.example`
- Create: `tests/test_docker_artifacts.py`

**Steps:**

1. Add static tests for non-root users, health checks, restart policies, named data volumes, read-only web filesystem, secret-file support, and the optional LiteLLM profile.
2. Run the static tests and confirm failures.
3. Build a multi-stage image and separate `web` and `sync` services from the same artifact.
4. Add an optional `litellm` profile whose configuration is mounted by the operator. Do not make it a default dependency.
5. Add an atomic snapshot handoff and a forced-failure fixture proving the web service keeps the last-good file.
6. Run `docker compose config`, build the images, start the stack, verify health, force one sync failure, verify the prior snapshot, and stop the stack.
7. Commit with `feat: add portable Docker deployment`.

### Task 11: Update documentation and run the public release gate

**Files:**

- Modify: `README.md`
- Create: `docs/connectors.md`
- Create: `docs/providers.md`
- Create: `docs/docker.md`
- Create: `docs/source-policy.md`
- Modify: `scripts/deploy-azure.ps1`
- Modify: `infra/main.bicep`

**Steps:**

1. Document the public/private boundary, CTFtime limitation, each connector, exact provider examples, LiteLLM as an optional connector, Docker setup, source evidence, and rollback.
2. Add explicit KernelKittens branding and CTFtime settings to the current Azure deployment without placing secrets in source.
3. Run `uv run pytest`, `uv run ruff check .`, `uv run ruff format --check .`, `uv run mypy`, JavaScript syntax checks, browser tests, Docker tests, `git diff --check`, and a secret scan.
4. Generate a candidate snapshot from fixtures and validate old and new API parsers.
5. Commit with `docs: publish connector and deployment guide`.

### Task 12: Deploy with the compatibility gate

**Files:**

- Deployment-only changes through existing scripts and Azure configuration.

**Steps:**

1. Record current Function and Static Web App artifacts, health, CORS, snapshot fingerprint, and recent commits.
2. Deploy the additive API first while keeping current sources enabled.
3. Verify the old production bot parser and the new parser against the same live snapshot.
4. Deploy the private bot compatibility client before enabling any non-CTFtime source.
5. Enable the selected official connectors, generate a new candidate snapshot, and verify source counts, conflict handling, exact quotes, 31-day history, and last-good fallback.
6. Run the live accessibility audit and direct-origin checks.
7. Roll back immediately if API compatibility, neighboring services, CORS, readiness, or source quality regresses.
