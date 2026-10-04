# Flagwatch Calendar Azure Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the private operator dashboard with a public read-only month calendar and deploy it to isolated Azure serverless resources.

**Architecture:** A static HTML, CSS, and JavaScript calendar reads a sanitized snapshot from an Azure Functions HTTP endpoint. A Python 3.13 timer function reuses Flagwatch ingestion and analysis, stores its working SQLite database and public JSON snapshot in private Blob Storage, and refreshes every six hours.

**Tech Stack:** Python 3.13, Azure Functions v2, Azure Blob Storage, Azure Static Web Apps, vanilla HTML/CSS/JavaScript, FastAPI test helpers, Playwright, axe, pytest, Ruff, and mypy.

## Global Constraints

- Public read-only calendar with no login or public state-changing route.
- Use the approved clean-month design and America/Chicago as the no-JavaScript fallback.
- Detect the browser timezone, ask for confirmation once, and keep a timezone button in the top-right corner.
- Keep every CTF visible regardless of AI policy.
- Never alert or deploy notification credentials in this release.
- Preserve cited AI evidence and fail closed on missing, conflicting, or stale rules.
- Use a new `rg-flagwatch-web-prod` resource group in Central US.
- Do not modify `rg-1337-pwnsp4c3-ctf-2026` or its bot, registry, environment, identity, or storage.
- Keep the frontend usable at 320 px and pass WCAG 2.2 AA checks.
- Do not commit secrets or deployment tokens.

---

### Task 1: Public snapshot contract

**Files:**
- Create: `src/flagwatch/public_snapshot.py`
- Create: `tests/test_public_snapshot.py`

**Interfaces:**
- Consumes: `Database.list_events()` and stored `EventView` objects.
- Produces: `PublicEvent`, `PublicSnapshot`, and `build_public_snapshot(database, generated_at)`.

- [ ] Write a failing test proving the snapshot includes display facts and cited AI evidence but omits raw payloads and analysis errors.
- [ ] Run `uv run pytest tests/test_public_snapshot.py -v` and confirm the missing-module failure.
- [ ] Implement strict Pydantic public models and UTC JSON serialization.
- [ ] Run the focused test, Ruff, and mypy.
- [ ] Commit with `feat: add public calendar snapshot`.

### Task 2: Clean month calendar

**Files:**
- Create: `site/index.html`
- Create: `site/app.css`
- Create: `site/app.js`
- Create: `site/staticwebapp.config.json`
- Create: `tests/browser/test_public_calendar.py`
- Create: `tests/fixtures/public_snapshot.json`

**Interfaces:**
- Consumes: `GET /api/events` returning `PublicSnapshot`.
- Produces: month rendering, month URL state, multi-day entries, crowded-day expansion, selected-day phone list, and event dialog links.

- [ ] Write failing Playwright tests for a Sunday-first six-row calendar, multi-day rendering, month navigation, direct event links, dialog close behavior, and 320 px overflow.
- [ ] Run the browser test and confirm the missing-site failure.
- [ ] Implement semantic static markup, calendar rendering, history state, and native dialog behavior.
- [ ] Run focused browser tests and inspect desktop and mobile screenshots.
- [ ] Commit with `feat: add public CTF month calendar`.

### Task 3: Timezone confirmation

**Files:**
- Modify: `site/index.html`
- Modify: `site/app.js`
- Modify: `site/app.css`
- Modify: `tests/browser/test_public_calendar.py`

**Interfaces:**
- Consumes: browser `Intl.DateTimeFormat().resolvedOptions().timeZone` and the IANA timezone list.
- Produces: first-visit confirmation dialog, persistent timezone selection, top-right timezone button, and localized event times.

- [ ] Write failing browser tests for detected-zone confirmation, saved selection, manual change, and America/Chicago fallback.
- [ ] Run the tests and confirm the missing controls.
- [ ] Implement local-storage state and timezone formatting with native controls.
- [ ] Run the focused browser tests and axe.
- [ ] Commit with `feat: add calendar timezone controls`.

### Task 4: Azure Functions snapshot service

**Files:**
- Create: `azure-functions/function_app.py`
- Create: `azure-functions/host.json`
- Create: `azure-functions/requirements.txt`
- Create: `azure-functions/local.settings.example.json`
- Create: `src/flagwatch/cloud_sync.py`
- Create: `tests/test_cloud_sync.py`
- Create: `tests/test_function_app.py`

**Interfaces:**
- Consumes: Blob Storage container name, managed identity, `SyncService`, and `build_public_snapshot()`.
- Produces: six-hour timer refresh, private SQLite blob persistence, public snapshot blob persistence, and anonymous read-only `/api/events` response.

- [ ] Write failing tests for last-good snapshot retention, blob database round-trip, sanitized HTTP output, cache headers, and timer failure behavior.
- [ ] Run the focused tests and confirm missing modules.
- [ ] Implement Blob-backed synchronization and Functions v2 decorators.
- [ ] Run focused tests, Ruff, and mypy.
- [ ] Commit with `feat: add Azure snapshot functions`.

### Task 5: Azure deployment automation

**Files:**
- Create: `infra/main.bicep`
- Create: `infra/main.bicepparam`
- Create: `scripts/deploy-azure.ps1`
- Create: `tests/test_azure_artifacts.py`
- Modify: `.gitignore`
- Modify: `README.md`

**Interfaces:**
- Consumes: Azure CLI login and the tested `site/` and `azure-functions/` outputs.
- Produces: isolated resource group, storage, Flex Consumption Function App, Static Web App, managed identity role, CORS, six-hour timer configuration, and $10 budget alert.

- [ ] Write failing tests that parse deployment files and enforce resource names, Central US, managed identity, no notification settings, and no references to the existing CTF resource group.
- [ ] Run the test and confirm missing deployment artifacts.
- [ ] Implement Bicep and a non-interactive PowerShell deploy script that validates before each mutation and never prints secrets.
- [ ] Run Bicep build, focused tests, PowerShell parse validation, and documentation checks.
- [ ] Commit with `feat: add isolated Azure deployment`.

### Task 6: Live deployment and release gate

**Files:**
- Modify only when verification finds a defect in files from Tasks 1 through 5.

**Interfaces:**
- Consumes: tested deployment artifacts and current Azure CLI session.
- Produces: live public calendar URL and verified scheduled refresh path.

- [ ] Inspect current Azure subscription, target name availability, relevant provider registrations, and resource-group absence.
- [ ] Run the deploy script and capture resource IDs without exposing tokens.
- [ ] Seed the blob from the verified local database and publish the static frontend.
- [ ] Verify the Function API, live calendar, timezone dialog, month navigation, event dialog, 320 px layout, and axe results.
- [ ] Recheck the new resource group after deployment and confirm no resources changed in `rg-1337-pwnsp4c3-ctf-2026`.
- [ ] Run `uv run pytest -v`, `uv run ruff check .`, `uv run ruff format --check .`, `uv run mypy src`, `az bicep build --file infra/main.bicep`, and `git diff --check`.
- [ ] Commit fixes, fast-forward local `main`, rerun the merged-tree tests, and record the live URL in the session note.
