# Flagwatch implementation plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a verified private CTF dashboard that reads official event rules and alerts only for events that permit meaningful AI-assisted solving.

**Architecture:** A FastAPI application stores normalized CTFtime events and cited extracted facts in SQLite. Focused source, fetching, analysis, matching, notification, and web modules share typed domain models. The dashboard reads stored data, while a one-shot sync service performs bounded network work and queues disabled-by-default alerts.

**Tech Stack:** Python 3.13, FastAPI, Pydantic 2, Jinja2, SQLite, httpx, BeautifulSoup 4, pytest, mypy, Ruff, Playwright, and axe-playwright-python.

## Global constraints

- Store and convert instants with `America/Chicago`; display CST or CDT based on the event date.
- Keep every imported event visible even when it cannot alert.
- Permit alerts only for `ai_native` and `ai_assisted` policies.
- Treat missing, ambiguous, stale, or conflicting AI rules as `unknown` and suppress alerts.
- Treat organizer pages and model output as untrusted data.
- Block loopback, private, link-local, multicast, and reserved network targets.
- Keep delivery disabled until both a destination and the global send switch are configured.
- Do not modify the existing Cyber Apocalypse bot, Discord server, Azure deployment, Caddy, or Authentik.
- Do not write credentials into tracked files.
- Keep the core dashboard and settings usable without client-side JavaScript.
- Use Moo's plain human voice for visible copy. Do not emit em or en dashes, smart quotes, or corporate filler.

---

### Task 1: Project foundation and SQLite storage

**Files:**
- Create: `pyproject.toml`
- Create: `.gitignore`
- Create: `src/flagwatch/__init__.py`
- Create: `src/flagwatch/config.py`
- Create: `src/flagwatch/domain.py`
- Create: `src/flagwatch/storage.py`
- Create: `tests/conftest.py`
- Create: `tests/test_storage.py`

**Interfaces:**
- Consumes: approved design at `docs/superpowers/specs/2026-08-14-flagwatch-design.md`.
- Produces: `Settings`, `Event`, `EventFacts`, `AiPolicy`, `Criteria`, `MatchResult`, `Database.initialize()`, `Database.upsert_event()`, `Database.list_events()`, `Database.save_facts()`, and `Database.get_criteria()`.

- [ ] **Step 1: Write the failing storage test**

```python
from datetime import datetime, timezone

from flagwatch.domain import AiPolicy, Event, EventFacts
from flagwatch.storage import Database

def test_database_keeps_incompatible_event_visible(tmp_path):
    db = Database(tmp_path / "flagwatch.db")
    db.initialize()
    event = Event(
        source="ctftime",
        source_id="3181",
        title="gaslightCTF 2026",
        official_url="https://gaslightctf.cooking/",
        ctftime_url="https://ctftime.org/event/3181/",
        starts_at=datetime(2026, 8, 14, 12, tzinfo=timezone.utc),
        finishes_at=datetime(2026, 8, 17, 12, tzinfo=timezone.utc),
        online=True,
    )
    db.upsert_event(event)
    db.save_facts(event.key, EventFacts(ai_policy=AiPolicy.HUMAN_ONLY))

    stored = db.list_events()[0]

    assert stored.event.title == "gaslightCTF 2026"
    assert stored.facts.ai_policy is AiPolicy.HUMAN_ONLY
```

- [ ] **Step 2: Run the test and confirm the missing package failure**

Run: `uv run pytest tests/test_storage.py -v`

Expected: collection fails because `flagwatch` does not exist.

- [ ] **Step 3: Add the project metadata, typed models, and schema**

```toml
[project]
name = "flagwatch"
version = "0.1.0"
requires-python = ">=3.13"
dependencies = [
  "beautifulsoup4>=4.13",
  "fastapi>=0.116",
  "httpx>=0.28",
  "jinja2>=3.1",
  "pydantic-settings>=2.10",
  "python-multipart>=0.0.20",
  "typer>=0.16",
  "uvicorn>=0.35",
]

[project.scripts]
flagwatch = "flagwatch.cli:app"

[dependency-groups]
dev = [
  "axe-playwright-python>=0.1.5",
  "mypy>=1.17",
  "playwright>=1.54",
  "pytest>=8.4",
  "pytest-asyncio>=1.1",
  "ruff>=0.12",
]

[build-system]
requires = ["hatchling"]
build-backend = "hatchling.build"

[tool.pytest.ini_options]
testpaths = ["tests"]

[tool.mypy]
strict = true
packages = ["flagwatch"]

[tool.ruff]
line-length = 100
target-version = "py313"
```

