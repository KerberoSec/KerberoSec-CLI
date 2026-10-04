# Flagwatch Scan Signal Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Repair source scanning and expose accurate scan evidence in the public calendar.

**Architecture:** Store a small source-scan record inside each event's existing JSON facts, derive a public aggregate in the snapshot, and render both through the static calendar. The crawler remains bounded, same-origin, SSRF-protected, and fail-closed.

**Tech Stack:** Python 3.13, Pydantic, httpx, BeautifulSoup, SQLite JSON records, static HTML/CSS/JavaScript, Playwright, axe.

## Global Constraints

- No paid model calls or outbound notification delivery in Azure.
- Missing, conflicting, limited, failed, or stale rules never alert.
- Raw source errors stay private.
- Preserve WCAG 2.2 AA and the Kitsune accessibility standard.
- Use ASCII punctuation in user-facing copy.

---

### Task 1: Source scan model and extraction

**Files:**
- Modify: `src/flagwatch/domain.py`
- Modify: `src/flagwatch/rule_pages.py`
- Modify: `src/flagwatch/fetching.py`
- Test: `tests/test_rule_pages.py`
- Test: `tests/test_fetching.py`

**Interfaces:**
- Produces: `SourceScanStatus`, metadata-aware `extract_readable_text`, and `discover_sitemap_rule_links(base_url, xml, limit=6)`.

- [ ] Add failing tests for metadata-only HTML, an empty JavaScript shell, same-origin sitemap filtering, duplicate removal, and XML content support.
- [ ] Run `uv run pytest tests/test_rule_pages.py tests/test_fetching.py -v` and confirm the new tests fail.
- [ ] Add the enum and fact fields, extract title and description metadata without script text, accept XML, and parse bounded sitemap rule URLs.
- [ ] Run the focused tests and confirm they pass.
- [ ] Commit the scanner primitives.

### Task 2: Honest partial and failed scan behavior

**Files:**
- Modify: `src/flagwatch/sync.py`
- Test: `tests/test_sync.py`

**Interfaces:**
- Consumes: `SourceScanStatus` and sitemap discovery from Task 1.
- Produces: per-event `source_scan_status`, `source_scan_reason`, `source_pages_checked`, `source_rule_pages_found`, and `source_checked_at`.

- [ ] Add failing tests proving empty shells are limited, sitemap rules are analyzed, optional page failure keeps usable fresh facts, and homepage failure retains stale facts.
- [ ] Run the focused tests and confirm the new cases fail.
- [ ] Introduce a private scan result value, fetch a bounded sitemap, separate usable partial scans from total failures, and save safe status fields.
- [ ] Run `uv run pytest tests/test_sync.py -v` and confirm it passes.
- [ ] Commit the sync repair.

### Task 3: Additive public scan contract

**Files:**
- Modify: `src/flagwatch/public_snapshot.py`
- Test: `tests/test_public_snapshot.py`
- Modify: `tests/fixtures/public_snapshot.json`

**Interfaces:**
- Produces: `scan_summary` plus additive source-scan fields on every public event.

- [ ] Add failing snapshot tests for aggregate counts, safe reasons, timestamps, and old database defaults.
- [ ] Run the focused tests and confirm failure.
- [ ] Add strict public models and derive counts from the events that enter the public snapshot.
- [ ] Update the browser fixture with realistic scan data.
- [ ] Run the snapshot tests and confirm they pass.
- [ ] Commit the public contract.

### Task 4: Scan strip and event ledger

**Files:**
- Modify: `site/index.html`
- Modify: `site/app.css`
- Modify: `site/app.js`
- Modify: `tests/browser/test_public_calendar.py`

**Interfaces:**
- Consumes: `scan_summary` and per-event source fields from Task 3.
- Produces: the visible scan strip and event scan ledger.

- [ ] Add failing browser expectations for the summary, safe event ledger, narrow layout, keyboard behavior, and axe.
- [ ] Run the focused browser tests and confirm failure.
- [ ] Implement the approved scan strip, event state colors, and ledger with text equivalents.
- [ ] Run browser tests and inspect fresh 1440 px and 320 px screenshots.
- [ ] Run the full Flagwatch verification suite and commit.

### Task 5: Safe deployment

**Files:**
- Modify: `README.md`
- Modify: `scripts/deploy-azure.ps1`
- Test: `tests/test_azure_artifacts.py`

**Interfaces:**
- Produces: deployment verification for the additive API and visible scan strip.

- [ ] Add deployment assertions for notifications and paid AI remaining disabled.
- [ ] Document scan-state meaning and honest limitations.
- [ ] Run tests, Ruff, formatting, mypy, Bicep validation, and dependency audit.
- [ ] Deploy after the compatible Discord bot update and verify API, site, timer, and accessibility live.