```python
class AiPolicy(StrEnum):
    AI_NATIVE = "ai_native"
    AI_ASSISTED = "ai_assisted"
    HUMAN_ONLY = "human_only"
    UNKNOWN = "unknown"

class Event(BaseModel):
    source: str
    source_id: str
    title: str
    official_url: HttpUrl
    ctftime_url: HttpUrl
    starts_at: datetime
    finishes_at: datetime
    online: bool

    @property
    def key(self) -> str:
        return f"{self.source}:{self.source_id}"

class EventFacts(BaseModel):
    ai_policy: AiPolicy = AiPolicy.UNKNOWN
    ai_policy_reason: str = "No clear AI policy found"
    ai_policy_source: str | None = None
    ai_policy_evidence: str | None = None
    team_max: int | None = None
    divisions: list[str] = Field(default_factory=list)
    schedule_mode: str = "unknown"
    prize_summary: str | None = None

class Criteria(BaseModel):
    require_online: bool = True
    allow_hybrid: bool = True
    max_team_size: int | None = None
    min_duration_hours: int | None = None
    max_duration_hours: int | None = None
    require_prize: bool = False
    minimum_cash_prize: Decimal | None = None
    allowed_schedule_modes: set[str] = Field(default_factory=set)
    minimum_ctftime_weight: Decimal | None = None
    version: int = 1

class MatchResult(BaseModel):
    alert_eligible: bool
    match_reasons: list[str] = Field(default_factory=list)
    rejection_reasons: list[str] = Field(default_factory=list)
```

Use explicit SQLite migrations in `Database.initialize()`. Store source payloads and structured facts as JSON, with indexed event start and policy columns. Set WAL mode and foreign keys on every connection.

- [ ] **Step 4: Run storage tests and static checks**

Run: `uv run pytest tests/test_storage.py -v && uv run ruff check . && uv run mypy src`

Expected: all commands exit 0.

- [ ] **Step 5: Commit the foundation**

```powershell
git add pyproject.toml .gitignore src tests
git commit -m "feat: add Flagwatch storage foundation"
```

### Task 2: CTFtime normalization and Central-time display

**Files:**
- Create: `src/flagwatch/sources/__init__.py`
- Create: `src/flagwatch/sources/ctftime.py`
- Create: `src/flagwatch/time_display.py`
- Create: `tests/fixtures/ctftime_events.json`
- Create: `tests/test_ctftime.py`
- Create: `tests/test_time_display.py`

**Interfaces:**
- Consumes: `Event` and `EventFacts` from `flagwatch.domain`.
- Produces: `CtftimeSource.fetch_events(start, finish)`, `normalize_ctftime_event(payload)`, `format_central_range(event)`, and `duration_label(event)`.

- [ ] **Step 1: Write failing normalization and daylight-saving tests**

```python
def test_normalizes_ctftime_event_and_description_facts(ctftime_payload):
    event, seed = normalize_ctftime_event(ctftime_payload)
    assert event.source_id == "3181"
    assert event.online is True
    assert seed.team_max == 5
    assert seed.divisions == ["Secondary School", "University", "Open"]

def test_formats_summer_event_as_cdt(gaslight_event):
    assert format_central_range(gaslight_event).startswith("Fri, Aug 14 at 7:00 AM CDT")

def test_formats_winter_event_as_cst(winter_event):
    assert "CST" in format_central_range(winter_event)
```

- [ ] **Step 2: Run the tests and confirm the missing-module failures**

Run: `uv run pytest tests/test_ctftime.py tests/test_time_display.py -v`

Expected: collection fails for missing `flagwatch.sources.ctftime` and `flagwatch.time_display`.

- [ ] **Step 3: Implement the bounded API adapter and time formatter**

```python
CENTRAL = ZoneInfo("America/Chicago")

def format_central_range(event: Event) -> str:
    start = event.starts_at.astimezone(CENTRAL)
    finish = event.finishes_at.astimezone(CENTRAL)
    return (
        f"{start:%a, %b} {start.day} at {start:%-I:%M %p %Z} to "
        f"{finish:%a, %b} {finish.day} at {finish:%-I:%M %p %Z}"
    )
```

Implement the Windows-safe hour formatting without relying on `%-I`. Parse ISO timestamps as aware instants. Use the official events endpoint with a maximum 90-day window, a descriptive user agent, a 10-second timeout, and `limit=100`.

- [ ] **Step 4: Run source and time tests**

Run: `uv run pytest tests/test_ctftime.py tests/test_time_display.py -v`

Expected: all tests pass.

- [ ] **Step 5: Commit ingestion**

```powershell
git add src/flagwatch/sources src/flagwatch/time_display.py tests
git commit -m "feat: import CTFtime events"
```

### Task 3: Guarded rule-page fetching and discovery

**Files:**
- Create: `src/flagwatch/fetching.py`
- Create: `src/flagwatch/rule_pages.py`
- Create: `tests/test_fetching.py`
- Create: `tests/test_rule_pages.py`

**Interfaces:**
- Consumes: official URLs from `Event`.
- Produces: `validate_public_url(url, resolver)`, `GuardedFetcher.get_text(url)`, `extract_readable_text(html)`, and `discover_rule_links(base_url, html)`.

- [ ] **Step 1: Write failing SSRF and rule-link tests**

```python
@pytest.mark.parametrize(
    "address",
    ["127.0.0.1", "10.1.2.3", "169.254.169.254", "::1", "fc00::1"],
)
def test_rejects_non_public_destinations(address):
    with pytest.raises(UnsafeUrlError):
        validate_resolved_addresses("https://rules.example/", [address])

def test_discovers_only_bounded_relevant_links():
    html = """
    <a href='/rules'>Rules</a><a href='/faq'>FAQ</a>
    <a href='/news'>News</a><a href='https://other.example/rules'>Other</a>
    """
    assert discover_rule_links("https://ctf.example/", html) == [
        "https://ctf.example/rules",
        "https://ctf.example/faq",
    ]
```

- [ ] **Step 2: Run the tests and confirm the missing-module failures**

Run: `uv run pytest tests/test_fetching.py tests/test_rule_pages.py -v`

Expected: collection fails for missing modules.

- [ ] **Step 3: Implement URL validation and bounded HTML extraction**

```python
def validate_resolved_addresses(url: str, addresses: Sequence[str]) -> None:
    parsed = urlsplit(url)
    if parsed.scheme not in {"http", "https"} or not parsed.hostname:
        raise UnsafeUrlError("Only public HTTP and HTTPS URLs are allowed")
    for raw in addresses:
        address = ip_address(raw)
        if not address.is_global:
            raise UnsafeUrlError(f"Blocked non-public destination for {parsed.hostname}")
```

Use manual redirect handling so every hop is resolved and validated before requesting it. Stop after three redirects, 10 seconds, or 2 MiB. Accept HTML and plain text only. Remove scripts, styles, forms, navigation, repeated whitespace, and hidden content before returning plain text. Discover at most six same-origin links whose visible text or path contains `rules`, `faq`, `terms`, `eligibility`, `prize`, `register`, `conduct`, or `policy`.

- [ ] **Step 4: Run fetching tests**

Run: `uv run pytest tests/test_fetching.py tests/test_rule_pages.py -v`

Expected: all tests pass.

- [ ] **Step 5: Commit safe rule retrieval**

```powershell
git add src/flagwatch/fetching.py src/flagwatch/rule_pages.py tests
git commit -m "feat: fetch official CTF rules safely"
```

### Task 4: Evidence-first fact and AI-policy analysis

**Files:**
- Create: `src/flagwatch/analysis/__init__.py`
- Create: `src/flagwatch/analysis/evidence.py`
- Create: `src/flagwatch/analysis/policy.py`
- Create: `src/flagwatch/analysis/facts.py`
- Create: `src/flagwatch/analysis/llm.py`
- Create: `tests/test_ai_policy.py`
- Create: `tests/test_fact_extraction.py`
- Create: `tests/test_llm_validation.py`

**Interfaces:**
- Consumes: normalized descriptions, prize text, and guarded official-page text.
- Produces: `classify_ai_policy(documents)`, `extract_event_facts(documents, seed)`, `PolicyResult`, and `LlmPolicyExtractor.extract(documents)`.

- [ ] **Step 1: Write failing policy-gate tests**

```python
@pytest.mark.parametrize(
    ("text", "expected"),
    [
        ("All forms of AI usage are allowed.", AiPolicy.AI_NATIVE),
        (
            "Interactive AI assistance is allowed. Fully automated solving agents are prohibited.",
            AiPolicy.AI_ASSISTED,
        ),
        (
            "No LLMs or AI assistants for solving challenges in any way. "
            "LLM-assisted code completion in your IDE is fine.",
            AiPolicy.HUMAN_ONLY,
        ),
        ("Be respectful and do not share flags.", AiPolicy.UNKNOWN),
    ],
)
def test_classifies_ai_policy(text, expected):
    result = classify_ai_policy([EvidenceDocument("https://ctf.example/rules", text)])
    assert result.policy is expected

def test_conflicting_policy_fails_closed():
    result = classify_ai_policy(
        [
            EvidenceDocument("https://ctf.example/rules", "All AI tools are allowed."),
            EvidenceDocument("https://ctf.example/terms", "AI assistants are prohibited."),
        ]
    )
    assert result.policy is AiPolicy.UNKNOWN
    assert result.conflicting is True
```

- [ ] **Step 2: Run analysis tests and confirm missing-module failures**

Run: `uv run pytest tests/test_ai_policy.py tests/test_fact_extraction.py tests/test_llm_validation.py -v`

Expected: collection fails for missing analysis modules.

- [ ] **Step 3: Implement deterministic extraction and strict LLM fallback**

```python
ALERT_ELIGIBLE_POLICIES = {AiPolicy.AI_NATIVE, AiPolicy.AI_ASSISTED}

def classify_ai_policy(documents: Sequence[EvidenceDocument]) -> PolicyResult:
    relevant = relevant_ai_sentences(documents)
    if has_conflicting_permissions(relevant):
        return PolicyResult(policy=AiPolicy.UNKNOWN, conflicting=True, evidence=relevant)
    if prohibits_ai_solving(relevant):
        return PolicyResult(policy=AiPolicy.HUMAN_ONLY, evidence=relevant)
    if allows_ai_with_only_automation_limits(relevant):
        return PolicyResult(policy=AiPolicy.AI_ASSISTED, evidence=relevant)
    if allows_unrestricted_ai(relevant):
        return PolicyResult(policy=AiPolicy.AI_NATIVE, evidence=relevant)
    return PolicyResult(policy=AiPolicy.UNKNOWN, evidence=relevant)
```

Keep precedence fail-closed: direct-solving prohibitions beat code-completion allowances. The LLM extractor runs only for deterministic `unknown`, receives only relevant text, uses DeepSeek V4 Flash through an OpenAI-compatible endpoint, and validates output with `PolicyResult.model_validate_json()`. Its failure returns the deterministic result unchanged. Mechanically normalize smart quotes and dash characters in model text before JSON validation.

Add evidence-backed regular expressions for team maximum, named divisions, rolling or staggered starts, multi-stage events, registration status, and prize summaries. Never replace a known CTFtime fact with a weaker inferred value.

- [ ] **Step 4: Run analysis tests**

Run: `uv run pytest tests/test_ai_policy.py tests/test_fact_extraction.py tests/test_llm_validation.py -v`

Expected: all tests pass.

- [ ] **Step 5: Commit analysis**

```powershell
git add src/flagwatch/analysis tests
git commit -m "feat: classify CTF AI policies"
```

### Task 5: Criteria matching, synchronization, and alert outbox

**Files:**
- Create: `src/flagwatch/matching.py`
- Create: `src/flagwatch/sync.py`
- Create: `src/flagwatch/notifications.py`
- Modify: `src/flagwatch/domain.py`
- Modify: `src/flagwatch/storage.py`
- Create: `tests/test_matching.py`
- Create: `tests/test_sync.py`
- Create: `tests/test_notifications.py`

**Interfaces:**
- Consumes: stored events, extracted facts, `Criteria`, source adapters, fetcher, and policy analyzer.
- Produces: `match_event(event, facts, criteria)`, `SyncService.run()`, `render_alert()`, `queue_alert()`, `deliver_pending()`, and `NotificationSender` protocol.

- [ ] **Step 1: Write failing fail-closed and deduplication tests**

```python
@pytest.mark.parametrize("policy", [AiPolicy.HUMAN_ONLY, AiPolicy.UNKNOWN])
def test_incompatible_policy_never_matches(policy, compatible_event, criteria):
    result = match_event(compatible_event, EventFacts(ai_policy=policy), criteria)
    assert result.alert_eligible is False
    assert any("AI" in reason for reason in result.rejection_reasons)

def test_repeated_sync_queues_one_alert(sync_service, database):
    sync_service.run()
    sync_service.run()
    assert database.count_outbox() == 1

def test_delivery_is_disabled_by_default(database, fake_sender):
    delivered = deliver_pending(database, fake_sender, sending_enabled=False)
    assert delivered == 0
    assert fake_sender.messages == []
```

- [ ] **Step 2: Run matching and sync tests and confirm missing-module failures**

Run: `uv run pytest tests/test_matching.py tests/test_sync.py tests/test_notifications.py -v`

Expected: collection fails for missing modules.

- [ ] **Step 3: Implement hard gates, readable reasons, and outbox keys**

```python
def match_event(event: Event, facts: EventFacts, criteria: Criteria) -> MatchResult:
    rejected: list[str] = []
    matched: list[str] = []
    if facts.ai_policy not in ALERT_ELIGIBLE_POLICIES:
        rejected.append("AI-assisted solving is prohibited or not confirmed")
    if criteria.require_online and not event.online:
        rejected.append("Not an online event")
    if criteria.max_team_size is not None and (
        facts.team_max is None or facts.team_max > criteria.max_team_size
    ):
        rejected.append("Team size does not meet the saved limit")
    if not rejected:
        matched.append("AI-assisted solving is allowed")
    return MatchResult(
        alert_eligible=not rejected,
        match_reasons=matched,
        rejection_reasons=rejected,
    )
```

Use an outbox uniqueness key of event key, criteria version, material fingerprint, channel, and message type. The sync must isolate errors per event, retain last known data, and save a readable job report. Discord uses a webhook POST with a custom user agent. SMTP uses `EmailMessage` and TLS. Both are called only by `deliver_pending()` after the explicit send switch passes.

- [ ] **Step 4: Run matching, sync, and notification tests**

Run: `uv run pytest tests/test_matching.py tests/test_sync.py tests/test_notifications.py -v`

Expected: all tests pass.

- [ ] **Step 5: Commit matching and alerts**

```powershell
git add src/flagwatch/matching.py src/flagwatch/sync.py src/flagwatch/notifications.py tests
git commit -m "feat: match events and queue alerts"
```

### Task 6: Accessible dashboard, settings, evidence, and calendar

**Files:**
- Create: `src/flagwatch/web.py`
- Create: `src/flagwatch/ics.py`
- Modify: `src/flagwatch/domain.py`
- Modify: `src/flagwatch/storage.py`
- Create: `src/flagwatch/templates/base.html`
- Create: `src/flagwatch/templates/dashboard.html`
- Create: `src/flagwatch/templates/event.html`
- Create: `src/flagwatch/templates/settings.html`
- Create: `src/flagwatch/templates/alerts.html`
- Create: `src/flagwatch/static/app.css`
- Create: `src/flagwatch/static/app.js`
- Create: `tests/test_web.py`
- Create: `tests/test_ics.py`

**Interfaces:**
- Consumes: `Database`, match results, time-display functions, and stored evidence.
- Produces: `create_app(settings, database)`, routes `/`, `/events/{key}`, `/settings`, `/alerts`, `/events/{key}.ics`, `/sync`, and `/healthz`.

- [ ] **Step 1: Write failing route and semantic UI tests**

```python
def test_dashboard_keeps_human_only_event_and_suppresses_alert(client, seeded_database):
    response = client.get("/")
    assert response.status_code == 200
    assert "gaslightCTF 2026" in response.text
    assert "Human only" in response.text
    assert "Alert suppressed" in response.text

def test_settings_saves_without_javascript(client):
    response = client.post(
        "/settings",
        data={"require_online": "on", "max_team_size": "6", "max_duration_hours": "72"},
        follow_redirects=False,
    )
    assert response.status_code == 303

def test_health_is_plain_and_database_backed(client):
    assert client.get("/healthz").json() == {"status": "ok", "database": "ok"}
```

- [ ] **Step 2: Run web tests and confirm missing-module failures**

Run: `uv run pytest tests/test_web.py tests/test_ics.py -v`

Expected: collection fails for missing web and ICS modules.

- [ ] **Step 3: Implement server-rendered routes and the evidence-rail design**

```python
@router.get("/", response_class=HTMLResponse)
def dashboard(request: Request, database: Database = Depends(get_database)):
    rows = database.list_event_views()
    return templates.TemplateResponse(
        request=request,
        name="dashboard.html",
        context={"events": rows, "page_title": "Upcoming CTFs"},
    )
```

Use a dark navy base, muted slate panels, cyan links, warm amber unknown states, and coral blocked states. Use a condensed display face only for event titles, a highly readable sans face for content, and a tabular utility face for facts. Fonts must have local fallbacks and the page must remain usable when remote fonts fail.

Include a skip link, header landmark, navigation, main landmark, filter form, event list, and footer. Each event uses an article with a real heading, text status, compact fact list, and a details element for evidence. Settings use fieldsets, legends, labels, help text, and an error summary. The static script may add progressive filtering but cannot own form submission or content access.

Generate standards-compliant UTC ICS with escaped text and CRLF line endings.

- [ ] **Step 4: Run route and calendar tests**

Run: `uv run pytest tests/test_web.py tests/test_ics.py -v`

Expected: all tests pass.

- [ ] **Step 5: Commit the web interface**

```powershell
git add src/flagwatch/web.py src/flagwatch/ics.py src/flagwatch/templates src/flagwatch/static tests
git commit -m "feat: add Flagwatch dashboard"
```

### Task 7: CLI, live sync, browser verification, and operator documentation

**Files:**
- Create: `src/flagwatch/cli.py`
- Create: `tests/test_cli.py`
- Create: `tests/browser/test_dashboard.py`
- Create: `README.md`
- Create: `.env.example`

**Interfaces:**
- Consumes: `Settings`, `Database`, `SyncService`, notification delivery, and `create_app()`.
- Produces: `flagwatch serve`, `flagwatch sync`, `flagwatch deliver`, documented local startup, and verified live dashboard screenshots.

- [ ] **Step 1: Write failing CLI and browser tests**

```python
def test_sync_command_reports_counts(runner, fake_sync_service):
    result = runner.invoke(app, ["sync"])
    assert result.exit_code == 0
    assert "Imported 2 events" in result.stdout
    assert "Queued 1 alert preview" in result.stdout

def test_dashboard_keyboard_and_accessibility(page, live_server):
    page.goto(live_server.url)
    page.keyboard.press("Tab")
    assert page.locator(":focus").get_attribute("href") == "#main-content"
    results = Axe().run(page)
    assert results.violations == []
```

- [ ] **Step 2: Run CLI and browser tests and confirm the failures**

Run: `uv run pytest tests/test_cli.py tests/browser/test_dashboard.py -v`

Expected: collection fails for the missing CLI and browser fixture.

- [ ] **Step 3: Implement commands and local documentation**

```python
@app.command()
def serve(host: str = "127.0.0.1", port: int = 4814) -> None:
    settings = Settings()
    database = Database(settings.database_path)
    database.initialize()
    uvicorn.run(create_app(settings, database), host=host, port=port)

@app.command()
def sync() -> None:
    report = build_sync_service().run()
    typer.echo(f"Imported {report.imported} events. Queued {report.queued} alert preview.")
```

Document `uv sync`, `uv run flagwatch sync`, and `uv run flagwatch serve`. Explain that sending is off by default and that `FLAGWATCH_SEND_ENABLED=true` still requires a valid configured destination. Include environment names only, never values.

- [ ] **Step 4: Perform a real bounded CTFtime sync**

Run: `uv run flagwatch sync`

Expected: exits 0, imports current CTFtime events, analyzes reachable official pages, preserves per-event fetch failures, and sends zero messages.

- [ ] **Step 5: Run the app on the loopback interface without stealing focus**

Run: `uv run flagwatch serve --host 127.0.0.1 --port 4814`

Expected: `GET http://127.0.0.1:4814/healthz` returns HTTP 200 with database status `ok`.

- [ ] **Step 6: Run browser and accessibility checks at desktop and 320 pixels**

Run: `uv run pytest tests/browser -v`

Expected: no axe violations, keyboard checks pass, and no horizontal page overflow at either viewport.

- [ ] **Step 7: Save and inspect screenshots**

Save: `artifacts/flagwatch-dashboard-1440.png` and `artifacts/flagwatch-dashboard-320.png`.

Inspect both images. Fix clipped text, weak hierarchy, confusing badges, missing evidence, poor focus treatment, or overflow, then rerun the browser suite.

- [ ] **Step 8: Run the complete release gate**

Run: `uv run pytest -v && uv run ruff check . && uv run ruff format --check . && uv run mypy src && git diff --check`

Expected: every command exits 0 with no warnings that indicate broken behavior.

- [ ] **Step 9: Commit the verified local application**

```powershell
git add README.md .env.example src tests artifacts
git commit -m "feat: finish local Flagwatch app"
```
